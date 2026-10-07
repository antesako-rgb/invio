# Project Guests — UI/UX polish

## Audit postojećih rješenja

Pregledani su DataTable, DataTableToolbar i table primitive, DropdownMenu (uključujući radio stavke i destructive stavke), Badge, Search, TabsFilter, Select, Dialog/ConfirmDialog, Sheet, Drawer, PageHeader, Card i mobilna navigacija. Pregledani su i postojeći matchMedia obrasci u editorima. Nema zajedničke gotove Sheet/Drawer switch komponente.

DataTable je composition primitive: prima data, toolbar, children, empty/loading state i pagination slot. Ne sadrži sorting/search/filter engine. Zato nije uvedena nova logika sortiranja ni paralelni filtering engine; zadržana je postojeća Guests pretraga i filtriranje. Ponovno su iskorišteni DataTable container, toolbar slot, DataTableToolbar i Table/Header/Body/Row/Head/Cell, uključujući postojeći border, hover i overflow stil.

## Završni prikaz

1. Desktop koristi postojeći DataTable jer odgovara strukturiranim podacima gosta.
2. Ponovno koristi composition/toolbar API i sve postojeće table primitive. Loading na razini rute i početni EmptyState ostaju postojeći; filter bez rezultata zadržava toolbar.
3. Desktop red: Gost | Grupa | RSVP status | Akcije. Bez grupe prikazuje se —. Nema ukrasnih avatara.
4. Mobile (<768 px) ima zasebnu Card prezentaciju: ime i opcionalna grupa uz •••, ispod full-width RSVP. Isti row action i status render koriste se za oba prikaza; desktop tablica skrivena je CSS-om.
5. Jedan RSVP control: postojeći Button/Badge kao DropdownMenu trigger, zatim RadioGroup/RadioItem. Status ima dot, boju i strelicu, bez ponovljenog Selecta. Promjena i dalje poziva istu manual RSVP akciju s istim payloadom.
6. Row actions koriste postojeći DropdownMenu: Uredi gosta i destructive Obriši gosta; brisanje otvara postojeći ConfirmDialog.
7. Toolbar ponovno koristi TabsFilter horizontalni overflow, bez smanjivanja fonta. Njegov flex roditelj ima min-width: 0 pa scroll radi unutar dostupne širine. Search je postojeća Search komponenta; na užim širinama prelazi u puni red. Broj rezultata ostaje diskretan.
8. Desktop management otvara postojeći desni Sheet s Header/Title/Description/Footer/Close.
9. Mobile management otvara postojeći donji Drawer s Header/Title/Description/Footer/Close. Handle-only swipe čuva interakciju s inputima; visina je ograničena viewportom i koristi postojeći safe-area padding.
10. `GuestManagementSurface` bira primitive preko useSyncExternalStore/matchMedia. Prima jedan render sadržaja; GuestForm nije dupliciran. Ime i prezime su jedan ispod drugoga. Forma scrolla, a footer je sticky i koristi postojeće footer primitive. Busy sprečava zatvaranje.
11. Grupe koriste isti wrapper, Sheet/Drawer i postojeći rename/create sadržaj. Ostaju unutar Guests područja. Delete confirmation ostaje centralni Dialog.
12. Back label je naziv Projecta bez prefiksa Natrag. Mobile primarni CTA zauzima većinu širine; Grupe su sekundarni icon action s lokaliziranim accessible nazivom. Dodatni donji razmak čuva listu od bottom navigationa.

## Datoteke ovog polish zadatka

- Dodano: `src/features/project-guests/components/GuestManagementSurface.tsx`.
- Izmijenjeno: `ProjectGuests.tsx`, `ProjectGuests.module.css`, `ProjectGuestForm.tsx`, `ProjectGuestGroupsDialog.tsx` u istom components direktoriju.
- `src/components/ui/search/Search.tsx`: dodatni opcionalni clearLabel za HR/EN, kompatibilan s postojećim korištenjima.
- `src/messages/hr/project-guests.json`, `src/messages/en/project-guests.json`: nazivi stupaca, row actions i clear search.
- `src/features/project-guests/tests/projectGuests.test.cjs`: usklađen UI harness i dodana provjera surface switcha.
- Ovaj audit dokument.

Data layer, RPC, schema validacija, server actions i poslovna pravila nisu mijenjani.

## Provjere i ograničenja

- TypeScript cijelog projekta: prolazi.
- ESLint izmijenjenog UI-ja, Searcha i Guests testova: prolazi.
- 26 testova: prolaze (11 Guests, 15 postojećih).
- Surface grane testirane su za 320, 360, 375, 390, 430, 768 i 1280 px pomoću simuliranog media stanja. Statički su pregledani layout, min-width, horizontalni scroll, mobile cards, scroll forme, footer i z-index iznad bottom navigationa.
- To nije browser render provjera. Browser ponovno vraća prazan popis povezanih preglednika. Stvarne screenshot/viewport provjere svih navedenih širina, focus return nakon menu → Sheet/Drawer i soft keyboard ponašanje nisu potvrđeni i trebaju se provjeriti u aplikaciji kada preglednik bude dostupan.
