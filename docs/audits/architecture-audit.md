> Historical audit: the neutral Project/event-details findings below were superseded by [Project = Event migration](./project-is-event-migration.md). The linked generated inventories now reflect the newer model.

# Memora arhitektonski audit — 2. listopada 2026.

## Opseg i metoda

Pregled trenutačnog working treeja, uključujući postojeće nezakomitirane promjene. Nisu mijenjani DB, RPC, routing, autorizacija ni poslovni workflowi. Napravljena su samo tri dolje navedena SAFE CLEANUP zahvata.

Statički inventar obuhvaća 606 TS/TSX/JS/CJS datoteka u `src`, 61 datoteku u `app`, 40 datoteka s `use server`, 71 repository datoteku i 7 servicea. Importi su razriješeni TypeScript resolverom prema stvarnom `tsconfig.json`; uključeni su re-exporti, literalni dynamic importi i `require`. Ručno su pregledani kandidati za višak te ključni auth, create, delete, upload, save, routing i loading flowovi.

- [Inventar po featureima](./architecture-inventory.md): svaki repository, njegovi lokalni DB/RPC pozivi i direktni consumeri; popis svih actions/services/types/validation/utils/client granica i app entrypointa.
- [Strojno čitljiv import graf](./architecture-inventory.json): svi moduli, type-only veze, consumeri i linije lokalnih poziva.
- Ponovljiva analiza: `node scripts/architecture-audit.cjs`.

Ovo nije dokaz nepostojanja svih runtime problema. Generated DB types potvrđuju oblike, ne SQL autorizaciju, grantove, CHECK limite ili ON DELETE pravila. U trenutačnom repozitoriju nema SQL datoteka za usporedbu implementacije RPC-a. Vanjska uporaba biblioteke, neliteralni dynamic importi i referenciranje izvan repozitorija nisu dokazivi ovim grafom. CSS/assets nisu moduli u TS grafu. `from/update/delete` u inventaru označavaju naziv poziva, pa npr. `Set.delete` i `Buffer.from` nisu DB writeovi; niže navedeni stvarni DB writeovi ručno su potvrđeni.

## SAFE CLEANUP — provedeno

1. `src/components/layout/AppLoader/AppLoader.tsx`: uklonjen `use client`. Samo statični markup i CSS animacija; consumer je root loading. Nema statea, efekata, browser API-ja ni event handlera.
2. `src/components/navigation/DashboardHeader/DashboardHeader.tsx`: uklonjen `use client` s prezentacijskog wrappera. `LanguageSwitcher` i `UserMenu` zadržavaju vlastite client granice; header ne prosljeđuje funkcije niti koristi client hookove. Layout i izgled ostaju isti.
3. `src/lib/upload/bunny.ts`: dodan `import "server-only"`. Svih osam direktnih consumera su server upload/cleanup moduli. Nije promijenjen redoslijed ni implementacija storage operacija.

Nijedna aplikacijska datoteka nije obrisana. Novi audit script i dva inventara služe provjeri, nisu runtime arhitektura. Neiskorišteni kandidati niže nisu automatski uklonjeni.

## Izvještaj po featureima

### projects

