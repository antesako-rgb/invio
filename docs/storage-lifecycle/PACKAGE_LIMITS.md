# Kako bih uveo limite fotografija po paketima

PRIJEDLOG ZA BUDUĆNOST — nije implementirano. Ovaj dokument ne mijenja bazu, upload, cleanup ni postojeće pakete.

## Moj početni izbor

Uveo bih ukupan broj fotografija i storage kapacitet po projektu. Dodatne limite pozivnice, albuma ili Photo Walla dodao bih samo ako su dio konkretne ponude paketa. Ne uvoditi sve moguće limite prije odluke o proizvodu.

Ako se paket kupuje po projektu, projekt je vlasnik kvote. Ako se kasnije uvede pretplata računa s više projekata, treba zasebno definirati dijele li projekti kapacitet; to ne pretpostavljati.

## Što brojim

| Kvota | Izvor i pravilo |
| --- | --- |
| Aktivne fotografije projekta | Jedinstveni project_photos zapisi plus aktivne upload rezervacije; isti objekt nije dvaput brojiv zbog dijeljenja. |
| Fotografije pozivnice | invitation_photos za konkretnu pozivnicu plus rezervacije koje će stvoriti veze. |
| Fotografije albuma | digital_album_photos za konkretan album plus rezervacije. |
| Fotografije Photo Walla | photo_wall_photos za konkretan Photo Wall plus rezervacije. |
| Storage projekta | Ledger s pouzdanim veličinama/rezerviranim bajtovima, uključujući objekte koji čekaju brisanje. Sam project_photos nije dovoljan. |

Jedna fotografija povezana s albumom i pozivnicom zauzima jedno mjesto u ukupnom broju projekta, po jedno mjesto u oba proizvoda i svoju stvarnu veličinu samo jednom. Photo slotovi koji ponavljaju isti photo_id nisu dodatni uploadi.

Razlikovati poslovni limit aktivnih fotografija od fizičke pohrane. Za poslovni broj odabrao bih oslobađanje kad objekt napusti aktivnu biblioteku, uz provjeru svih veza/dokumenata. MB se ne oslobađaju dok brisanje nije potvrđeno. To pravilo korisniku treba jasno prikazati.

## Gdje provodim zaštitu

DB/RPC je autoritet. UI samo prikazuje preostali kapacitet i objašnjava odbijanje. Direktni authenticated RPC, javni Photo Wall, povezivanje postojećih fotografija i paralelni zahtjevi moraju imati istu zaštitu.

- storage_reserve_upload: pod zaključavanjem provjeri projekt/paket, članstvo ili javni cilj, aktivni broj i rezervirane bajtove. Rezervacija odmah troši budući kapacitet. Ponovljena rezervacija istog ID-a ne troši ga ponovno.
- storage_finalize_upload: idempotentno zamijeni rezervaciju stvarnim korištenjem; ne brojiti reserve i ready kao dva objekta. Provjeri granicu veličine i postavi pouzdanu obračunsku veličinu.
- RPC-i za add/link fotografija: provjeri product kvotu i kad nema novog Bunny PUT-a. Dijeljenje ne smije zaobići limit proizvoda.
- unlink/cascade/cleanup: ažuriraj obračun transakcijski; MB oslobađaj tek nakon potvrđenog završetka fizičkog brisanja. Ne uklanjati ledger da bi broj pao.

Brojanje pa upis bez zajedničkog zaključavanja nije dovoljno: dva uploada mogu oba vidjeti posljednje slobodno mjesto. Koristio bih zaključavanje projekta/obračunskog zapisa u dosljednom redoslijedu sa storage gateom; implementaciju prvo testirati zbog postojećih parent lockova/cascadea.

## Kako bih obračunao veličinu prije PUT-a

Postojeći tok rezervira objekt prije optimizacije. Za početak bih rezervirao jasno određen maksimalni broj bajtova po uploadu, a nakon optimizacije prije PUT-a provjerio da buffer stane u rezervaciju. Ako ne stane, odbiti prije PUT-a ili atomski povećati rezervaciju nakon ponovne provjere kvote. Nije sigurno tek nakon uspješnog PUT-a otkriti da korisnik nema prostora.

Kod finalizacije spremiti veličinu obrađenog buffera koju određuje server. Potreban je zaseban plan SQL izmjene ledger stupaca/obračuna; postojeći result JSON nije potpuni jedinstveni model fizičkog kapaciteta.

## Prekinuti uploadi i brisanje

Pending rezervacija nije automatski dokaz da datoteka ne postoji na Bunnyju. Timeout ili datum isteka ne dokazuju da udaljeni PUT više ne traje.

Zato bih razlikovao rezervaciju koja je sigurno otkazana PRIJE PUT-a od nejasnog pokušaja POSLIJE početka PUT-a. Prva može osloboditi rezervirane bajtove uz trajan dokaz stanja; druga zadržava konzervativni kapacitet do provjerenog rješenja. Ne uključivati automatsko brisanje pending objekata samo radi kvote.

Deleting/leased/failed cleanup objekti još troše storage. Nakon potvrde deleted/done oslobodi bajtove jednom. Quarantined/legacy objekti zahtijevaju pregled; ne pretpostavljati veličinu/vlasništvo samo prema prefiksu. Nejasan kapacitet prikazati kao zaseban operativni nalaz.

## Promjena paketa

Upgrade odmah povećava limite. Downgrade ispod postojeće potrošnje ne briše fotografije: prikazuje prekoračenje i blokira samo nove operacije koje povećavaju relevantnu kvotu. Postojeći prikaz, uklanjanje i cleanup ostaju dostupni.

Kod odgođenog cleanupa UI može pokazati: aktivne fotografije, potrošeni MB, rezervirano i čeka brisanje. Poruke i nove action error kodove dodati kroz postojeći HR/EN sustav.

## Najmanji redoslijed implementacije

1. Odlučiti kupuje li se paket po projektu i točno definirati aktivni broj/MB/product limite.
2. Pripremiti SQL model paketa i obračuna, rezervirane/stvarne bajtove te transakcijska pravila. Postojeće stanje konzervativno uskladiti bez izmišljanja vlasništva legacy objekata.
3. Nadograditi reserve/finalize/link/cleanup RPC-e i testirati direktne RPC pozive te konkurentne uploade.
4. Regenerirati tipove, uskladiti runtime sheme i server tok u src/features/project-photos.
5. Dodati UI stanje kapaciteta i prevedene greške, bez uklanjanja DB zaštite.

Obavezni slučajevi: zadnje mjesto i dva paralelna uploada; retry nakon mogućeg commita; dijeljena fotografija; product link bez PUT-a; neuspjeli PUT; pending ambiguity; Bunny DELETE bez DB ACK-a; lease retry; downgrade; brisanje projekta.

## Gdje se snalazim u postojećem sustavu

- [Application mapa](../../src/features/project-photos/README.md): upload/reserve/finalize/Bunny/cleanup datoteke.
- [Storage upute](README.md): aktualne definicije i operativne provjere.
- [Završni audit](AUDIT.md): dosadašnji dokazi i neprovjereni PostgreSQL scenariji.

