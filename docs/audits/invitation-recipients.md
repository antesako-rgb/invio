# Invitation Recipient management

Implementiran je prvi korak migracije: application contract i recipient management unutar postojeće `/dashboard/invitations/[invitationId]/guests` rute. Nema public RSVP implementacije, response managementa, promjene Invitation document schema ili baze.

## Dodane datoteke

U `src/features/invitations/`:

- `types/invitationRecipient.types.ts`
- `validation/invitationRecipient.schema.ts`
- `repositories/recipients/getInvitationRecipients.ts`
- `repositories/recipients/mutateInvitationRecipients.ts`
- `actions/recipients/recipientError.ts`
- `actions/recipients/invitationRecipientActions.ts`
- `components/InvitationRecipients/InvitationRecipients.tsx`
- `components/InvitationRecipients/InvitationRecipientForm.tsx`
- `components/InvitationRecipients/InvitationRecipients.module.css`
- `tests/recipientContract.test.cjs`

Dodani su `loading.tsx` i `error.tsx` u `src/app/[locale]/(dashboard)/dashboard/invitations/[invitationId]/guests/` te ovaj audit.

## Izmijenjene datoteke

- Postojeći `guests/page.tsx` zamjenjuje placeholder stvarnim managementom.
- `src/lib/actions/actionErrorCodes.ts`: recipient kodovi.
- `src/messages/hr/invitations.json`, `src/messages/en/invitations.json`: forme, popisi, potvrde, one-time link i loading/error poruke.
- `src/messages/hr/common.json`, `src/messages/en/common.json`: lokalizirane greške.

## Contract i sigurnost

Recipient application tip je Pick generated Row tipa s isključivo javnim management poljima. SELECT koristi `id,project_id,invitation_id,email,phone,created_at,updated_at`; nema wildcarda niti token_hash. Invitation Guest veze također imaju eksplicitnu projection. Repository spaja veze s postojećim Project Guests i vraća recipienta s imenima i primary oznakom. Project određuje server iz dostupne Invitation, ne korisnički form payload.

Create/update/delete prolaze kroz server action, strogu Zod validaciju i postojeći RPC. Autorizacija i konačna integrity pravila ostaju u RLS/RPC-u. Nema direct table writeova. UI izostavlja goste već povezane s drugim recipientom iste Invitation; to je UX pomoć, ne zamjena za DB zaštitu.

Email je optional, trim/lowercase i 3–320 znakova; phone je optional, trim i 1–50 znakova. Prazna polja postaju null, potreban je barem jedan kontakt. Nema email/phone regexa. Potreban je barem jedan guest ID i primary među odabranima. Generated scalar RPC Args deklariraju string i za nullable kontakte; uska compatibility assertion ostaje samo na RPC granici.

Create RPC generated return je tablični rezultat: repository zahtijeva jedan rezultat i iz njega izdvaja recipient_id i raw token. Update RPC vraća DB row s hashom, ali repository taj rezultat odbacuje i vraća void; hash nikad ne prolazi u ActionResult/UI.

Raw token create action vraća isključivo kao create rezultat. Client sastavlja `/invitation/rsvp/{token}` pomoću postojeće next-intl putanje i trenutnog origina. Poveznica živi samo u lokalnom React stateu, briše se zatvaranjem success prikaza, nije dio recipient modela niti browser storagea. Nema lažne Copy link akcije za postojeće recipiente. Success prikaz objašnjava da je to jedina prilika za kopiranje i da public stranica još nije implementirana.

## UI i feedback

Popis prikazuje kontakt, povezane goste i primary badge. Postojeći DropdownMenu daje edit/delete. Forma koristi postojeće Dialog, Field, Input, Select i Button primitive; guest izbor koristi native checkbox jer zajednički Checkbox nije pronađen. Delete koristi postojeći ConfirmDialog. Mutations revalidiraju postojeću Guests rutu. Pending stanje zaključava interakciju i zatvaranje; greške zadržavaju formu za ponovni pokušaj. HR/EN toastovi i poruke ne prikazuju raw PostgreSQL tekst.

Dodani su `RECIPIENT_ACTION_FAILED` i `RECIPIENT_GUEST_CONFLICT`. Postojeći FORBIDDEN, NOT_FOUND i INVALID_INPUT ponovno se koriste. Poznati SQLSTATE i konzervativni business message obrasci mapiraju se u te kodove; nepoznate greške imaju sigurnu lokaliziranu fallback poruku.

## Provjera

- TypeScript cijelog projekta: prolazi.
- ESLint dodanih/izmijenjenih TS/TSX/CJS datoteka: prolazi.
- 21 relevantan test: prolazi, uključujući 8 recipient testova.
- Testovi pokrivaju contact normalization i limite, primary/guest validaciju, explicit SELECT, sva tri RPC-a, odbacivanje update hash rezultata, create token, revalidation, HR/EN, mutation lock, zatvaranje one-time linka i neuspjeh koji čuva formu.
- Nema direct table writeova, local/session storagea, token_hash u application modelu/UI-ju ili novih public RSVP RPC poziva.
- Stvarni CRUD na povezanoj bazi i vizualna provjera nisu izvršeni: Browser nema povezanu sesiju. Nije potrebna dodatna UX odluka za ovaj implementirani korak.