- **KEEP — Pages/Server Components:** routeovi učitavaju user-scoped podatke kroz repositories; `ProjectWorkspacePage`, header/context i product navigacija ostaju server composition. Owner provjere za prikaz akcija nisu zamjena za RPC autorizaciju.
- **KEEP — Client Components:** forme, settings i modal/interaktivni dijelovi. `CreateProjectEventPage` i `EditProjectEventPage` koriste router, toast i submit callback, pa postojeća granica ima razlog. **REVIEW:** može se kasnije izdvojiti mali client form adapter da statični PageHeader ostane server; nije hitan refactor.
- **KEEP — Actions (6):** jednostavan action → repository → RPC; event create/update koriste odgovarajuće event RPC-e, neutralni update ostaje odvojen. `createAlbumEntryAction` mora zadržati `projectId` na failureu i client retry s istim Projectom. `CreateAlbumForm` koristi `result.data.albumId`.
- **KEEP — Services (1):** `deleteProjectWithStorage` je prava orkestracija: owner prije admina, paginirana snimka fotografija/proizvoda, origin direktoriji, Set deduplikacija, DB delete prije Bunnyja i dijagnostika djelomičnog cleanup failurea. Nije passthrough.
- **KEEP — Repositories (10):** generated RPC Args, readovi s RLS clientom; nema direktnih writeova na `projects` ili `project_event_details`. `mapProjectEvent` je čisti mapper u repositories direktoriju, nije problem koji zahtijeva novi sloj.
- **KEEP — Types:** `Project` i details iz generated Tables; `ProjectEvent` je opravdan view model; create/update event Args narrowaju `p_type`.
- **REVIEW — Validation:** create/edit forme dijele `projectEventSchema`, ali poruke u shemi su hardkodirane HR. Server actioni za generic/event RPC-e uglavnom se oslanjaju na DB validaciju, bez zajedničke runtime input sheme. Ne uklanjati DB validaciju. Trenutačni TimePicker `null` ne odgovara form `string` tipu, vidi provjere.
- **KEEP — Utils:** payload i display transformacije imaju različitu odgovornost. **REVIEW — višak:** `createProjectAction` nema consumera; sam `createProject` repository je aktivan u standalone Album flowu i obavezno ostaje. Ne brisati neutralni model zbog neaktivnog actiona.
- **REVIEW — dependency/workflow:** djelomični storage failure nakon uspješnog DB deletea mapira se na običan delete error; retry više ne može ponoviti prvobitni autorizirani delete. Potreban je zaseban recovery UX/operativni retry, ne promjena delete redoslijeda.

### digital-albums

- **KEEP — Pages/Server Components:** canonical resource i project collection readovi kroz repositories; standalone koristi neutralni Project, ne paralelnu detail arhitekturu. PDF route ima user/RLS provjeru i zasebno potpisanu internu render autorizaciju.
- **KEEP — Client Components:** editor/session/flipbook/photo hooks opravdano su velik client subtree. `DigitalAlbumViewer` ima render-prop callback prema ReaderFrameu; ne uklanjati client direktivu samo zato što nema vlastiti useState.
- **KEEP — Actions (10):** code rezultati, CONFLICT/SAVE_FAILED ostaju. **REVIEW:** `getDigitalAlbumProjectPhotosAction` radi query u actionu; description action radi RPC direktno. Premjestiti DB detalje u repository bez passthrough servicea. Client pagination read action je opravdan, nije razlog da initial page read ide preko actiona.
- **KEEP — Services (2):** createInitialized radi owner/create/init/rollback; deleteWithStorage radi paginaciju/delete/orphan/directory cleanup. Nijedan nije višak.
- **REVIEW — Repositories (15):** `uploadDigitalAlbumPhoto` i `removeDigitalAlbumPhoto` orkestriraju storage i druge repositories/services. Kandidati za service sloj uz očuvanje ponašanja; jednostavni RPC wrapperi ostaju repositories.
- **KEEP — Types:** DB Album alias; document/renderer/photo projections su application modeli, ne duplicirane DB tablice. CamelCase input adapteri mapiraju u RPC Args; nisu nužno suvišni.
- **REVIEW — Validation:** nema zasebnog validation direktorija, ali postoji parser i validacija u actionima/repositories/PDF modulu. Provjera photo opisa od 300 znakova nije na jednom mjestu za sve upload/update puteve.
- **KEEP — Utils:** document operations, photo usage/context, revision i layout/presentation utilsi su aktivni i domenski različiti. Sličnost Invitation revision guarda nije razlog za generički session refactor.
- **SAFE CLEANUP — kandidat:** stari `DigitalAlbumPhotoPicker` component/CSS i njegov jedini hook subtree nemaju aktivan UI consumer; postojeći flow koristi AddPhotosDialog/shared primitives. **REVIEW:** `deleteDigitalAlbumAction` nema UI consumer; pripadajući delete service je zato trenutačno nedosegljiv iz aplikacijskog UI-ja. Ne brisati service kao passthrough niti slučajno izgubiti planiranu delete mogućnost.
- **REVIEW — workflow rizici:** upload radi Bunny PUT prije DB autorizacije kroz create RPC. Potreban je pregled resource-derived autorizacije prije skupih storage operacija. U catchu se Bunny datoteka briše bez provjere je li RPC ipak commitan pa je odgovor izgubljen. To može ostaviti DB referencu na obrisanu datoteku; usporediti konzervativniji Invitation recovery.

