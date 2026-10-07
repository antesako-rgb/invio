# Definicije za spremanje u Supabase SQL Editor

**SAMO SPREMANJE / PREGLED. Ne izvrsavaj ove datoteke nakon installa.**
Za pocetnu primjenu koristi [numerirani install](../install/README.md).

## Sto spremam po folderima

- storage_objects: table, index, rls, grants.
- storage_cleanup_jobs: table, index, rls, grants.
- storage_legacy_review: table, rls, grants; nema posebnog index queryja.
- invitations, digital_albums, project_photos, invitation_photos,
  digital_album_photos, photo_wall_photos, projects: trigger queryji.
- invitation: private.invitation_document_photo_ids, zaseban query funkcije.
- storage_lifecycle: svaka nova funkcija ima vlastiti query; grants.sql cuva
  function grants/revokes iz pripreme i aktivacije, uz oznacene izvorne skripte.

Nazivi foldera predstavljaju objekte; SQL zadrzava stvarne public/private sheme.
Table sadrzi samo CREATE TABLE sa svim constraintima. RLS sadrzi ALTER TABLE
ENABLE ROW LEVEL SECURITY i policies. Trigger funkcije nisu u trigger.sql:
svaka je zasebno u storage_lifecycle. Prazne datoteke se ne stvaraju.
Za postojece javne tablice ovaj paket izdvaja samo nove trigger definicije,
a ne njihove cjelokupne postojece table/RLS/grants definicije.

## Sto izvrsavam

Prati [install README](../install/README.md): skripte 001-017, pa zajednicka
018 aktivacija. Definitions ne zamjenjuje transakcije i nije dodatna faza.
Read-only provjere ostaju u checks; rollback ima zasebna ogranicenja.

## Odrzavanje

Izvor istine je install. Nakon pregledane izmjene installa generiraj pregled:

```powershell
python -B docs/storage-lifecycle/tools/build_definitions.py
python -B docs/storage-lifecycle/tools/build_definitions.py --check
python -B docs/storage-lifecycle/tools/test_sql_organization.py
```

Generator radi samo s lokalnim datotekama; ne izvrsava SQL niti pristupa bazi.

Legacy create-photo grants are omitted because those functions were removed.
Install is the historical baseline; definitions is the current save-only overview.
