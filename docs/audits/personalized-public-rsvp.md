# Personalized Public RSVP — Phase 3

Implementirana je samo token-based `/invitation/rsvp/[token]` ruta, unutar postojećeg locale/fullscreen route conventiona. Existing public Invitation ruta i generic flow nisu mijenjani. Nema DB, recipient management, generic settings, response management ili seating promjena.

## Dodane datoteke

U `src/features/invitations/`:

- `types/publicRsvp.types.ts`
- `validation/publicRsvp.schema.ts`
- `repositories/rsvp/personalizedRsvp.ts`
- `actions/rsvp/publicRsvpError.ts`
- `actions/rsvp/submitPersonalizedRsvpAction.ts`
- `components/PublicPersonalizedRsvp/PublicPersonalizedRsvp.tsx`
- `components/PublicPersonalizedRsvp/PublicRsvpNotice.tsx`
- `components/PublicPersonalizedRsvp/PublicPersonalizedRsvp.module.css`
- `tests/personalizedRsvp.test.cjs`

Dodani su `page.tsx`, `loading.tsx`, `error.tsx` u `src/app/[locale]/(fullscreen)/invitation/rsvp/[token]/` i ovaj audit.

## Izmijenjene datoteke

- `src/lib/actions/actionErrorCodes.ts`: RSVP_UNAVAILABLE i RSVP_SUBMIT_FAILED.
- `src/messages/hr/common.json`, `src/messages/en/common.json`: njihove poruke.
- `src/messages/hr/invitations.json`, `src/messages/en/invitations.json`: publicRsvp namespace.

## Runtime i submit contract

get_public_rsvp koristi isključivo p_token kroz postojeći authenticated/anon-capable server client, bez service_role. Result prolazi kroz Zod parser:

- Invitation ima public_id, name i document. Document mora biti objekt i prolazi postojeći parseInvitationDocument, bez izmjene document schema.
- Recipient ima boolean has_response i string/null submitted_at.
- Guests imaju UUID invitation_guest_id i guest_id, nullable first_name/last_name, boolean is_primary, attending/not_attending/null status i object/null answers.
- Answers sadrži samo valjane JSON vrijednosti, ne array ili scalar na vrhu. Nema validacije proizvoljne question schema.

Public application tip izveden je iz parsera; UI ne radi s raw RPC Json rezultatima.

Submit payload je točno:

```ts
{
  p_token: token,
  p_guests: [{
    invitation_guest_id: "uuid",
    status: "attending" | "not_attending",
    answers: {}
  }]
}
```

Nema project_id, invitation_id, recipient_id, guest_id ili imena u submitu. Zod odbacuje dodatna polja, pending, ne-object answers, prazan popis i duplicirane invitation_guest_id vrijednosti. UI traži odgovor za svakog gosta iz contexta. RPC je autoritativan za membership i dopuštenost ponovnog submitanja.

Existing response statusi se prepopunjavaju, a existing answers se čuva umjesto prepisivanja praznim objektom. Null answers postaje {} samo u submit payloadu. Ne dodaju se pitanja. Submit success JSON nema specificiran shape, pa ga repository ne tumači; RPC success/error određuje rezultat akcije.

Nakon uspjeha prikazuje se potvrda s mogućnošću pregleda istih odluka. Ne izmišljaju se response ID ili submitted_at. Action revalidira generičku dashboard layout putanju radi DB-side promjena project-level statusa; token se ne koristi u revalidation putanjama. Public response stanje prikazuje client lokalno.

## Rendering i stanja

Ruta koristi postojeći InvitationRenderer u opcionalnom details previewu, odvojeno od RSVP forme. get_public_rsvp ne vraća photos, pa renderer dobiva prazan photos popis i ne dohvaća fotografije preko drugog identifikatora. Dokument i tekst se renderiraju; fotografije nisu dostupne u ovom contractu.

Postoje loading skeleton, zajednička invalid/unavailable poruka, retry za load failure, error boundary, existing-response obavijest, validation poruke, submit failure i success. Supabase/PostgreSQL error poruke ne prikazuju se korisniku. Poznati missing/unavailable SQLSTATE i konzervativni P0001 obrasci daju RSVP_UNAVAILABLE; nepoznate greške daju sigurnu fallback poruku.

## Security pregled

- Samo get_public_rsvp i submit_rsvp; nema table SELECT/INSERT/UPDATE/DELETE.
- Nema token_hash dohvata.
- Raw token iz route contexta jedini je credential; guest_id je samo prikazni podatak.
- Nema token logginga, browser storagea, application analytics/error metadata ili token revalidation putanja.
- Ruta ima no-referrer i noindex/nofollow metadata. Raw token je nužno dio URL-a i server/client route contexta; infrastruktura i browser history nisu application storage niti su njihove politike mijenjane.
- Pregledani proxy dopušta public rutu; auth zaštita vrijedi za dashboard/editor, ne ovaj flow.
- Nije dodan generic submit niti identity matching prema imenima.

## Provjere i Phase 4

TypeScript cijelog projekta i ESLint dodanog/izmijenjenog koda prolaze. Svih 33 relevantna testa prolazi, uključujući 7 novih personalized RSVP testova. Oni provjeravaju runtime contract, strict authority payload, null data, postojeće odluke i odgovore, RPC granicu, failure mapping, mutation lock, HR/EN i odsutnost zabranjenih pristupa/storage/logging poziva.

Stvarni RPC end-to-end i vizualna browser provjera nisu izvršeni. Za Phase 3 nema neriješene contract odluke. Prije Phase 4 treba potvrditi što get_public_invitation vraća od generic RSVP postavki, jer postojeći application parser trenutno izlaže samo rendering context. Ako se kasnije želi prikaz fotografija na personalized ruti, treba definirati izvor već dostupnog, autoriziranog photo contexta; ovaj korak nije mijenjao DB contract.