### invitations

- **KEEP — Pages/Server Components:** kolekcija je 0..N; resource layout/page/context učitavaju konkretnu Invitation i njezin project_id. Whole-document template katalog ostaje management/DB; page-level layouti ostaju editoru.
- **KEEP — Client Components:** editor, catalog filteri, create/publish/manage akcije i interaktivni header. Public renderer nije pretvoren u editor.
- **KEEP — Actions (7 datoteka):** standardni rezultat, validation/conflict mapiranje, create šalje project/template ID bez frontend naming logike. **REVIEW:** description RPC je u actionu; publish action već orkestrira dokument + reference + publish i ima stvarni kandidat za domenski service.
- **KEEP — Services:** nema zasebnih; ne treba ih dodavati jednostavnim RPC wrapperima. **REVIEW:** upload/remove/delete s storage koracima pripadaju service odgovornosti, iako su sad u repositories.
- **KEEP — Repositories (15):** readovi i RPC writeovi; nema direktnog invitation/invitation_photos table writea. Template repo validira parsed document i kategoriju; event_type nije create ograničenje.
- **KEEP — Types:** generated Invitation/Args, parsed Template/document/photo join modeli opravdani. **REVIEW:** `InvitationManagementNavigation` type-only importira `getInvitation` za ReturnType; ne vuče server runtime, ali prikazni props mogu koristiti postojeći Invitation Pick bez vezanja UI-ja na repository potpis.
- **KEEP — Validation/Utils:** parser, shared date/time, reference i revision guardovi nisu mrtvi. `redirectLegacyInvitation` nije čisti utility nego server routing adapter (zaštićen tranzitivnim server importom). **REVIEW:** smjestiti ga u jasno nazvan server/routing prostor samo ako se radi organizacijski cleanup; ne brisati legacy URL kompatibilnost.
- **REVIEW — workflow:** `manageInvitation.deleteInvitation` nakon DB deletea samo provjerava prazni origin direktorij. Nema snimke svih relation photo ID-eva i orphan sweepea kao Album delete. Bez potvrđenog DB cleanup mehanizma mogu ostati nekorišteni ProjectPhoto zapisi/datoteke. To nije razlog da se origin direktorij nasilno obriše.
- **KEEP — višak:** nema potpuno neimportiranog Invitation repositoryja. Tests su entrypointi, nisu mrtav kod.

### photo-walls

- **KEEP — Pages/Server Components:** canonical resource pages + management data loader; public čita public RPC. Resource relation daje Project kontekst.
- **KEEP — Client Components:** upload, gallery/lightbox, pagination, management controls i material editor su interaktivni.
- **KEEP — Actions (11):** code boundary, client pagination readovi opravdani; material CONFLICT se interno prepoznaje po tehničkoj poruci, ne prikazuje je korisniku. **REVIEW:** description action ima direktan table update; opis DB pristupa niže.
- **REVIEW — Services (0)/Repositories (18):** upload/remove i material create su stvarna orkestracija unutar repositoryja. `createPhotoWallMaterial` radi i18n default content, template resolution, auth i insert: default sadržaj legitimno može biti lokaliziran, ali orkestracija pripada serviceu; nije prijevod backend errora.
- **KEEP — Types:** Row/Args aliasi i photo/page/render projekcije su smisleni; **SAFE CLEANUP — kandidat:** neupotrijebljeni `PhotoWallPhotoAssociation` export.
- **KEEP — Validation:** pagination i material schemas aktivni. **REVIEW:** server public upload description se trimma, ali nema istog max(300) guarda kao naknadno uređivanje; DB limite nije moguće usporediti bez SQL definicija.
- **KEEP — Utils:** public path i apsolutni URL builder imaju različite ulaze/izlaze, nisu dokazano duplicirani. **SAFE CLEANUP — kandidat:** neimportirani preview dataset `previewPhotoWallPhotos.ts`.
- **REVIEW — dependency/workflow:** direktni writeovi nisu svi ista stvar. Javni guest upload koristi admin tek nakon provjere public_id/is_public/published_at; ne zamijeniti ga owner guardom. Multi-step insert + rollback i Bunny catch trebaju provjeru partial-commit scenarija. Ako rollback ProjectPhoto DELETE ne uspije, vanjski catch i dalje briše Bunny datoteku.

