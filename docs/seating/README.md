# Projektni gosti i seating — paket za pregled

2026-10-08. Model prihvaćen; korisnik je instalirao SQL paket i regenerirao DB tipove. Read-only provjere prošle su; lokalni flag prethodno je uključen uz korisnikovo odobrenje; hosted environment ovom doradom nije mijenjan. 2D editor V1 je implementiran; ispis i 3D ostaju za kasnije.

## Gdje što naći

- [install/README.md](install/README.md): promjene po koracima i jedinstvena transakcija.
- [definitions/README.md](definitions/README.md): jedna mapa po tablici kao SQL Editor; table, constraints, indexes, rls, grants, trigger, verify i funkcije. Definicije spremati za pregled, ne ponovno izvršavati.
- src/features/project-guests: regenerirani DB tipovi, member client, eksplicitno povezivanje, project person upisi i RSVP resolver.
- src/features/seating: Konva editor V1, React paneli, postojeće server actions i RLS repositories.
- Postojeći invitation-guests: nadograđene postojeće forme i RSVP detalji, upozorenje zajedničkog renamea i RSVP sukoba. Nema zasebne project guest stranice ili tablice u UI-u.

## Model

project_guests je stabilni identitet unutar projekta. Ista imena dozvoljena su; nema name UNIQUE niti automatskog spajanja. invitation_guests zadržava vlastiti id i project/person vezu, recipient/primary/group/pozivničke notes. UNIQUE(invitation_id,project_guest_id) daje jedno sudjelovanje osobe po pozivnici. Grupe ostaju invitation-scoped, ne migriraju se u globalne grupe.

Ime i prezime uređuju se samo u project_guests. Za kompatibilnost postojeća invitation_guests name polja ostaju izvedene DB kopije: before trigger ih uzima iz osobe, after project-person rename trigger osvježava sve invitation kopije. Postojeći update_invitation_guest RPC prvo ažurira osobu pa group/notes. Browser ne može pisati kopije izravno. To je svjesna izmjena ranijeg nacrta koji je predlagao kasnije dropanje name stupaca: kompatibilni javni output i recipient RPC-i ostaju bez promjene. UI upozorava da rename vrijedi u svim pozivnicama.

seating_plans pripada projektu i može odabrati nula/jednu rsvp_invitation_id. seating_plan_guests izričito odabire sudionike; novi projektni gost nije automatski sudionik. seating_assignments preko composite FK-a zahtijeva postojeći plan membership i stol iz istog projekta/plana. Jedan gost ima najviše jedan stol po planu. V1 round/rectangle stolovi, centimetri, rotacija i kapacitet; bez seats/3D/novih domaina.

## RSVP i generic prijave

RSVP status/answers ostaju na izvornoj pozivnici, nikad globalni. Personalizirani resubmit i dalje mijenja response guest retke, ali ne mijenja invitation person ID i seating.

Generic prijava ostaje originalni name/answer snapshot. Korisnik bira postojeću osobu ili stvara novu; link RPC atomskim upisom stvara/reuse invitation membership bez promjene postojećeg recipienta. UNIQUE(response_id,project_guest_id) i response guest PK odbijaju duplikat veze u jednoj predaji. Generic tip dodatno provjerava DB trigger. Postojeći guest-source CHECK ne mijenja se. Unlink ostavlja originalni odgovor i osobu; promjena veze traži prethodni eksplicitni unlink, ne premješta mjesta.

Resolver koristi samo odabranu pozivnicu: personalized status ima prednost, ali sukob s bilo kojim povezanim generic odgovorom OBAVEZNO se prikazuje. Bez personalized uzima zadnji generic submitted_at uz upozorenje na sukobe; isti timestamp s različitim statusima daje nejasan status. Bez odgovora pending; bez invitation veze posebno hasInvitationLink=false; bez izvora attendance prazno. Promjena RSVP izvora/statusa ne mijenja membership ili dodjelu.

## Brisanje i arhiviranje

- Archive person zadržava veze i mjesta; nove invitation/generic/plan veze i nove dodjele odbijene. Restore dopušten. Postojeći RSVP može se predati; archive nije zatvaranje pozivnice. UI picker skriva arhivirane osobe; budući editor treba označiti arhivirane sudionike.
- Owner-only hard delete osobe moguće je samo bez invitation/generic/plan veza; FK NO ACTION sprječava tiho brisanje povijesti.
- Delete invitation guest čuva person i seating; personalized odgovor cascadea kao i ranije. Generic link se uklanja, originalna generic prijava ostaje nepovezana. Postojeći empty-recipient deletion/primary replacement sačuvani su iz live funkcije.
- Delete invitation briše invitation podatke, ali samo rsvp_invitation_id plana postaje NULL; project_id/person/plan membership/dodjele ostaju. Plan trigger povećava revision pri gubitku izvora.
- Delete table uklanja dodjele, ne sudionike; remove participant uklanja njegovo mjesto, ne osobu.
- Delete plan uklanja njegova mjesta/stolove/sudionike, ne projektne osobe. Delete project cascadea sve projektne entitete; INITIALLY DEFERRED NO ACTION provjerava preostale veze na COMMIT-u; person delete RPC dodatno odmah odbija povezanu osobu.

## Migracija

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

Provjere ove dorade: TypeScript i ciljani ESLint PASS; production build PASS. Puni lint ima 6 nepovezanih grešaka i 4 upozorenja, navedene u CHECKS.md. Browser tok iza flaga još nije provjeren.

Izbor postojeće osobe prikazuje samo ime za jedinstvena imena. Kod istih imena dodaje nazive povezanih pozivnica, a kratki ID samo ako oznake i dalje nisu jedinstvene. Već povezane osobe isključuju se prema project_guest_id i postojećem invitation membershipu; imena se nikada ne koriste za povezivanje ili isključivanje.

Prva funkcionalna verzija 2D editora i ručni testni koraci: [EDITOR.md](EDITOR.md). Postojeći guest/recipient/RSVP frontend korisnik je ručno provjerio prije ove faze.

UX: /seating je pregled kartica i Novi raspored modal, /seating/[planId] je zaseban editor. Zajednički features/editor shell/header/status/sidebar/mobile panel ponovno su iskorišteni; canvas zauzima glavni ekran, a postavke su u modalu. Detalji i ručni koraci: EDITOR.md.

Canvas dorada: izravni resize/rotacija/pomicanje stolova i prostorije, Ruka/Space i pinch, grupirani gosti s povlačenjem ili tap-odabirom stola, te stolice prema spremljenom kapacitetu. Dodaj gosta uključuje postojeću ili novu osobu u plan. Nova osoba + uključivanje koriste dva RPC-a uz eksplicitni prikaz djelomičnog/nejasnog ishoda; bez novog SQL-a ili paketa. Detalji, granice i mobilne ručne provjere: [EDITOR.md](EDITOR.md).

Panel seating editora sada je lijevo, kao na pozivnicama i digitalnom albumu. Prostorija ima resize ručke na svih osam položaja; lijevi/gornji rub mijenjaju lokalni prikaz početka prostorije uz nepromijenjene cm koordinate stolova i isti dimensions RPC.
