# Video: kako bih ga dodao

BUDUĆI PLAN — nije implementirano. Fotografije ostaju u sadašnjem WebP lifecycleu. Ne proširivati photo RPC-e ili canonical .webp key na .mp4 bez novog dizajna i SQL pregleda.

## Izbor za Memoru

Koristio bih Bunny Stream za video i Bunny Storage za postojeće fotografije. Storage može služiti za datoteke, ali Stream dodaje encoding, prilagođenu reprodukciju i player. Prvo bih podržao video u Photo Wallu ili digitalnom albumu, tek kasnije u invitation editoru.

Službeni izvori:
- https://bunny.net/stream/
- https://bunny.net/blog/bunny-stream-introducing-pre-signed-and-resumable-uploads/
- https://docs.bunny.net/docs/stream-best-practices
- https://vercel.com/docs/functions/limitations

Prije implementacije potvrditi tada aktualne formate, API potpise, trajanje/veličinu limite, auth i webhook mogućnosti. Ovaj dokument ne obećava konkretne provider limite ni cijene.

## Tok podataka

1. Browser traži autorizirani upload. Server utvrđuje actor, projekt i proizvod; za javni Photo Wall provjerava published/public context.
2. DB/RPC rezervira pravo i kvotu za video; server stvara provider video zapis, bilježi njegov library/video ID i stanje. Iduće operacije koriste internu rezervaciju, ne proizvoljan client provider ID.
3. Server daje vremenski ograničenu upload autorizaciju vezanu uz baš taj video. Browser šalje video DIREKTNO u Bunny Stream putem potpisanog resumable/TUS uploada. Glavni Bunny API ključ nije u browseru.
4. Nakon uploada video je processing; korisnik vidi napredak/stanje, ne lažnu ready potvrdu.
5. Server provjerava status, provider ID, metadata i cilj kroz Bunny API. Ako se koriste webhookovi, potvrditi službeni način autentikacije; bez njega webhook je samo signal za server-side provjeru.
6. Tek validan dovršeni video postaje ready i dobiva player/thumbnail.
7. Unlink/cascade uklanja veze; poseban durable video cleanup posao briše provider objekt kad nema referenci.

Vercel prima samo male kontrolne zahtjeve. Veliki video ne prolazi kroz Next server action: limit 4.5 MB to čini neprikladnim, kao i serverless memory/timeout. Postojeći fotografski limit sada je 4 MiB s request headroomom.

## Model i granice

- Server-side ledger treba provider, library ID/video ID, project/product pripadnost, status i podatke za obračun. Ne koristiti image_path i .webp storage constraint za video.
- Video može imati više product veza; brisanje provjerava sve veze. Model project_photos ne mijenjati automatski u project_media radi kozmetike. Najmanji prvi korak može biti zaseban project_videos i veze samo podržanog proizvoda.
- Potrebni su pending/uploading/processing/ready/failed/deleting/deleted ishodi; precizna stanja dogovoriti uz retry/rollback prije SQL-a.
- Rezervacija/provider create je cross-system operacija: bilježiti namjeru i reconciliation za timeout nakon mogućeg commita. Ne pretpostavljati da ponovljeni provider create neće napraviti duplikat.
- Potpisni protokol Bunny TUS nije naš cron HMAC protokol; koristiti točan Bunny API format.
- Upload mora imati cancellation/retry/expiry pravila i cleanup napuštenih provider zapisa koji ne prihvaća client ID kao authority. Ne brisati processing video samo zbog klijentskog timeouta.

## Limiti i sigurnost

Product odluka: dopušteni ulazni formati, maksimalni bajtovi, trajanje, broj videa i quota projekta/paketa. MP4/MOV su kandidati, ne aktivna podrška. Za stvarnu zaštitu provjeriti koje limite provider može provoditi prije/dok upload traje; browser file.size nije zaštita. Post-upload server provjera ne zamjenjuje hard pre-upload cost limit.

Encoded video može zauzimati više od izvornika zbog više kvaliteta. Trošak uključuje storage i isporuku; kvote i broj kvaliteta planirati zasebno od fotografija. Za javni guest upload dodati abuse/rate/capacity zaštitu prije stvaranja provider objekta.

Video CDN/playback sigurnost prilagoditi tome je li proizvod javan ili privatan; UUID/adresa videa nisu sami po sebi access control. API/library ključevi ostaju server-only.

## Što se mijenja u aplikaciji

Shared media UI: izbor videa, zaseban preview/player, progress/retry i processing poruke kroz postojeći HR/EN. Zajednički video server tok slijedi project-photos obrazac, uz provider-specific kod i tanki product adapter. Ne koristiti Sharp za video.

Editor/document podrška tek kad se odluči da se video postavlja u page slot. Album PDF/export definirati kao thumbnail/link ili izostavljanje videa — ne može reproducirati video. Postojeće photo slotove ne pretvarati bez kompatibilne schema/version odluke.

## Najmanje faze implementacije

1. Odabrati prvi proizvod i limite; potvrditi Bunny Stream/TUS auth, pricing i metadata API.
2. Pripremiti ručno pregledani SQL ledger/kvote/veze/cleanup i tipove; zasebna testna Stream library.
3. Server create/reserve + browser direktni resumable upload + verified processing/ready tok.
4. Player/thumbnail i HR/EN UX u jednom proizvodu.
5. Cleanup/reconciliation i monitoring; scheduler uključiti tek nakon kontroliranog testa.
6. Tek zatim širenje na druge proizvode/editor.

Testirati: tuđi project/video ID, expired upload autorizaciju, paralelnu kvotu, retry poslije possible commit, cancelled upload, encoding failure, webhook spoof/replay, shared reference, cascade projekta, cleanup retry i storage/network cost granice. Provider stvarne integracijske testove izvršavati samo u testnoj library uz odobrenje.

Procjena: zasebna funkcionalnost srednje složenosti; pouzdan end-to-end video tok traži više od file inputa i .mp4 MIME tipa.

[Storage održavanje](README.md) · [Plan kvota](PACKAGE_LIMITS.md) · [Application mapa](../../src/features/project-photos/README.md)