### project-photos

- **KEEP — Pages/Client/Actions/Repositories/Validation:** nema zasebnih; ovo je shared photo domain, ne novi UI proizvod.
- **KEEP — Services (4):** sva četiri imaju server-only; directory helperi kombiniraju origin usage count i storage delete, pa nisu passthrough. Orphan service provjerava sve tri relation tablice, fail-closed na nepoznatom countu, zatim DB DELETE pa Bunny DELETE.
- **KEEP — Types/Utils:** generated ProjectPhoto i aktivni URL resolver. Origin nije isto što i jedino mjesto korištenja.
- **REVIEW — concurrency:** usage count pa DELETE nisu atomski. Concurrent relation insert između ta dva koraka ovisi o stvarnom FK/transaction ponašanju; generated types to ne dokazuju. Za robustan popravak treba zasebna DB odluka, ne refactor ovog audita.
- **REVIEW — recovery:** storage failure se logira i throwa nakon DB deletea. Nema trajnog retry zapisa; ne vraćati obrisani DB row.

### project-collaboration

- **KEEP — Pages/Server Components:** project collaborators i invitation-response routeovi čitaju podatke server-side; token response je client interakcija.
- **KEEP — Client Components:** `CollaborationLinkForm` i `CollaborationInviteResponse`, next-intl code prikaz.
- **REVIEW — Actions (6):** aktivan `collaborationUiActions.ts` već radi invite i accept/decline, a pet pojedinačnih action datoteka nema consumera. Invite/accept/decline su alternativni boundaryji prema istim repositories; cancel/remove nemaju aktivan UI put. Njihovo uklanjanje ili povezivanje treba razlikovati od brisanja domenske mogućnosti.
- **KEEP — Services:** nema; jednostavni RPC flow ne treba service. **REVIEW — auth:** createCollaborationLink duplicira owner lookup umjesto postojećeg helpera; provjera nije nova autorizacijska semantika. Ne uklanjati DB autorizaciju.
- **KEEP — Repositories (8):** read/RPC wrapperi. Cancel/remove repo imaju samo consumer u neaktivnom action subtreeju; nisu dokaz aktivne funkcionalnosti samo zato što imaju jedan import.
- **SAFE CLEANUP — kandidati:** neimportirana `projectCollaboration.schema.ts`; neupotrijebljeni `ProjectCollaboratorRow` i `ProjectCollaborationInviteStatus` exporti.
- **REVIEW — Validation:** aktivni action ima vlastitu Zod email/UUID validaciju, a stara shema ostaje paralelna/mrtva. Zadržati jedan stvarno korišten domain schema ako se cleanup provodi. Nema zasebnih utils.

### auth

- **KEEP — Pages/Client:** app routeovi su server; Login/Register forme i AuthProvider trebaju client. Providers/third-party primitive wrapperi nisu automatski višak zato što sami nemaju useState.
- **KEEP — Repositories (3):** browser Supabase Auth signIn/signUp/signOut su opravdana iznimka od UI → Server Action pravila. Auth nije direktni write na zaključane Project tablice. Nema actions/services.
- **KEEP — Types/Validation/Utils:** form input tipovi, dvije schema factory funkcije primaju lokalizirane poruke; `authErrors` mapira tehničke greške u kontrolirani auth model.
- **REVIEW:** AuthProvider ima ESLint effect/state nalaz; ne prepravljati session ponašanje radi utišavanja pravila. Nije pronađen neimportirani auth modul.

