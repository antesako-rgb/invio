# Udaljeni PUT: pretpostavke, ne potvrđene garancije

Potvrđeno iz application koda: key nastaje jednom u rezervaciji; jedan upload
operation radi jedan PUT; retries rezervacije/finalizacije ne ponavljaju PUT;
ključ se ne koristi ponovno. Prije PUT-a provjerava se preostalo vrijeme, a
lokalni fetch ima 120s timeout. Cleanup je isključen po defaultu.

**Nije potvrđeno:** da HTTP abort, timeout ili završetak serverless instance
odmah zaustavlja obradu već poslanih byteova kod Bunnyja. Udaljeni PUT može
uspjeti bez primljenog odgovora. Lokalni AbortSignal to ne može dokazati.

SQL trenutno dopušta cleanup nefinalizirane rezervacije nakon 24h + 1h grace.
To je konfiguracijska pretpostavka, ne dokaz da više nema aktivnog udaljenog PUT-a.
Ako DELETE završi prije odgođenog PUT-a, objekt se može ponovno pojaviti pod
tombstoniranim keyem, bez novog aktivnog cleanup zadatka.

Prije postavljanja `STORAGE_CLEANUP_ENABLED=true` operator mora:

1. Potvrditi maksimalno trajanje application zahtjeva, upload procesa, eventualnih
   proxy/provider retries i clock skew. Retry/suspended worker ne smije započeti
   PUT nakon isteka rezervacije niti ponovno slati isti key.
2. Dokumentirati dokaz ili garanciju Bunny/provider ponašanja nakon timeouta:
   gornju granicu završetka već prihvaćenog PUT-a ili drugi provjerljiv način
   utvrđivanja da je upload prestao. Nismo zvali Bunny radi te potvrde.
3. Provjeriti da TTL/grace pokriva tu granicu i clock skew; povećanje vremena
   bez poznate granice nije dokaz sigurnosti.
4. Testirati simulirani odgođeni commit i izgubljeni odgovor s mockom, a kasnije
   kontrolirano na vlastitom staging storageu nakon zasebnog odobrenja.
5. Provjeriti da maintenance cutover nema stare in-flight upload procese koji
   rade mimo novog reservation/deadline pravila.

Ako granicu nije moguće potvrditi, **ne uključivati trenutačni automatski cleanup
pending rezervacija**. Potreban je zaseban reviewed quiescence/reconciliation
contract ili izdvojeni ready-only cleanup prije aktivacije. Ovaj paket ga ne
pretvara u izmišljenu provider garanciju. Zadržavanje pending objekata je sigurniji
izbor od brisanja uz mogućnost kasnijeg udaljenog PUT-a.

Pripremljeni PostgreSQL runner ne radi Bunny PUT/DELETE i ne potvrđuje ove
pretpostavke. Ni uspješan PostgreSQL test ne potvrđuje remote upload lifecycle.
