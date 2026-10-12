# Memora — dokumentacija

## Upravljanje bazom

Aktualni Database-as-Code workflow, pokrivenost i završni plan prije bete nalaze
se u [supabase/README.md](../supabase/README.md).
Definicije održavamo lokalno; nema ručnog prepisivanja u SQL Editor foldere.
SQL Editor služi korisnikovu izvršavanju pregledanih migracija/install paketa
i read-only provjera. Postojeći DEV ne rekonstruiramo iz starih instalacija.

`supabase/schemas/` trenutačno pokriva profiles/projects i pripadajuće helpere.
Ostale domene još nisu potpuno prenesene: postojeće `definitions/` mape u docs
zadržane su kao prijelazni izvor i za postojeće testove/generatore. Prije nove
promjene nepokrivenog objekta treba potvrditi DEV stanje i pripremiti kanonsku
definiciju u supabase. Postojanje stare datoteke nije dokaz njezine ažurnosti.

## Aktivna dokumentacija

| Područje | Početna stranica | Sadržaj |
|---|---|---|
| Seating i projektni gosti | [seating/README.md](seating/README.md) | Model, editor, RSVP, grupe, mjesta i predlošci |
| Storage lifecycle | [storage-lifecycle/README.md](storage-lifecycle/README.md) | Upload, cleanup, operacije i granice sigurnosti |
| Ovisnosti aplikacije | [DEPENDENCY_REVIEW.md](DEPENDENCY_REVIEW.md) | Pregled ovisnosti |

## Povijest SQL primjene i hotfixovi

- [Seating instalacije](seating/install/README.md) i
  [Storage instalacije](storage-lifecycle/install/README.md) čuvaju povijest,
  ne popis koraka koje treba ponovno izvršiti.
- [Revision conflict hotfix](seating/install/hotfix_revision_conflict/README.md): PT409.
- [Delete invitation guest hotfix](seating/install/hotfix_delete_invitation_guest/README.md): PT409.
- [Storage gate hotfix](storage-lifecycle/install/hotfix_storage_lock/README.md): PT503.

Stare provjere vezane su uz verziju pripadajućeg paketa. Nakon kasnijeg hotfixa
mogu očekivano odbiti izmijenjeno tijelo; to nije razlog za vraćanje stare funkcije.
Za novu promjenu koristiti njezin minimalni verify i evidenciju potvrđene primjene.

## Operacije i budući planovi

- [Storage operacije](storage-lifecycle/OPERATIONS.md) i `operations/`:
  read-only dijagnostika te zasebno označene ručne administrativne naredbe.
  Pause/resume/freeze skripte nisu read-only ni naredbe za rutinsko pokretanje.
- [Priprema javnog puštanja](storage-lifecycle/GO_LIVE.md).
- [Limiti paketa](storage-lifecycle/PACKAGE_LIMITS.md) i
  [video plan](storage-lifecycle/VIDEO_PLAN.md): prijedlozi, ne potvrđene implementacije.

SQL, povijest primjene i testne izvore ne brisati pri čišćenju dokumentacije
dok ne postoji provjeren nasljednik i dok nisu riješene njihove reference.
Potpuna rekonstrukcija i završni audit ostaju zaseban zadatak prije bete.