### profile

- **KEEP:** nema zasebnog page/client/action/service flowa u featureu; AuthProvider koristi browser `getProfile`, SELECT kroz RLS. `Profile` je generated row.
- **SAFE CLEANUP — kandidat:** `UpdateProfileInput` ima samo deklaraciju, bez update consumera. Nema zasebnih validation/utils ni potrebe za service wrapperom.

### dashboard

- **KEEP — Pages/Server Components:** DashboardOverview/Projects/Invites kompozicija i `getDashboardProducts` read agregacija. Product sažetak je opravdan view rezultat više tablica, nije DB row duplikat.
- **KEEP — Client:** onboarding interakcija. Nema actions/services/types/validation/utils direktorija. Repository ne importira UI/action. Nije pronađen mrtav feature modul.

### editor

- **KEEP:** shared text/date-time/photo/framing/page primitives, editor view tipovi i photo style utility; nema domain repositories/actions/services. Client granice imaju state, callbacks i browser mjerenje; ne pomiču se automatski.
- **KEEP — Validation:** date/time helper i description kontrola pripadaju shared UI semantici. Tests se izvršavaju kao entrypointi.
- **REVIEW:** description limit 300 ponovljen je u shared UI i više server adaptera. Moguće izdvojiti malu čistu konstantu/schema gdje su pravila ista; ne povezivati shared UI s proizvodom i ne uklanjati serversku validaciju.
- **KEEP:** nisu pronađeni shared editor → product repository/action importi koji bi zahtijevali product switch.

### management

- **KEEP:** shared status, header, name edit, link i status-action primitive; interaktivni dijelovi ostaju client. Nema domain actions/services/repositories/types/validation/utils.
- **SAFE CLEANUP — kandidat:** `ManagementDeleteDangerZone` nema consumer; nije dokaz da je delete workflow implementiran u UI-ju. Lokalni drugi danger zoneovi ne opravdavaju novi universal manager.

### photo-upload

- **KEEP:** shared client composer/controls/dialog/hooks i preview helper; onSubmit callback prepušta domensku operaciju calleru. Nema action/service/repository sloja ni DB row modela.
- **KEEP:** object-URL preview upravljanje browser resursom opravdano nije matematički čista funkcija. Nije pronađen mrtav feature modul.

### seating

- **KEEP:** postoji samo project route s prezentacijskim placeholderom. Nema Seating feature domene, actions, services, repositories, types, validation ni persistencea za audit/cleanup. Ne uvoditi ih radi simetrije s ostalim proizvodima.

## REVIEW — direktni DB writeovi i granice slojeva

| Mjesto | Stvarni write | Zaključak |
|---|---|---|
| photo-walls/actions/photos/updatePhotoWallPhotoDescriptionAction.ts | user client UPDATE photo_wall_photos | Auth owner guard postoji; DB implementacija je u actionu. Ako je ta tablica SELECT-only, ovo neće raditi; grant/RPC status treba potvrditi iz DB-a. |
| photo-walls/repositories/materials/createPhotoWallMaterial.ts | user client INSERT photo_wall_materials | Nije RPC flow. Provjeriti postojeći ugovor/grantove prije zamjene; audit ne izmišlja novi RPC. |
| photo-walls/repositories/materials/updatePhotoWallMaterial.ts | user client UPDATE photo_wall_materials s expected updated_at | Čuva optimistic locking; ne mijenjati u slijepi update. |
| photo-walls/repositories/photos/createPhotoWallPhoto.ts | admin INSERT project_photos + photo_wall_photos; rollback DELETE project_photos | Namjerni public upload put s provjerom public walla u calleru; višekoračni workflow i failure recovery za pregled. |
| project-photos/services/deleteOrphanProjectPhoto.ts | admin DELETE project_photos | KEEP za postojeći DB-before-Bunny princip; concurrency REVIEW opisan gore. |

