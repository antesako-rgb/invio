# Gosti na konkretnim stolicama — pregled modela i implementacije

Datum: 2026-10-11. Prema izvornom pregledu pripremljen je [inkrementalni install 006](install/README.md#006--konkretne-stolice-na-već-instaliranom-modelu) i usklađene definitions. Točna SQL nadogradnja prošla je 40 izoliranih scenarija na PGlite / PostgreSQL 18.3. Korisnik je potom instalirao 006; agent je read-only provjerom live PostgreSQL 17.6 baze potvrdio da svi DB dijelovi odgovaraju paketu. Korisnik je regenerirao database.types.ts s seat_number i novim RPC-em. Postojeći frontend sada koristi trajne chair dodjele i imena uz njih, bez dodatnog paketa, promjene baze ili paralelnog guest sučelja. Instalirane 001–004 i 006 ne treba ponovno izvršavati. Ovaj dokument čuva obrazloženje modela i opisuje implementirani tok; live frontend upisi i desktop/touch vizualni testovi nisu izvršeni od strane agenta.

## Što imamo

seating_assignments sprema project_id, plan_id, project_guest_id, table_id i nullable seat_number. PRIMARY KEY(plan_id,project_guest_id) jamči jedan stol po gostu u planu; composite FK-i vežu dodjelu uz sudionika i stol istog projekta/plana. RLS omogućuje member SELECT, upisi idu kroz autorizirane SECURITY DEFINER RPC-e s praznim search_pathom i revizijom plana.

project_guests je izvor imena/prezimena. Ime se ne kopira u dodjelu niti stol. Canvas računa položaje iz oblika, kapaciteta i geometrije, a boju/ime iz konkretnog seat_number. Prije ove nadogradnje prvih N ispunjenih stolica označavalo je samo broj gostiju za stolom; taj prikaz uklonjen je. Index render niza nije spremljena veza s osobom jer bi se mogao promijeniti pri produljenju pravokutnika ili promjeni redoslijeda podataka.

## Instalirani minimalni DB model

Za sadašnji model jednakih stolica dovoljan je dodatni nullable integer seat_number u seating_assignments. Mjesto je identificirano parom (table_id,seat_number); zasebna seating_seats tablica nije potrebna. Takva tablica imala bi smisla za individualne pozicije/vrste/blokiranje pojedinih stolica, što nije dio ove verzije.

| Promjena | Svrha |
| --- | --- |
| seating_assignments.seat_number integer NULL | NULL znači gost je za stolom, ali još nema konkretnu stolicu. |
| CHECK(seat_number IS NULL OR seat_number BETWEEN 1 AND 100) | Opći raspon mjesta. |
| UNIQUE(plan_id,table_id,seat_number) | Jedna osoba na konkretnom mjestu. Više NULL vrijednosti ostaje dopušteno. |
| Private assignment guard | Broj mora biti aktivno mjesto odabranog stola, odnosno <= capacity; provjera i pri promjeni table_id. |
| Private table guard | Odbiti smanjenje koje uklanja zauzeto mjesto i promjenu oblika dok postoje konkretne dodjele. |

DDL dio instalirane 006 nadogradnje prikazan je radi objašnjenja. Ovo nije zasebna skripta za ponovno izvršavanje:

```sql
-- ILUSTRACIJA instaliranog modela. Ne izvršavati ponovno; puni paket je install/006.
alter table public.seating_assignments add column seat_number integer;
alter table public.seating_assignments add constraint seating_assignments_seat_range
  check (seat_number is null or seat_number between 1 and 100);
alter table public.seating_assignments add constraint seating_assignments_one_guest_per_seat
  unique (plan_id, table_id, seat_number);
```

CHECK ne može sam provjeriti kapacitet druge tablice. Instalirani RPC i guardovi pokrivaju taj odnos. Aplikacijski upisi zadržavaju zaključavanje projekta pa plana i provjeru expected revision; UNIQUE dodatno štiti od dvostruke dodjele. Browser DML grants nisu dodani, private helperi nisu dostupni klijentima.

## Stabilni brojevi mjesta

Ne koristiti index iz chairPositions niza kao spremljeni identitet: redovi pravokutnika imaju promjenjivu duljinu, pa dodavanje gornje stolice pomiče indekse desnog/donjeg/lijevog reda.

Implementirano determinističko numeriranje, zajedničko rendereru, hit-testu i izboru u panelu:

- Okrugli: 1..capacity, početak gore, dalje u smjeru kazaljke na satu u lokalnim koordinatama. Promjena kapaciteta mijenja kutni razmak, ali sačuvani broj ostaje isti.
- Pravokutni krajevi: lijevo 1 i 3, desno 2 i 4, prema postojećem popunjavanju krajeva za kapacitete 1–4.
- Pravokutni dugi redovi: gore 5,7,9,...; dolje 6,8,10,..., svaki red u stalnom lokalnom smjeru. Broj na istoj strani ne mijenja se pri produljenju. Razmak i položaj stolice duž stranice smiju se prilagoditi novoj duljini/redovima.
- Primjer 8 mjesta: lijevo [1,3], desno [2,4], gore [5,7], dolje [6,8]. Deveto mjesto dodaje se gore kao 9, bez premještanja gostiju na druge strane.
- Rotacija i pomicanje stola transformiraju položaje; seat_number ostaje isti. Dimenzije i ujednačavanje ne prenumeriraju mjesta.

Aktivni brojevi uvijek su točno 1..capacity. chairPositions i getSeatSide u zajedničkom canvasInteraction helperu definiraju brojeve/položaje; dijalog ih prikazuje s lokalnom stranom. Brojevi se crtaju i na odabranom stolu kad je stolica dovoljno velika na ekranu. Prikaz, hit-test i ime koriste isti identitet, bez drugog neovisnog izračuna.

## RPC-i i kompatibilnost

Instalirani public.assign_seating_guest_to_seat(p_plan_id uuid,p_revision bigint,p_guest_id uuid,p_table_id uuid,p_seat_number integer) RETURNS bigint vraća novu reviziju. Funkcija koristi postojeće member ovlasti, plan membership, projektni identitet, archive pravila, kapacitet i lockove. Shared assignment helper drži iste provjere za stari i novi tok. Frontend action provjerava ulaz shemom iz regeneriranih tipova, koristi user Supabase client i mapira occupied/range/capacity/archive/membership greške u HR/EN poruke.

| Ulaz/radnja | Ishod |
| --- | --- |
| Stol + slobodan seat_number | Atomskom dodjelom ili premještanjem gost dobiva to mjesto. |
| Stol + zauzet seat_number | Jasna greška; stara dodjela ostaje sačuvana. Nema automatskog istiskivanja drugog gosta. |
| Isti stol + NULL seat_number | Oslobodi konkretnu stolicu, zadrži gosta za tim stolom. |
| Drugi stol + NULL seat_number | Premjesti za stol bez određenog mjesta, uz postojeću provjeru kapaciteta. |
| NULL stol + NULL seat_number | Ukloni cijelu dodjelu, gost ostaje sudionik plana. |
| NULL stol + broj mjesta | Odbij kao nevaljan ulaz. |

Arhivirani gost ne može dobiti novo mjesto/stol. Oslobađanje njegovog postojećeg mjesta uz isti stol i uklanjanje dodjele dopušteni su u panelu/dijalogu i RPC-u; seat NULL ne zaobilazi archive provjeru za novo uključivanje/premještanje.

Postojeći assign_seating_guest(uuid,bigint,uuid,uuid) i njegov output zadržani su radi kompatibilnosti. Njegov table-only tok:

- inserta eksplicitno navedene stupce, umjesto positional VALUES;
- pri pozivu za isti stol čuva postojeći seat_number;
- pri premještanju na drugi stol čisti seat_number u istom atomskom upisu;
- pri unassign-u briše dodjelu.

manage_seating_table zadržava signature/output i tijelo; njegov UPDATE aktivira seat table guard. Primjer: gost sjedi na mjestu 8, a ukupno je samo 2 gosta za stolom. Smanjenje 8 → 7 odbija se iako occupancy <= 7. Panel unaprijed onemogućuje − ispod max(1, ukupni broj dodjela, najviši zauzeti seat_number) i navodi zauzeti broj. Prvo treba premjestiti gosta ili osloboditi to mjesto. Promjena oblika uz konkretne dodjele također se odbija radi različitog numeriranja.

Seat swap nije dio prvog koraka. Za zamjenu dva zauzeta mjesta bio bi potreban poseban atomski postupak/RPC; ne izvoditi niz client poziva koji mogu ostaviti djelomičan ishod.

## Postojeći podaci i puštanje u rad

Sve postojeće dodjele ostaju na istim stolovima uz seat_number=NULL. Nema automatskog raspoređivanja po imenima, redoslijedu queryja ili obojenim ikonama. Projekti, gosti, recipienti, pozivnice, oba RSVP toka i seating membership ostaju sačuvani.

Zasebni inkrementalni install 006 obuhvaća read-only preflight definicija, nullable stupac, constraints, guardove, novi RPC, kompatibilne izmjene starog RPC-a, ACL, verify i PostgREST schema reload nakon COMMIT-a. Izolirano je testiran prije korisnikova izvršavanja. Additive migracija nije automatski dodijelila postojeće osobe stolicama. Originalni install bundle ostaje osnovna instalacija; ni njega ni već instalirani 006 ne treba ponovno izvršavati. Guard „already installed or seat_number exists” zaustavlja ponovno/neosnovano izvršavanje; nije razlog za brisanje stupca ili uklanjanje zaštite.

Korisnik je nakon instalacije regenerirao database.types.ts. Frontend repositories učitavaju seat_number kroz postojeći assignment query; actions i UI koriste generirani stupac/potpis novog RPC-a. Privremeni schema contract ili ručno dodavanje polja nisu uvedeni. Stari klijenti nastavljaju table-only rad kroz kompatibilni RPC. Provjere aplikacije i njihove granice bilježe se u CHECKS.md.

## Frontend i imena iznad stolica

Novi paket nije potreban: react-konva, postojeći pointer drag, React paneli i HR/EN poruke pokrivaju implementaciju. Imena se povezuju sa spremljenim brojem preko project_guest_id, bez kopiranja ili spajanja po imenu.

1. Renderer/hit-test koriste stabilni seat_number uz chairPositions geometriju. Stolice su ciljevi, bez povlačenja tijela stola; Space/Ruka/pinch ostaju pogled i prekidaju nedovršene geste bez upisa.
2. Boja i ime pojedine stolice dolaze samo iz konkretne non-NULL dodjele. Prijašnje bojanje prvih N stolica uklonjeno je; NULL osobe troše ukupni kapacitet, ali ne zauzimaju proizvoljno odabranu vizualnu stolicu.
3. Gosti s NULL brojem ostaju u podgrupi „Bez stolice” svojeg stola, „Na stolicama” prikazuje broj uz osobu. Sudionici bez stola zasebno su neraspoređeni. Ukupni N / kapacitet broji oba tipa dodjele; brojevi podgrupa razlikuju konkretne stolice od osoba bez mjesta.
4. „Odaberi stolicu” uz gosta ili obični tap stolice otvara zajednički dijalog. Zauzeta stolica otvara njenog gosta; slobodna ne bira osobu automatski. Korisnik bira uključenog sudionika, stol i mjesto/table-only pa izričito potvrđuje spremanje. Mreža prikazuje stabilni broj, lokalnu stranu i puna imena; zauzeto mjesto druge osobe nije dostupno. Ne radi se swap ili automatsko istiskivanje. Oslobađanje/unassign imaju jasne zasebne kontrole. Modal zadržava pogrešku i izbor te se ne može zatvoriti tijekom spremanja.
5. Drop gosta na stolicu ili aktivni gost + tap stolice izravno spremaju konkretnu dodjelu. Tijelo stola/izbornik zadržavaju stari kompatibilni table-only RPC. Premještanje koristi jedan atomski upis, bez prethodnog unassign-a. Zauzeto mjesto, pun stol ili nevaljana membership/archive pravila prikazuju grešku i čuvaju prethodnu dodjelu.
6. Ime/prezime iz project_guests crtaju se iznad/izvan stolice, uspravno i oko njenog rotiranog world centra. Dvije ograničene linije skraćuju duga imena; puno ime ostaje u popisu/dijalogu. Promjena projektnog imena odražava se nakon ponovnog učitavanja plana, bez promjene seat_number. Nema realtime pretplate ni name snapshota na assignmentu.
7. Imena se prikazuju kad je stolica široka >=24 ekranska px, odnosno >=18 px na odabranom stolu; pri >=22 px odabrane stolice pokazuju i broj. Font imena cilja 10–12 ekranskih px i ostaje uspravan neovisno o kutu. Udaljeni fit skriva imena i legenda upućuje na zoom/tap za detalje. Na mobitelu dijalog ima 44px kontrole, zasebni scroll i potvrdu pri dnu kao alternativa malim canvas ciljevima. Nazivi/viewport nikad ne mijenjaju cm prostoriju ili stolove.
8. Svaki novi seat upis šalje trenutnu reviziju, a frontend očekuje točno potvrđenu sljedeću reviziju i učitava aktualne dodjele. Stale revision ili nejasan transportni ishod blokiraju ponavljanje do korisnikova reload-a; ne boji se nepotvrđena stolica kao spremljena i nema tihog retrya.

Frontend ne mijenja postojeće NULL dodjele sam od sebe. Korisnik određuje konkretno mjesto kroz opisani tok. Pregled, nova kopija i template imaju prazne stolice bez imena. RSVP izvor/statusi ostaju u postojećem panelu i nisu prepisani seat nadogradnjom.

## Provjere modela i puštanja frontenda

- Sačuvani brojevi ostaju na istoj strani pravokutnika pri 8 → 9 → 17, te nakon rotacije/pomicanja/refresh-a.
- Dva upisa na isto mjesto: jedan uspije, drugi konflikt/zauzeto; nema gubitka stare dodjele ni dvije osobe na istoj stolici.
- Smanjenje preko zauzetog posljednjeg broja odbija se; slobodan posljednji broj može se ukloniti. Promjena oblika s mjestima odbija se.
- Premještanje/unassign/unseat su atomski; table-only stari RPC zadržava mjesto na istom stolu, očisti ga na drugom.
- Cross-project, anonymous, ne-sudionik, arhiva i nevaljan broj mjesta odbijeni; dopušteno oslobađanje mjesta arhiviranom gostu.
- Backfill ostavlja sve postojeće dodjele uz NULL, bez promjene brojeva gostiju/stolova ili RSVP-a.
- Brisanje stola/plana/sudionika zadržava postojeće cascade ponašanje. Dupliciranje stola i template kopiranje ne kopiraju osobe/dodjele.
- SELECT RLS i RPC grants, prazan search_path, private ACL i povratna kompatibilnost starih potpisa.
- HR/EN, imena nakon project_guest renamea, mobitel/tap/pinch, dugi nazivi, dovoljni zoom i prekinuta mreža/revizija.

Izolirane SQL provjere, read-only live potvrda i automatizirane frontend provjere dokumentirane su u [CHECKS.md](CHECKS.md). Stabilni brojevi, hit-test/rotacija, stvarni renderer, arhiva/kapacitet i dijalog imaju trajne testove. Native istodobne dvije veze za 006 i live frontend desktop/touch prikaz nisu potvrđeni tim testovima. Browser nije dostupan u ovoj sesiji; ručni HR/EN, desktop/mobilni, spremanje/refresh, 8 → 9 → 17, rename, copy/template, occupied/full-table, konflikt/mreža koraci su u [EDITOR.md](EDITOR.md#ručne-provjere). Agent nije instalirao paket ni izvršavao dodjele na live bazi.
