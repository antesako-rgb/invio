# Cloud TEST — plan konkurentnih provjera

Ovo je plan, ne automatski izvršiv test. TEST `cwhuknuhvzahxfoljohk` mora najprije
imati provjerene potrebne domene i ovu migraciju. Svi testni korisnici/planovi su
sintetički. Mutirajuće RPC pozive izvodi korisnik nakon odobrenja, nikad read-only MCP.

1. U dva neovisna authenticated zahtjeva iste početne revizije pokrenuti
   table update i element update. Točno jedan uspijeva; drugi dobiva HTTP 409 /
   PT409. Revizija raste jednom; nema automatskog ponavljanja.
2. Ponoviti element update protiv element update i room shrink protiv element
   move. Nakon zaključavanja validira se potvrđena geometrija; nema elementa
   izvan prostorije, izgubljenog updatea ili djelomične primjene.
3. Dva zahtjeva lock/unlock i transform: geometrija već zaključanog elementa
   ne smije proći. Stari revision ne smije prebrisati novo zaključavanje.
4. Nečlan, drugi projekt i anon: nema čitanja elemenata drugog projekta ni
   mutacije preko RPC-a. Izravni INSERT/UPDATE/DELETE odbijeni za klijentske uloge.
5. Pri prekidu odgovora nakon COMMIT-a editor blokira dodatni write i traži reload;
   ne kreira drugi objekt automatski. Nakon refresha prikazuje potvrđeno stanje.
6. Provjeriti v1 i v2 predložak u planovima dvaju projekata, izolaciju, cascade
   brisanje plana, limit 200 i read-only strukturni verify.

Evidencija: projekt, datum, migracijski checksum, dva response statusa i potvrđena
revizija. Ne zapisivati access tokene, request authorization headers ili osobne podatke.
