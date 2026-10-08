# 2D seating editor — V1

Pregled planova: /[locale]/dashboard/projects/[projectId]/seating. Zaseban editor: /[locale]/dashboard/projects/[projectId]/seating/[planId]. Postojeći PROJECT_GUESTS_ENABLED lokalno je prethodno uključen uz korisnikovo odobrenje. Ova dorada ne mijenja environment, pakete ili bazu.

## Implementacija

SeatingPlans prikazuje kartice s nazivom i brojem stolova/sudionika. Stvaranje je modal: naziv, prazan prostor ili aktivni predložak. Nakon upisa otvara editor plana. Prazni plan počinje na 2000 × 1500 cm; postavke plana uređuju naziv, dimenzije prostorije i RSVP izvor te omogućuju brisanje uz potvrdu.

SeatingWorkspace koristi zajedničke EditorShell, EditorHeader, EditorSaveStatus, EditorWorkspace, EditorSidebar i EditorMobilePanel. Canvas je glavni ekran, lijevi panel ima Gosti/Svojstva stola i vlastiti scroll. Na mobitelu panel je drawer; toolbar se horizontalno scrolla na uskim ekranima. Canvas se učitava next/dynamic sa ssr:false. React forme koriste postojeće UI komponente, CSS Modules i HR/EN prijevode.

Centimetri su glavno stanje; x/y je centar stola, rotacija je oko centra. Tijekom poteza postoji samo lokalni preview. Nakon završetka normaliziraju se integer dimenzije/rotacija, resetira Konva scale na 1 i provjerava postojeća seatingGeometryFits geometrija. Nevaljana promjena vraća se uz poruku. Natpis se crta odvojeno od rotiranog tijela i ostaje uspravan. Okrugli stol ostaje krug. Svojstva stola imaju samo naziv, broj mjesta kroz −/+ i brisanje. Broj mjesta ne može pasti ispod zauzetosti ili izvan 1–100. Novi okrugli stol počinje s promjerom 480 cm, pravokutni s 440 × 400 cm i oba s 8 mjesta. Početne vrijednosti su zaokruženi prosjeci spremljenih dimenzija korisnikova projekta (read-only mjerenje: 6 okruglih, prosjek 479 cm; 2 pravokutna, prosjek 444 × 398 cm). To su fiksne početne vrijednosti aplikacije, ne dinamički prosjek tuđih projekata. U manjem prostoru dimenzije se proporcionalno smanje da stanu; defaults ne ovise o zoomu i ne mijenjaju postojeće stolove ili predloške.

Odabir prazne pozadine ili alat za veličinu prostorije prikazuje osam ručki na svim kutovima i sredinama rubova prostorije. Resize ne skalira stolove niti mijenja njihove spremljene cm koordinate. Kod lijevog/gornjeg ruba preview koristi novi vizualni početak prostorije; na završetku ga preuzima lokalni viewport, dok model ostaje na ishodištu (0,0). Stolovi zadržavaju položaj u cm u odnosu na prostoriju. Pomak prikaza nije podatak u bazi. Prije spremanja provjerava sve postojeće zakrenute stolove; postojeći manage_seating_plan RPC ponovno provjerava iste granice. Stolice su prikaz kapaciteta, nisu zasebni DB entiteti. Stolice su veće, proporcionalne tijelu stola, s zaobljenim sjedalom i prikazom naslona. Razmak od ruba prati veličinu stolice, a velika gustoća mjesta ograničava širinu da se smanji preklapanje. Raspoređene su oko kruga ili uz rubove pravokutnika te prate pomicanje/rotaciju/resize stola; resize ne mijenja njihov broj. Granica prostorije odnosi se na tijelo stola prema postojećem SQL modelu; ne provjerava dodatni prostor za stolice ili prolaze.