Nema direktnih table writeova na projects, project_event_details, invitations, invitation_photos ili digital_album_photos u pregledanom sourceu. To ne znači da je sav DB pristup u aplikaciji RPC-only.

**REVIEW:** potvrđeno sedam repository → service import veza u removeDigitalAlbumPhoto, removeInvitationPhoto, deletePhotoWallPhoto i manageInvitation. Upload repositories također direktno koriste Bunny. Kratko ciljano rješenje je premjestiti orkestraciju u postojeći feature service prostor, a ne dodati Manager/Handler slojeve.

**KEEP:** nisu pronađene repository → action/UI, service → action, types → repository ni global lib → feature import veze. Services/repositories ne importiraju ActionResult. Server-only services svi imaju eksplicitni guard; server repositories bez vlastitog guarda uglavnom ga već nasljeđuju preko Supabase server/admin importa.

## REVIEW — error boundary i cache

- ActionResult/code ugovor je dosljedan; nema `result.message` u source consumerima. Raw repository error.message koristi se za throw/log ili internu CONFLICT klasifikaciju, ne kao action response poruka.
- HR/EN `Common.errors` imaju istih 30 ključeva. Custom album recovery error i editor conflict kodovi ostaju KEEP.
- `collaborationUiActions` koristi inferirane literalne result tipove umjesto eksplicitnog ActionResult aliasa; shape je kompatibilan, nije potreban mehanički refactor.
- Brojni actioni revalidiraju cijeli `"/[locale]/dashboard", "layout"`. To može biti opravdano cross-product sažecima, ali je široko; prije sužavanja popisati affected views i izmjeriti navigaciju. Read-only pagination actioni ne trebaju revalidation.
- Album actions koriste i konkretne `/editor/album/...` putanje bez localea, dok drugi koriste lokalizirane route patterne. To je REVIEW za cache/invalidation pokrivenost HR/EN, ne razlog za mijenjanje routeova u auditu.
- PDF API koristi kontrolirane HTTP error stringove, ne ActionResult; client ne mora dijeliti action envelope s binary download endpointom. KEEP.

## SAFE CLEANUP / REVIEW — neaktivni kandidati i dokaz

Navedeni simboli potvrđeni su import grafom i dodatnom tekstualnom pretragom. Nisu obrisani. Statički nedosegljivo nije isto što i poslovno nepotrebno.

