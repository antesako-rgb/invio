# Projektni gosti i seating

Database-as-Code postupak je u [supabase/README.md](../../supabase/README.md).
Ovdje ostaju opis domene, prijelazne definicije i povijest instalacije koju
koriste postojeći testovi. Nema potrebe održavati definicije u SQL Editor folderima.
Stare instalacije ne izvršavati ponovno; za novu promjenu slijediti novi workflow.

2026-10-11. Model prihvaćen; korisnik je instalirao osnovni SQL paket i nadogradnju 006 te regenerirao DB tipove s seat_number/novim RPC-em. Read-only provjere baze prošle su. 2D editor sada podržava trajnu dodjelu konkretnoj stolici i ime iz project_guests uz mjesto. Lokalni flag prethodno je uključen uz korisnikovo odobrenje; environment, paketi i baza ovom frontend doradom nisu mijenjani. Ispis i 3D ostaju za kasnije.

## Gdje što naći

- [install/README.md](install/README.md): povijest osnovne instalacije i kasnijih nadogradnji, ne uputa za ponavljanje na DEV-u.
- [definitions/README.md](definitions/README.md): lokalne prijelazne definicije nepokrivene domene i izvori postojećih testova.
- src/features/project-guests: regenerirani DB tipovi, member client, eksplicitno povezivanje, project person upisi i RSVP resolver.
- src/features/seating: Konva editor V1, React paneli, postojeće server actions i RLS repositories.
- Postojeći invitation-guests: nadograđene postojeće forme i RSVP detalji, upozorenje zajedničkog renamea i RSVP sukoba. Nema zasebne project guest stranice ili tablice u UI-u.

## Model

project_guests je stabilni identitet unutar projekta. Ista imena dozvoljena su; nema name UNIQUE niti automatskog spajanja. invitation_guests zadržava vlastiti id i project/person vezu, recipient/primary/group/pozivničke notes. UNIQUE(invitation_id,project_guest_id) daje jedno sudjelovanje osobe po pozivnici. Grupe ostaju invitation-scoped, ne migriraju se u globalne grupe.

Ime i prezime uređuju se samo u project_guests. Za kompatibilnost postojeća invitation_guests name polja ostaju izvedene DB kopije: before trigger ih uzima iz osobe, after project-person rename trigger osvježava sve invitation kopije. Postojeći update_invitation_guest RPC prvo ažurira osobu pa group/notes. Browser ne može pisati kopije izravno. To je svjesna izmjena ranijeg nacrta koji je predlagao kasnije dropanje name stupaca: kompatibilni javni output i recipient RPC-i ostaju bez promjene. UI upozorava da rename vrijedi u svim pozivnicama.