Normalno povlačenje tijela stola pomiče stol; povlačenje prazne pozadine pomiče pogled. Space ili Ruka isključuju pomicanje/transformacije stolova i pomiču pogled čak preko njih. Space ne preuzima tipkanje u formama. Kotačić zooma oko kursora; tipke zoomaju oko sredine. Dva prsta daju pinch zoom/pan i prekidaju pomicanje stola bez upisa. Prikaži cijeli prostor je izričit fit. Otvaranje editora i promjena širine canvasa automatski uklapaju cijelu prostoriju, uključujući desktop → mobitel i promjenu orijentacije. Na užem canvasu margine su manje. Promjena samo visine zbog poruke čuva ručni zoom i centar pogleda; spremanje samo po sebi ne vraća fit. Prikaži prostor koristi samo ikonu u toolbaru, prije zoom kontrola, uz prevedeni aria-label i title.

Gosti su glavni tab, s pretragom i grupama: neraspoređeni te svaki stol sa zauzetosti. Detalji uz ime otvaraju postojeće RSVP/arhiva upozorenje, izbor stola, uklanjanje dodjele i uklanjanje iz plana. Grip podržava pointer drag iz popisa na tijelo stola, s ciljem označenim na canvasu. Sam popis ostaje scrollabilan. Na mobitelu drawer se zatvara kada povlačenje započne. Tap na grip ili Odaberi stol na prostoru aktivira alternativu: odaberi gosta, zatim dodirni stol. Izbornik je dostupan za miš, tipkovnicu i touch. Pun stol jasno odbija dodjelu; premještanje koristi postojeći atomski assign_seating_guest bez prethodnog unassign poziva.

Dodaj gosta ima postojeću aktivnu projektnu osobu koja nije član plana ili unos nove osobe bez pozivnice. Odabir postojeće osobe izričito uključuje membership. Novi unos stvara projektnu osobu i zatim je uključuje kroz dva postojeća RPC-a. Ne nastaju invitation_guests niti recipient. Dva upisa nisu jedna atomska transakcija: ako uključivanje ne uspije, osoba ostaje u projektu, dialog čuva njen ID i nudi uključivanje iste osobe bez ponovnog stvaranja. Ako je transportni ishod nejasan, prvo reload i provjera potvrđenog članstva; nema automatskog ponavljanja stvaranja. Reload je dostupan i unutar dialoga. Za strogi all-or-nothing create+include trebao bi dodatni RPC; za ovu verziju nije potreban niti je dodan.

Svaki seating upis šalje trenutni p_revision. Jedan editor serijalizira vlastite upise, nakon uspjeha učitava potvrđeno stanje, a zastarjela revizija blokira daljnje promjene do izričitog reload-a. Isto vrijedi za nejasan transportni ishod. Nema tihog retrya ili prepisivanja druge revizije. Sve ide kroz postojeće user actions i RPC-e, bez admin klijenta ili izravnih tabličnih upisa.

RSVP status dolazi samo iz odabrane pozivnice i postojećeg resolvera. Konflikt odgovora, arhiva i ne-dolazak uz dodijeljen stol označeni su u grupama/detaljima. Arhivirane osobe ostaju vidljive i mogu se ukloniti/unassign, ali ne dodavati ili ponovno dodjeljivati. Brisanje stola čuva sudionike, uklanjanje iz plana čuva osobu. Nema zasebne project guest tablice ili stranice u UI-u.

## Što treba dodati u bazu/pakete

Za tražene V1 interakcije nije potreban novi paket, tablica, stupac ili RPC. Postojeći alati pokrivaju upise. Jedina granica je neatomskost stvaranja osobe i uključivanja: nova kombinirana RPC funkcija bila bi potrebna samo ako oba moraju uspjeti ili se oba poništiti. Nije izvršena niti predložena SQL izmjena.

Zasebna sjedala/dodjela određenoj stolici, ulaz/podij/pozornica, 3D i ispis nisu dio ove dorade i nisu prikazani kao funkcionalni. Stolice su vizualizacija stvarnog spremljenog kapaciteta, a gost se dodjeljuje stolu.

## Ručne provjere

Izvršiti na vlastitom testnom projektu, HR/EN i desktop/mobitel. Koraci nisu tvrdnja da su izvršeni.