| Klasifikacija | Kandidat | Dokaz / razlog |
|---|---|---|
| SAFE CLEANUP | DigitalAlbumPhotoPicker.tsx + module.css + useDigitalAlbumPhotoPicker.ts | Component ima nula importera; hook i CSS koriste se samo iz njega. Novi aktivni panel koristi drugi flow. |
| SAFE CLEANUP | ManagementDeleteDangerZone.tsx i pripadajući lokalni CSS | Nula component importera; uklanjanje CSS-a tek uz komponentu. |
| SAFE CLEANUP | previewPhotoWallPhotos.ts | Dataset ima samo deklaraciju i nema importera. |
| SAFE CLEANUP | projectCollaboration.schema.ts | Nema importera; aktivna forma/action ne koristi ovu shemu. |
| SAFE CLEANUP | PhotoWallPhotoAssociation, ProjectCollaboratorRow, ProjectCollaborationInviteStatus, UpdateProfileInput | Pretraga nalazi deklaracije, bez stvarnih consumer referenci. |
| SAFE CLEANUP | lib/upload/getBunnyPath.ts; lib/utils/timezone.ts; lib/countries/countries.ts | Nema importa ni pronađene runtime registracije. Kandidati za uklanjanje, ne poziv za izmišljanje timezone featurea. |
| REVIEW | 5 pojedinačnih collaboration actiona | Nula importera; tri dupliciraju aktivni combined UI action, cancel/remove predstavljaju nedovršene UI mogućnosti. |
| REVIEW | deleteDigitalAlbumAction → deleteDigitalAlbumWithStorage | Root action bez consumera; service ima stvarnu domensku svrhu. Odluka o delete UI-ju prije uklanjanja. |
| REVIEW | createProjectAction | Nula UI consumera, ali neutralni createProject repository aktivan i namjerno zadržan. |
| REVIEW | OnboardingCard, ResetButton, Search, SelectFilter, stat-card, Stepper | Nula importera u trenutačnom src grafu; shared UI katalog može biti namjerno pripremljen. Ne brisati samo zato što trenutno nije na ruti. |
| KEEP | data-table/index.ts, side-navigation/index.ts, lib/forms/index.ts | Neimportirani barrel entrypointi; implementacije se koriste direktnim importima. Ne proglašavati cijeli UI mrtvim. |
| KEEP | src/proxy.ts, src/i18n/request.ts, app/* entrypointi, *.test.cjs | Framework/config/test entrypointi. request.ts naveden u next.config.ts; nula application importera nije mrtav kod. |

## KEEP / REVIEW — types, validation, utils i stari modeli

- KEEP: osnovni Project/Profile/Invitation/Album/PhotoWall/ProjectPhoto modeli koriste generated Tables. Form, joined-photo, document, renderer i pagination tipovi nisu jedna tablica i opravdano su ručni.
- KEEP: nema eksplicitnog `any` ni `as unknown` nalaza u pregledanom feature sourceu. `as const` za enum/literal result i ArrayBuffer castovi u image pipelineu nisu sami po sebi pogrešni.
- REVIEW: jednaki description max limiti i UUID validacije rasuti su u actionima/repositories; mala shared schema/konstanta može smanjiti drift. Ne treba globalna schema za svaki UUID niti novi sloj za jedno polje.
- REVIEW: Project form schema vraća HR poruke; Auth schema factory je postojeći primjer kako lokalizirati form validaciju. DB limite nije moguće dokazati iz Args string tipova. Nije utvrđeno da max 150/100/250 nužno odgovaraju deployed CHECK pravilima.
- KEEP: local-date string builder i locale display formatter nisu isti formatter; Album formatter dodatno čuva legacy free text. Ne spajati ih naslijepo.
- KEEP: nisu pronađeni aktivni `event_photos` queryji, stari Event repository modeli ni frontend `create_photo_wall` pozivi. Event i dalje legitimno postoji kao project_event_details/view model.
- SAFE CLEANUP kandidat: stari komentari/log labeli `Event Photo` u photo-wall create/remove i album remove. Kozmetički ostaci, ne stari storage model.
- KEEP: `redirectLegacyInvitation` i stare nested route datoteke su aktivni kompatibilni URL adapteri; ne smiju se brisati na temelju nedostatka Link consumera. Project Photo Wall tab trenutačno prikazuje ProjectPhotoWallSummary: nije mrtav route.
- REVIEW: UI Logo još prikazuje `Memiva`; `memiva` je i PhotoWall color token. Branding tekst i persisted token nisu ista migracija.
- KEEP: `invio.b-cdn.net`, package name `invio` i `x-invio-pdf-render` su postojeći infrastrukturni identifikatori. Ne mijenjati ih samo zbog naziva Memora. Nema pronađenih MemoriLink source ostataka.

## REVIEW — loading pri promjeni ruta

Trenutačno postoji samo `src/app/loading.tsx` → postojeći AppLoader. Svi app page/layout moduli ostaju Server Components. Lokalna dokumentacija instaliranog Nexta potvrđuje da loading wrapa page i child segmente, ali ne svoj layout, i da shared layouti mogu ostati interaktivni.

Root loading je globalni Suspense fallback, **nije univerzalni indikator svakog klika na Link ili router.push**. Već prikazani sadržaj može ostati vidljiv tijekom transitiona; cached/prefetched navigacija može završiti bez spinnera. Form submit pending, photo pagination i upload pending trebaju vlastiti postojeći UI state, ne root loader.

Preporuka, bez implementacije u ovom auditu:

1. Zadržati root loading za početni/široki fallback.
2. Dodati lokalni `app/[locale]/(dashboard)/dashboard/loading.tsx` koristeći postojeće primitive; tako dashboard shell ne mora nestati dok se učitava sadržaj. AppLoader CSS trenutno ima `min-height: 100vh`, pa ga ne kopirati nekritički unutar malog panela; postojeći Skeleton je bolji za content fallback.
3. Za Invitation i Photo Wall unutarnje tabove razmotriti resource loading boundary ispod njihovog layouta da product header/tabovi ostanu. Layout sam čita resource i Project context; child loading neće pokriti taj layout. Dashboard-level boundary pokriva početni ulazak u resource layout.
4. Project header/nav trenutno su u `ProjectWorkspacePage` compositionu pozvanom iz pageova, ne persistent project layoutu. Lokalni loading sam po sebi neće jamčiti očuvanje tog headera između svih product tabova. Premještanje headera je zasebna REVIEW odluka, ne nužan uvjet da loader radi.
5. SideNavigation koristi postojeći next-intl Link/pathname, bez posebnog pending feedbacka. Ako se na sporoj vezi klik doima inertan, dodati diskretan link-level pending koristeći Next infrastrukturu, ne globalni fake timer. Potrebna browser provjera s usporenim requestima; nije provedena u ovom auditu.

Ne treba loader u svakoj sitnoj ruti niti loading state za običnu controlled tab promjenu unutar editora.

## Provjere nakon SAFE CLEANUP

- TypeScript: **ne prolazi**. Jedna postojeća greška `ProjectEventScheduleSection.tsx:25`: TimePicker daje `string | null`, form očekuje `string`. Zabilježena i prije tri cleanup promjene. REVIEW popravak: dogovoriti praznu vrijednost na UI adapteru (`null` naspram `""`), ne type assertion.
- ESLint `src`, zatim puni ESLint `.` nakon cleanupa: **ne prolazi**, isti rezultat 8 errors / 4 warnings, postojeći nalazi. Errors: BackToTop effect/state; Page prazni interface; FilePicker ref/render; Skeleton prazni interface; tooltip prazni interface; AuthProvider effect/state; usePhotoWallUpload ref/render; generated database.types.ts UTF-16/binary parsing. Warnings su četiri `<img>` mjesta. Generated types nisu ručno prepisani; encoding riješiti u generation pipelineu odvojeno.
- Targeted ESLint triju promijenjenih runtime datoteka + audit scripta: **prolazi**.
- Svi trenutačno dostupni `src/**/*.test.cjs`: **15/15 prolazi**, četiri datoteke (description UI/actions, library, template catalog). Trenutačno nema zasebnih action-boundary/recovery testova u working treeju; raniji broj testova iz dokumentacije nije dokaz današnjeg stanja. REVIEW: dodati regresije album partial-create retryja i cleanup failure scenarija u zasebnoj implementaciji.
- Circular dependencies: package nema dedicated alat; TypeScript-resolved SCC provjera našla je **0 statičkih runtime ciklusa**, type-only edgeovi izuzeti. To nije tvrdnja o nepoznatim dinamičkim runtime importima.
- HR/EN Common.errors: **30/30 identičnih ključeva**. Nema repository/service ActionResult importa; nema starog `result.message` contracta u source consumerima.
- Browser/production build/live DB/RPC/grantovi nisu validirani ovim auditu. Tsc/ESLint blokade navedene su bez tvrdnje da je cijeli projekt green.

## Predloženi redoslijed REVIEW rada

1. Upload auth prije storagea i partial-commit cleanup rizici; Invitation delete orphan sweep; operativni storage retry.
2. Potvrditi stvarne Photo Wall grants/RPC ugovore za postojeće direktne writeove.
3. Riješiti trenutni TS form contract i ESLint nalaze uz relevantne behavior testove.
4. Uvesti lokalne loading boundaryje nakon provjere na sporoj navigaciji.
5. Tek zatim mali layer cleanup (upload/remove/material service odgovornosti), deaktivirani actioni i shared katalog kandidati. Bez novih generičkih Manager/Handler slojeva.