seating_plans pripada projektu i može odabrati nula/jednu rsvp_invitation_id. seating_plan_guests izričito odabire sudionike; novi projektni gost nije automatski sudionik. seating_assignments preko composite FK-a zahtijeva postojeći plan membership i stol iz istog projekta/plana. Jedan gost ima najviše jedan stol i jednu konkretnu stolicu po planu. Nullable seat_number razlikuje osobu za stolom bez mjesta od osobe na određenoj stolici. UNIQUE(plan_id,table_id,seat_number) sprječava dvije osobe na istoj stolici; NULL redci ostaju dopušteni. [006 paket](install/README.md#006--konkretne-stolice-na-već-instaliranom-modelu) instalirao je korisnik, agent je read-only potvrdio SQL stanje, a frontend koristi regenerirane tipove i instalirani RPC. Definitions opisuju završni model. Round/rectangle stolovi, centimetri, rotacija i kapacitet ostaju; nema 3D ili novih domena.

## RSVP i generic prijave

RSVP status/answers ostaju na izvornoj pozivnici, nikad globalni. Personalizirani resubmit i dalje mijenja response guest retke, ali ne mijenja invitation person ID i seating.

Generic prijava ostaje originalni name/answer snapshot. Korisnik bira postojeću osobu ili stvara novu; link RPC atomskim upisom stvara/reuse invitation membership bez promjene postojećeg recipienta. UNIQUE(response_id,project_guest_id) i response guest PK odbijaju duplikat veze u jednoj predaji. Generic tip dodatno provjerava DB trigger. Postojeći guest-source CHECK ne mijenja se. Unlink ostavlja originalni odgovor i osobu; promjena veze traži prethodni eksplicitni unlink, ne premješta mjesta.

Resolver koristi samo odabranu pozivnicu: personalized status ima prednost, ali sukob s bilo kojim povezanim generic odgovorom OBAVEZNO se prikazuje. Bez personalized uzima zadnji generic submitted_at uz upozorenje na sukobe; isti timestamp s različitim statusima daje nejasan status. Bez odgovora pending; bez invitation veze posebno hasInvitationLink=false; bez izvora attendance prazno. Promjena RSVP izvora/statusa ne mijenja membership ili dodjelu.

## Brisanje i arhiviranje

- Archive person zadržava veze i mjesta; nove invitation/generic/plan veze i nove dodjele odbijene. Restore dopušten. Postojeći RSVP može se predati; archive nije zatvaranje pozivnice. Picker za uključivanje skriva arhivirane osobe. Već uključeni arhivirani sudionik ostaje označen u editoru i smije osloboditi svoju stolicu uz isti stol, unassign ili napustiti plan; ne smije dobiti ili premjestiti dodjelu.
- Owner-only hard delete osobe moguće je samo bez invitation/generic/plan veza; FK NO ACTION sprječava tiho brisanje povijesti.
- Delete invitation guest čuva person i seating; personalized odgovor cascadea kao i ranije. Generic link se uklanja, originalna generic prijava ostaje nepovezana. Postojeći empty-recipient deletion/primary replacement sačuvani su iz live funkcije.
- Delete invitation briše invitation podatke, ali samo rsvp_invitation_id plana postaje NULL; project_id/person/plan membership/dodjele ostaju. Plan trigger povećava revision pri gubitku izvora.
- Delete table uklanja dodjele, ne sudionike; remove participant uklanja njegovo mjesto, ne osobu.
- Delete plan uklanja njegova mjesta/stolove/sudionike, ne projektne osobe. Delete project cascadea sve projektne entitete; INITIALLY DEFERRED NO ACTION provjerava preostale veze na COMMIT-u; person delete RPC dodatno odmah odbija povezanu osobu.

## Povijesna početna migracija

Svaki postojeći invitation_guest dobiva zaseban project_guest s istim UUID-em radi determinističke veze; invitation_guest.id nikada se ne mijenja. Nema deduplikacije među pozivnicama. Stare notes ostaju pozivničke; globalne notes počinju NULL. Generic links početno prazni, originalni generic rows/imena/odgovori netaknuti. Grupe/group_id, recipient veze, primary flags i personalized odgovori ne mijenjaju se. Seating počinje prazan.

Paket zadržava SELECT RLS + autorizirane user RPC upise. SECURITY DEFINER, prazan search_path; auth.uid/member obvezni, hard delete owner-only. Private helper EXECUTE nije dostupan client rolama. Novi mutable guest/seating RPC-i serijaliziraju upise zaključavanjem projekta pa plana; expected_revision odbija zastarjeli editor. Capacity shrink/overfill odbijeni. Ovo je konzervativna V1 serijalizacija na projekt, ne concurrency optimizacija. Postojeći recipient/submit RPC-i sačuvali su svoje lockove; izolirano testirati međudjelovanje.

PROJECT_GUESTS_ENABLED=false/unset drži application novosti isključene do instalacije. database.types.ts je regeneriran nakon instalacije; aplikacija koristi te tipove. Editor V1 je na projektnoj seating ruti; vidi [EDITOR.md](EDITOR.md).

## Provjere i granice

TypeScript/ESLint i lokalni RSVP/constraint paket testovi provjeravaju aplikaciju i tekst paketa. Izolirano PostgreSQL izvršavanje, backfill, cascade i konkurentna dodjela zadnjeg mjesta sada su provjereni; opseg i ograničenja su u [CHECKS.md](CHECKS.md).

Prije production: test existing IDs/names/groups/primary/recipient očuvanja, create-new/existing, generic explicit link/unlink, resubmit bez gubitka mjesta, cross-project i anonymous odbijanje, plan membership FK, archive/assign race, capacity concurrent moves, revision conflicts, delete invitation uz unchanged project_id/mjesta, delete project cascade. Public RSVP JSON prije/poslije mora imati isti shape/values za postojeće podatke. Ne čitati niti spremati tokene u test izvještaje.

## DB predlošci rasporeda

Integrirani su seating_templates prema postojećem invitation_templates obrascu. Detalji, administratorska granica i primjeri: [TEMPLATES.md](TEMPLATES.md). Predložak atomskim kopiranjem stvara samo novi plan i stolove; ne sadrži goste/RSVP/dodjele i ne mijenja postojeće planove.

Geometrija i generički objekti prostora: [GEOMETRY_AND_SPACE.md](GEOMETRY_AND_SPACE.md). x/y su centar u cm; SQL i TS provjeravaju rotirane granice. Mladenački/VIP/govorniški stol su obični stolovi s nazivom, ne poseban wedding domain.

## Postojeći frontend nakon instalacije

Nema paralelnog guest sučelja. Postojeća forma dodavanja gosta iza PROJECT_GUESTS_ENABLED nudi „Dodaj novu osobu” i „Odaberi postojećeg gosta”. Izbor sadrži samo aktivne osobe istog projekta koje još nisu povezane s tom pozivnicom; ista imena razlikuju se kratkim ID-em. Oba toka koriste autorizirane RPC-e, bez izravnih tabličnih upisa. Nova osoba stvara se kroz postojeći create_invitation_guest RPC i DB person trigger; izbor postojeće koristi link_existing_invitation_guest.

Repository gostiju čita povezani project_guests identitet. Kada je flag uključen, prikaz, pretraga, forma uređivanja i recipient prikazi dobivaju ime/prezime iz te osobe. Pozivničke bilješke, grupa, recipient i primary ostaju u invitation_guests. Zajedničko uređivanje imena jasno je označeno u postojećoj formi. Uklanjanje gosta iz pozivnice ima objašnjenje da osoba ostaje sačuvana.

Generički RSVP zadržava originalni name snapshot i odgovore. Povezivanje postojeće ili nove osobe nalazi se u postojećim detaljima generičke prijave, uz svaku prijavljenu osobu. Nema automatskog name matcha. Uklanjanje veze traži potvrdu i čuva odgovor/osobu. Personalizirani RSVP tok i javni output nisu mijenjani; kombinirani status i sukobi prikazuju se samo unutar iste pozivnice.

database.types.ts je jedini schema izvor; privremeni seatingDatabase.contract.ts uklonjen je. Uska nullable RPC prilagodba čuva SQL NULL (npr. unassign) jer generirani scalar argumenti ne prikazuju tu nullability; actions prvo provjeravaju runtime sheme. Ta ranija frontend integracija nije mijenjala bazu. Naknadno je korisnik instalirao Konvu, lokalni flag je uključen uz njegovo odobrenje i implementiran je seating editor; aktualno stanje je u EDITOR.md.

Ranija provjera guest/RSVP integracije: TypeScript, ciljani ESLint i production build PASS; tadašnji puni lint prijavio je 6 nepovezanih grešaka i 4 upozorenja, zapisane u CHECKS.md. Korisnik je postojeće guest/recipient/RSVP tokove potom ručno provjerio. Aktualne rezultate chair frontend provjera i granice dostupnog browsera vidi u [CHECKS.md](CHECKS.md); novi live frontend tok agent nije ručno izvršavao.

Izbor postojeće osobe prikazuje samo ime za jedinstvena imena. Kod istih imena dodaje nazive povezanih pozivnica, a kratki ID samo ako oznake i dalje nisu jedinstvene. Već povezane osobe isključuju se prema project_guest_id i postojećem invitation membershipu; imena se nikada ne koriste za povezivanje ili isključivanje.

Prva funkcionalna verzija 2D editora i ručni testni koraci: [EDITOR.md](EDITOR.md). Postojeći guest/recipient/RSVP frontend korisnik je ručno provjerio prije ove faze.

UX: /seating je pregled kartica i Novi raspored modal, /seating/[planId] je zaseban editor. Zajednički features/editor shell/header/status/sidebar/mobile panel ponovno su iskorišteni; canvas zauzima glavni ekran, a postavke su u modalu. Detalji i ručni koraci: EDITOR.md.

Canvas dorada: pomicanje/rotacija stolova standardne geometrije i resize prostorije, Ruka/Space i pinch, grupirani gosti s povlačenjem ili tap-odabirom stola, te stolice prema spremljenom kapacitetu. Dodaj gosta uključuje postojeću ili novu osobu u plan. Nova osoba + uključivanje koriste dva RPC-a uz eksplicitni prikaz djelomičnog/nejasnog ishoda; bez novog SQL-a ili paketa. Detalji, granice i mobilne ručne provjere: [EDITOR.md](EDITOR.md).

Panel seating editora sada je lijevo, kao na pozivnicama i digitalnom albumu. Prostorija ima resize ručke na svih osam položaja; lijevi/gornji rub mijenjaju lokalni prikaz početka prostorije uz nepromijenjene cm koordinate stolova i isti dimensions RPC.

Stolovi više nemaju slobodni resize. Novi okrugli stolovi koriste isti promjer; novi pravokutni stolovi počinju kao kvadrat s 8 mjesta (po dvije stolice u sredini svake strane), a od 9. mjesta produljuju samo širinu uz istu dubinu; broj mjesta se uređuje zasebno. U postavkama plana moguće je izričito ujednačiti postojeće stolove istog oblika, uz geometrijsku provjeru, potvrdu i postojeće RPC-e/revizije. Batch nije jedna transakcija; djelomičan/nejasan ishod zaustavlja daljnje upise do reload-a.

Dodavanje stola sada otvara dijalog s nazivom, oblikom, brojem mjesta (brzi izbor 6/8/10/12, unos 1–100) i živim pregledom. Stol se zapisuje tek nakon potvrde kroz postojeći RPC/reviziju; pregled i canvas dijele prikaz i geometriju. Nevaljan/prevelik stol se ne sprema, a greška/konflikt dostupni su u dijalogu. Detalji i ručna provjera: [EDITOR.md](EDITOR.md).

Odabrani stol može se duplicirati iz svojstava ili toolbar ikone kroz postojeći create RPC/reviziju. Kopija čuva dimenzije, kapacitet i rotaciju, dobiva novi naziv/ID i počinje bez gostiju. Traži mjesto blizu izvora bez automatskog fit-a. Ispunjene stolice i legenda sada prikazuju stvarne konkretne dodjele, a ukupni N / kapacitet uključuje i osobe za stolom bez stolice. Nova kopija, preview i template ne kopiraju dodjele. Detalji i ručni koraci: [EDITOR.md](EDITOR.md).

Dodjela stolici dostupna je klikom/tapom stolice ili gosta, kroz zajednički obrazac u desktop panelu odnosno mobilnom dijalogu, s izričitom potvrdom, brojevima i punim imenima. Precizan desktop drag na stolicu sprema mjesto; mobilni/touch drag i drop na tijelo stola otvaraju predodabrani obrazac. Aktualni UI zahtijeva konkretnu ručnu ili automatsku stolicu za gosta za stolom; sudionici bez stola ostaju neraspoređeni. Stabilni brojevi čuvaju identitet pri 8 → 9 → 17, rotaciji i ujednačavanju. Imena se crtaju uspravno pri dovoljnom zoomu i dolaze iz project_guests. Smanjenje kapaciteta poštuje ukupnu zauzetost i najviši zauzeti broj. Zauzeto mjesto odbija premještanje; swap i automatsko spajanje ne postoje. Konflikt/nejasan ishod blokira upise do reload-a. Model, kompatibilnost i povijest pregleda: [SEAT_ASSIGNMENTS_REVIEW.md](SEAT_ASSIGNMENTS_REVIEW.md); detaljni desktop/mobilni/HR-EN testni koraci i granice provjere: [EDITOR.md](EDITOR.md). Live frontend RPC tokovi nisu izvršeni od strane agenta.


Povezani UX: Gosti/Stolovi, stabilan prirodni redoslijed, filtri i sačuvane otvorene grupe. Dodjela koristi jednu formu u desktop panelu ili mobilnom donjem dijalogu; mobile/touch drop prvo otvara odabir, a potvrda sprema konkretnu automatsku ili ručnu stolicu. Detalji stola objedinjuju goste, dodavanje, približavanje i sklopive postavke. Stari canvas placement način uklonjen je. Postojeći RPC-i, revizije, RSVP i create/include ponašanje ostaju. Aktualni koraci 31–32 i rezultati su u EDITOR.md/CHECKS.md.


Automatska i skupna dodjela sada koristi instalirani 007 RPC: [BULK_SEATING.md](BULK_SEATING.md). Dodaj goste omogućuje pretraživ višestruki odabir i pregled konkretnih mjesta, premještanja i kapaciteta. Odgođene stolice i pripadajući UI uklonjeni su prema korisnikovoj potvrdi prazne baze. Nema migracije gostiju ili novih tablica.


Detalji stola prikazuju sve numerirane stolice, slobodne i zauzete. Dodaj goste koristi jedan popis s kućicama i jednu potvrdu za cijelu grupu; slobodne stolice dodjeljuju se automatski. Prikaži sve goste omogućuje izbor s drugih stolova, a neobvezna kućica točnih stolica dodaje select uz svaki označeni redak. Nema radio načina, zasebnih kartica odabira ili dodatnog koraka pregleda. Pojedinačna dodjela koristi polje Stolica s automatskim ili konkretnim izborom; klik stolice preodabire njezin broj. Automatski tok koristi instalirani 007, a točno grupno spremanje 008. Oba koriste database.types.ts bez privremenog schema ugovora, migracije gostiju ili promjene tablica. [BULK_SEATING.md](BULK_SEATING.md) sadrži aktualni postupak i provjere.