1. Pregled kartica → Novi raspored (prazni/predložak) → zaseban editor. Vrati se i provjeri aktualne counts. Izravni refresh mora ostaviti isti plan.
2. Dodaj oba oblika. Klikom/tapom odaberi stol i koristi ručke za resize/rotaciju. Imena ostaju uspravna, krug kružan. U Svojstvima su samo naziv, mjesta i brisanje.
3. Povuci stol: spremanje samo po završetku. Refresh potvrđuje cm/rotaciju. Zoom/pan ne mijenjaju te podatke.
4. Povuci praznu pozadinu. Space+drag i Ruka preko stola moraju pomaknuti samo pogled. Povratak na običan način opet dopušta stol. Space u formi ne preuzima tipkanje.
5. Zoom kotačićem oko kursora, tipkama i fit. Mobitel: pinch s dva prsta tijekom običnog rada i nakon početka povlačenja stola; ne smije spremiti slučajno pomaknut stol.
6. Odaberi resize prostorije. Provjeri svih osam ručki, uključujući gornje i lijeve. Povećaj je: stolovi zadržavaju veličinu/položaj. Smanji preko zakrenutog stola: odbijanje i povratak. Valjanu promjenu potvrdi refreshom.
7. Stolice: broj prati kapacitet i oba oblika; resize ne mijenja broj, rotacija/pomicanje ih prati. − ne ide ispod zauzetosti, + staje na 100. Refresh potvrđuje broj.
8. Dodaj gosta: postojeća osoba ili nova osoba bez pozivnice. Oba toka završe s članstvom u planu; novi unos ne stvara recipient/pozivničku vezu. Provjeri slučaj greške nakon stvaranja osobe: ponovno uključivanje ne stvara duplikat.
9. Pretraga, neraspoređeni i grupe po stolovima. Proširi gosta, provjeri status i izbornik. Popis ima vlastiti scroll, canvas ostaje vidljiv.
10. Povuci gosta gripom na stol (miš i touch); provjeri označavanje cilja i spremljenu zauzetost. Pusti na pozadinu: bez upisa, jasna poruka. Na mobitelu provjeri zatvaranje drawera i tap-odabir gosta pa stola.
11. Premjesti između stolova, dropdownom i canvasom. Jedan gost ima jedan stol. Pun stol odbija premještanje, prethodna dodjela ostaje. Unassign vraća u neraspoređene.
12. Odaberi RSVP izvor i provjeri pending/nepovezanu osobu/conflict/not_attending/archive. Promjena izvora ne mijenja dodjele. Arhiviranu osobu se može unassign/remove.
13. Dva taba s istom revizijom: prvi spremi; drugi pokušaj mora dati konflikt i blokadu do reload-a. Nova osoba stvorena prije konflikta ostaje dostupna; retry uključuje istu.
14. Prekid mreže kod spremanja: vidljiva greška i reload, bez automatskog retrya. Reload mora biti dostupan i u Dodaj gosta dialogu.
15. Potvrda/cancel brisanja stola, sudionika i plana: osobe ostaju, ostali planovi netaknuti.
16. Suzi desktop prozor na mobitel bez reload-a: cijela prostorija mora ostati vidljiva. Otvori editor izravno na mobitelu i promijeni orijentaciju. Ručno zoomaj/pomakni pa spremi ili prikaži poruku: zoom ne smije biti poništen. Uski ekran i mobitel u oba položaja: toolbar, drawer scroll, grip, pinch, ručke, forma i greške. Izbornik/tap dodjela moraju raditi bez povlačenja. Provjeri postojeće pozivnice/album editor i njihov lijevi panel.

## Automatizirana provjera

node --test src/features/seating/tests/editorGeometry.test.cjs: dvanaest trajnih testova za zoom cm invariantu, transformacije/krug, rotirane granice, drop hit-test, full-table premještanje, broj stolica i smanjenje prostorije, svih osam room ručki te normalizaciju prikaza uz nepromijenjene cm koordinate stolova. Bez baze, ključeva i osobnih podataka.

Završni rezultati su u CHECKS.md. Browser nije dostupan u ovoj sesiji; vizualna provjera i stvarne desktop/touch geste novog sučelja nisu potvrđene. Live RPC upisi kroz novo sučelje nisu izvršeni od strane agenta.
