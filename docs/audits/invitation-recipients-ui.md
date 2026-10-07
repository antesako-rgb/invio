# Invitation Recipients — compact management UX

## Patterns i implementacija

Prije izmjena pregledani su ProjectGuests.tsx/CSS, GuestManagementSurface, shared DataTable/table i toolbar, Search, Avatar/getInitials, Badge, Button/Input/Select, Stepper, Dialog/ConfirmDialog, Sheet/Drawer i DropdownMenu. Checkbox primitive nije pronađen pa je sačuvan native checkbox pattern. Koriste se postojeći design tokeni i CSS Modules.

Recipient stranica ima section header, primarni Dodaj primatelja, client Search i broj rezultata. Desktop ponovno koristi DataTable, toolbar slot i Table/Header/Body/Row/Head/Cell. Stupci su Primatelj | Kontakt | Gosti | Akcije. Primatelj je primary gost, uz mali postojeći Avatar i skalabilni sažetak dodatnih gostiju (+ N) ispod; email/phone su sekundarni. Nema dekorativnih bulk checkboxova bez odgovarajućih akcija.

Mobile (<768 px) koristi kompaktne Card redove, isti identity renderer i dropdown, kontakte i broj gostiju. Search je full-width. Zadržan je dodatni bottom-nav prostor. Nije uvedena nova responsive table infrastruktura.

## Details, edit i delete

Klik na ime ili Details u postojećem dropdownu otvara postojeći Project Guests GuestManagementSurface: desni Sheet na desktopu, donji Drawer na mobileu. Details prikazuje primary ime, kontakte i sve goste s primary badgeom i avatarima. Selektira se recipient ID pa se details izvodi iz aktualnih server props nakon revalidacije. Edit otvara isti strukturirani flow s prepopunjenim vrijednostima i update RPC akcijom. Delete zadržava postojeću destructive ConfirmDialog i delete akciju.

Ne postoji Copy link u detailsu ili na postojećim recipientima. Nema pokušaja rekonstrukcije tokena.

## Trokorakna forma

Forma ponovno koristi postojeći Stepper:

1. Gosti: Search po imenu/prezimenu, native checkbox i Avatar. Gosti drugih recipienta iste Invitation izostavljeni su. Search ne uklanja odabrane goste iz drafta. Project Guest nema kontakte, zato ih ovdje ne izmišljamo.
2. Postavke: primary iz odabranih gostiju, helper za personalizaciju, email/phone. Koristi se isti recipientFormSchema: email optional trim/lowercase 3–320, phone optional trim 1–50, barem jedan kontakt i primary u izboru.
3. Pregled: primary ime, svi gosti/primary badge i kontakt. Tek Kreiraj primatelja zove postojeći create action. Edit na završnom koraku zove update action.

Back čuva odabir i kontakte. Uklanjanje odabranog primary gosta poništava primary izbor. Konačni submit ponovno validira payload. Busy/lock, errors/toasts i revalidation ostaju postojeći. Form content scrolla, a postojeći Sheet/Drawer footer je sticky.

## One-time success i sigurnost

Create uspjeh ostavlja otvoren završni surface s kreiranim gostima, primary oznakom i linkom iz upravo vraćenog tokena, Copy i Gotovo. Raw token/izvedeni link živi samo u privremenom React success stateu. Gotovo, X i zatvaranje surfacea brišu link i summary. Nema localStorage/sessionStorage, logginga ili analytics poziva. Clipboard write događa se isključivo na korisnički Copy click. Stara poruka da personalized stranica još nije dostupna ne renderira se jer Phase 3 postoji.

Repositories, actions, schema, RPC i baza nisu mijenjani. Recipient SELECT ostaje `id,project_id,invitation_id,email,phone,created_at,updated_at`, bez wildcarda i token_hash. Postojeća projection i mapper ne uključuju response podatke, zato nema RSVP stupca niti fake statusa. Table composition omogućuje dodavanje pravog stupca kasnije bez uvođenja novog UI sustava.

## Datoteke

Izmijenjeno:

- src/features/invitations/components/InvitationRecipients/InvitationRecipients.tsx
- src/features/invitations/components/InvitationRecipients/InvitationRecipientForm.tsx
- src/features/invitations/components/InvitationRecipients/InvitationRecipients.module.css
- src/features/invitations/tests/recipientContract.test.cjs
- src/messages/hr/invitations.json
- src/messages/en/invitations.json

Dodano:

- src/features/invitations/components/InvitationRecipients/recipientPresentation.ts
- src/features/invitations/tests/recipientUi.test.cjs
- Ovaj audit.

Nisu mijenjani shared UI primitive ni ostatak Invitation managementa.

## Provjera

Završni polishing grupira Kontakt i Goste u semantičke sekcije Details surfacea, uz diskretan separator i ikone kontakta. Details menu akcija ima ikonu i zadržava postojeće hover/focus ponašanje. Disabled Dodaj primatelja ima povezani helper koji objašnjava nedostatak dostupnih gostiju i poveznicu na Project Guests. Trokorakni flow i one-time success nisu mijenjani. Nakon ovog passa TypeScript i ESLint prolaze, kao i svih 13 recipient contract/UI testova, uključujući Copy i čišćenje success statea.

TypeScript cijelog projekta prolazi; ESLint izmijenjenog/dodanog UI/CJS koda prolazi. Svih 47 relevantnih testova prolazi. Novi/usklađeni testovi pokrivaju search, primary identity, tri koraka i validaciju, odabir gostiju, draft/back, konačni submit, konflikt, edit/delete/details i one-time Copy/close behavior te HR/EN.

Responsive CSS i postojeći Sheet/Drawer switch pregledani su statički. Browser runtime nema povezanu sesiju, pa stvarni viewport/screenshot, fokus kroz Sheet → confirm i live RPC flow nisu potvrđeni. Ručno provjeriti desktop, tablet i 320–430 px te mobile keyboard/footer ponašanje.
