# Project Guests — implementacija i audit

## Arhitektonski uzorci

- `src/features/projects/types/project.types.ts`: application tipovi izvedeni iz generated Supabase tipova.
- `src/features/projects/repositories/getProject.ts` i `src/features/project-collaboration/repositories/getProjectCollaborators.ts`: server-only, tanak repository i propagacija Supabase grešaka.
- Aktualne collaboration akcije i `src/lib/actions/actionResult.ts`, `actionErrorCodes.ts`, `useActionError.ts`: validacija na serveru, stabilni kodovi i lokalizirane poruke.
- `src/features/projects/components/CreateAlbumDialog`: native forme, dialog i loading ponašanje.
- `Page`, `Container`, `PageHeader`, `Field`, `Input`, `Select`, `Textarea`, `Card`, `Badge`, `TabsFilter`, `EmptyState`, postojeći dialogs i `ConfirmDialog`: zajednički UI bez paralelnog sustava.
- `src/i18n/messages.ts`, HR/EN JSON datoteke, desktop sidebar i mobilni More menu: postojeća lokalizacija i Project navigacija.

## Dodane datoteke

U `src/features/project-guests/`:

- `types/projectGuest.types.ts`
- `validation/projectGuest.schema.ts`
- `repositories/getProjectGuests.ts`
- `repositories/getProjectGuestGroups.ts`
- `repositories/mapProjectGuest.ts`
- `repositories/mutateProjectGuests.ts`
- `actions/projectGuestError.ts`
- `actions/projectGuestActions.ts`
- `components/ProjectGuests.tsx`
- `components/ProjectGuestForm.tsx`
- `components/ProjectGuestGroupsDialog.tsx`
- `components/ProjectGuests.module.css`
- `tests/projectGuests.test.cjs`

Dodatno:

- `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/guests/page.tsx`
- `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/guests/loading.tsx`
- `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/guests/error.tsx`
- `src/messages/hr/project-guests.json`
- `src/messages/en/project-guests.json`
- Ovaj izvještaj.

## Izmijenjene postojeće datoteke

- `src/components/navigation/DashboardSidebar/DashboardSidebar.tsx`: Project stavka Gosti.
- `src/components/navigation/DashboardMoreMenu/DashboardMoreMenu.tsx`: ista stavka na mobitelu.
- `src/i18n/messages.ts`: učitavanje ProjectGuests namespacea.
- `src/lib/actions/actionErrorCodes.ts`: dva nova lokalizirana koda grešaka.
- `src/messages/hr/common.json`, `src/messages/en/common.json`: poruke tih kodova.
- `src/messages/hr/projects.json`, `src/messages/en/projects.json`: naziv navigacijske stavke.
- `src/components/ui/dialog/dialog.tsx`: opcionalan lokalizirani naziv gumba zatvaranja, kompatibilan s postojećim pozivima.
- `src/components/ui/common/ConfirmDialog.tsx`: opcionalan lokalizirani loading tekst, kompatibilan s postojećim pozivima.

Ostatak postojećih izmjena u radnoj kopiji nije dio ovog zadatka.

## Podaci i akcije

Čitanje oba popisa koristi SELECT filtriran po `project_id`, kroz authenticated server client i postojeći RLS. Ruta prvo provjerava UUID i dostupnost Projecta. Nema novih read RPC-a.

Svih sedam write operacija prolazi kroz server action → strogu Zod validaciju → repository → postojeći RPC. Repository ne radi direct insert/update/delete nad tablicama. Na uspjeh se revalidira Guests page; Next vraća aktualne server props. Akcije vraćaju postojeći ActionResult. PostgreSQL/Supabase greške mapiraju se u stabilne kodove; sirova poruka ostaje samo u server logu.

Create/update gosta šalju samo ime, prezime, grupu i bilješku uz odgovarajući ID. RSVP koristi zaseban `set_project_guest_rsvp_status`; frontend nikad ne šalje source. `pending + manual` kod kreiranja ostaje odgovornost baze. Status/source iz čitanja provjeravaju se pri mapiranju u application tip.

Generated RPC Args trenutno deklariraju opcionalne tekstove i grupu kao `string`, iako contract dopušta null. Application input tipovi zato usko proširuju samo ta tri polja, uz kompatibilnost na granici RPC poziva. Generated types i baza nisu mijenjani. UI validacija ograničava imena na 100 znakova i bilješku na 2000; to nisu tvrdnje o DB limitima.

## UX

Globalni Guests imaju primarni Dodaj gosta i sekundarnu organizaciju grupa u dialogu. Lista prikazuje ime, grupu i status. Jednostavna pretraga tolerira hrvatske dijakritike; postoje status filteri. Na manjim širinama akcije prelaze u vlastiti red, forma u jedan stupac, a grupe u vertikalni prikaz.

Create/edit forme ostaju otvorene kod neuspjeha. Zajednički mutation lock sprečava dvostruke pozive i zatvaranje tijekom spremanja. Toastovi, forme, potvrde brisanja, loading/error/empty prikazi i statusi imaju HR/EN poruke. Brisanje grupe poziva isključivo group RPC; goste ne briše i objašnjava da ostaju bez grupe.

## Provjera

- TypeScript cijelog projekta: prolazi.
- ESLint dodanog featurea i izmijenjenih TS/TSX datoteka: prolazi.
- ESLint cijelog repozitorija ne prolazi zbog postojećih problema izvan ovog featurea: BackToTop, Page, FilePicker, Skeleton, tooltip, AuthProvider, usePhotoWallUpload, generated database.types.ts i starog `.tmp/collaboration-contract.test.cjs`. Te datoteke nisu popravljane u ovom zadatku.
- 25 testova (10 Project Guests i 15 postojećih): prolaze. Pokrivaju stroge payloadove, nullable polja, svih sedam RPC-a i akcija, revalidaciju, error mapping, SELECT scope, runtime enum provjeru, HR/EN ključeve, pretragu, filtere, mutation lock, zadržavanje forme nakon greške i group delete potvrdu.
- Pregled koda i test potvrđuju odsutnost direct table writeova i source parametra u mutation payloadovima.
- Responsive CSS pregledan je statički; stvarna vizualna provjera i CRUD na spojenoj bazi nisu izvršeni jer Browser nije imao dostupnu povezanu sesiju. Ručno provjeriti desktop/mobitel, fokus dialoga i stvarne RPC odgovore za ownera i collaboratora.

Nisu implementirane buduće domene Invitation Recipients, javni RSVP, conflict engine, seating ili slanje poruka. Nije mijenjan DB contract niti dodana migracija.
