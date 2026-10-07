# Invitation Generic RSVP Settings — Phase 2

Implementirana je zasebna Generic RSVP sekcija u postojećoj `/dashboard/invitations/[invitationId]/settings` stranici. Recipient management, publication flow, dokument pozivnice i baza nisu mijenjani. Nema public RSVP forme niti submit/get public RSVP RPC poziva.

## Datoteke

Dodano u `src/features/invitations/`:

- `validation/invitationRsvpSettings.schema.ts`
- `repositories/invitation/updateInvitationRsvpSettings.ts`
- `actions/invitation/invitationRsvpSettingsError.ts`
- `actions/invitation/updateInvitationRsvpSettingsAction.ts`
- `components/InvitationManagement/InvitationGenericRsvpSettings.tsx`
- `components/InvitationManagement/InvitationGenericRsvpSettings.module.css`
- `tests/genericRsvpSettings.test.cjs`

Izmijenjeno:

- `src/features/invitations/types/invitation.types.ts`: isključivo novi write input izveden iz generated RPC Args, s nullable capacity izvedenim iz postojećeg Invitation tipa. Nema novog Invitation read modela.
- `src/app/[locale]/(dashboard)/dashboard/invitations/[invitationId]/settings/page.tsx`: dodana sekcija iza publication kartica.
- `src/lib/actions/actionErrorCodes.ts`: `INVITATION_RSVP_SETTINGS_FAILED`.
- `src/messages/hr/invitations.json`, `src/messages/en/invitations.json`: sekcija `genericRsvpSettings`.
- `src/messages/hr/common.json`, `src/messages/en/common.json`: lokalizirana fallback greška.
- Ovaj audit.

## RPC i validacija

Flow je UI → server action → strict Zod schema → server-only repository → `update_invitation_rsvp_settings`.

Payload ima točno `p_invitation_id`, `p_generic_rsvp_enabled`, `p_generic_rsvp_max_guests` i `p_generic_rsvp_capacity`. Nema direct UPDATE-a. RPC autorizacija ostaje u bazi i dopušta Project membere prema finalnom contractu. Repository koristi usku compatibility assertion jer generated scalar Args deklarira capacity kao number iako finalni SQL contract dopušta null. RPC vraća ažuriranu Invitation; application ne uvodi redundantni rezultat jer forma koristi postojeći read model i revalidaciju Settings rute.

Application validacija prati korisnikov potvrđeni finalni SQL contract: UUID Invitation ID, obavezni boolean enabled, obavezni integer max guests >= 1, capacity null ili integer >= 1. Nema proizvoljnog gornjeg maksimuma, omjera capacity/max guests niti `0 = unlimited` pravila. Prazan obavezni broj nije prešutno pretvoren u 0.

UI koristi postojeće Card, Switch, Field, Input, Select i Button primitive. Capacity mode je Bez ograničenja / Ograničeno: prvi šalje null; drugi zahtijeva unos cijelog broja >= 1. Isključivanje generic RSVP-a ne resetira postavljene limite. Opisi razlikuju osobe po odgovoru od ukupnog broja attending osoba i objašnjavaju da generic RSVP ne stvara Project Guests. Form state se čuva kod greške; pending state i mutation lock sprečavaju dvostruko spremanje.

HR/EN uključuju naslove, opise, unlimited/limited opcije, validation, save success i save failure. Poznati auth/not-found/constraint SQLSTATE kodovi koriste postojeće FORBIDDEN, NOT_FOUND i INVALID_INPUT; ostalo se mapira na novi lokalizirani fallback kod. UI ne prikazuje sirove PostgreSQL poruke.

## Publication nalaz

Settings stranica i dalje prosljeđuje `selected.is_public` status kartici i public link kartici. Public dostupnost prema finalnom contractu zahtijeva i `published_at IS NOT NULL`. Taj prikaz nije refaktoriran u ovom koraku.

## Provjera

- TypeScript cijelog projekta prolazi.
- ESLint dodanog/izmijenjenog TS/TSX/CJS koda prolazi.
- Svih 26 relevantnih testova prolazi: 5 novih settings, 8 recipient, 2 template i 11 Project Guests testova.
- Novi testovi pokrivaju validaciju, null capacity, velike dopuštene vrijednosti bez proizvoljnog maksimuma, RPC payload i propagaciju grešaka, action revalidation/error mapping, HR/EN te form mode switch i dvostruki submit.
- Stvarni RPC CRUD i vizualna provjera u pregledniku nisu izvršeni. Za ovu fazu nakon potvrde finalnog contracta nema neriješene odluke.
