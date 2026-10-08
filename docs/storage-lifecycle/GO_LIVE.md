# Storage: prije javnog puštanja

Ako zadržavaš istu Supabase bazu, Bunny zonu i Vercel adresu, nema ponovne instalacije storage SQL-a. Cron localhost označava PostgreSQL vezu unutar Supabasea, ne tvoje računalo; ne mijenja se pri javnom puštanju.

## 1. Ostajem na postojećem okruženju

- Deployaj aktualni application kod na Vercel Production i pričekaj Ready / Current.
- Provjeri Production postavke iz tablice ispod. Nakon promjene environment varijabli potreban je novi deployment. Ne prepisuj ispravne vrijednosti bez razloga.
- Kroz UI probaj upload, prikaz i uklanjanje nekorištene testne fotografije za invitation, digital album i Photo Wall.
- Nakon cron termina provjeri [monitor.sql](operations/monitor.sql): cron succeeded i novi HTTP 200. completed:0 je normalno ako nema kandidata; succeeded sam po sebi znači samo enqueue.
- Za obrisanu testnu fotografiju potvrdi deleted / done i da datoteke nema u Bunny Storageu. Provjeri da zajednička/korištena fotografija ostaje.

| Postavka | Gdje | Što provjeravam |
| --- | --- | --- |
| Postojeće Supabase URL/API varijable | Vercel Production | Upućuju na odabranu produkcijsku bazu. |
| SUPABASE_SECRET_KEY | Vercel Production, server-only | Ispravan ključ te baze; nikad NEXT_PUBLIC varijabla. |
| BUNNY_STORAGE_ZONE / BUNNY_STORAGE_REGION / BUNNY_STORAGE_PASSWORD | Vercel Production, server-only | Odabrana zona i odgovarajući pristup. |
| NEXT_PUBLIC_CDN_URL | Vercel Production | Javni CDN za tu zonu, fotografije dostupne. |
| STORAGE_CLEANUP_ENABLED | Vercel Production | true kad je cleanup spreman za rad. |
| STORAGE_CLEANUP_SECRET | Vercel Production | Ista vrijednost kao Vault secret ispod. |
| memora_storage_cleanup_secret | Supabase Vault | Naziv Vault secreta, ne dodatna Vercel varijabla. |
| memora-storage-cleanup | Supabase Cron | */5 * * * *, active=true, postgres. |

Secret vrijednosti ne spremati u SQL Editor, Git, ovaj dokument ili logove.

## 2. Uvodim vlastitu domenu

1. Poveži domenu s Vercel Production deploymentom.
2. Pauziraj cron naredbom iz [pause_resume_manual.sql](operations/pause_resume_manual.sql); izvrši samo pause. Već poslani zahtjevi nisu otkazani.
3. Pripremi novu numeriranu SQL doradu funkcije private.enqueue_signed_storage_cleanup(): promijeni samo odredišni URL na https://nova-domena/api/internal/storage-cleanup, uz postojeće grants i zaštite. Ne prepisuj povijesne migracije.
4. Potpisana metoda POST, putanja /api/internal/storage-cleanup i raw body {} ostaju isti. Odredište treba izravno primati POST bez login zida ili redirecta. Cron nodename localhost ostaje.
5. Napravi jedan kontrolirani potpisani test uz prethodnu provjeru svih kandidata za brisanje. HTTP 503 kad je cleanup isključen potvrđuje dostavu, ne valjanost potpisa.
6. Nakon uspješnog testa uskladi spremljenu definiciju, pa nastavi cron.

App domena i Bunny CDN domena su zasebne stvari: NEXT_PUBLIC_CDN_URL mijenjaš samo ako se mijenja CDN. Auth Site URL/redirect postavke provjeriti zasebno za novu domenu.

## 3. Odvajam lokalni razvoj od produkcije

Dok lokalna aplikacija koristi istu bazu kao produkcija, lokalni upload/unlink utječe na istu bazu. Produkcijski cron može obrisati te lokalno uklonjene datoteke.

Za daljnje testiranje koristi zasebni Supabase projekt/bazu i zasebnu Bunny storage zonu/CDN. Lokalni .env.local mora upućivati na testno okruženje. Vercel Preview također izolirati ako ga koristiš za testiranje. Ne kopiraj aktivan cron koji poziva produkcijsku domenu u testnu bazu.

Ako uvodiš NOVU produkcijsku Supabase bazu, treba zasebno pregledati i instalirati cijeli usklađeni model/ovisnosti, regenerirati tipove, konfigurirati Vault i signer te stvoriti NEAKTIVAN cron. Povijesni install nije automatski univerzalni installer: SQL021/022 i potrebni product helperi također moraju biti prisutni. Uključi cron tek nakon provjera.

Promjena Bunny zone sama po sebi ne premješta postojeće fotografije. Ako ima postojećih objekata, prije promjene potreban je zaseban plan prijenosa i očuvanja pristupa; ne usmjeravati cleanup na pogrešnu zonu.

## 4. Što još nije dokazano dosadašnjim testovima

Stvarni izolirani PostgreSQL concurrency/cascade/rollback/lease-expiry/quarantine testovi još nisu izvršeni. Potrebni su prije oslanjanja na sve rubne slučajeve pri javnom radu. Pojedinačni uspješni upload/cleanup i mock testovi nisu njihova zamjena. Detalji: [AUDIT.md](AUDIT.md).

Napušteni/pending uploadi ostaju za ručni pregled. Timeout ne dokazuje prekid udaljenog PUT-a; za njih ne uključivati automatsko brisanje samo prema starosti. Legacy/quarantined objekti također nisu automatski sigurni za brisanje.

## Ako se pojavi problem

Prvo pauziraj cron preko operations/pause_resume_manual.sql. Za isključivanje novih cleanup obrada postavi STORAGE_CLEANUP_ENABLED=false i redeployaj; već pokrenuti posao time se ne poništava. Emergency freeze zaustavlja i storage upload RPC-e, zato ga ne koristi kao običnu provjeru.

Ne ponavljati već primijenjene CREATE/maintenance skripte. Aktualne definicije iz definitions/ samo spremi u SQL Editor. Za buduću promjenu napravi novu pregledanu migraciju.
