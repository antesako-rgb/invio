# RSVP Form Builder — document/editor + personalized integration

## Audit i model

Stari RSVP je `InvitationDocumentPage` s `type: "rsvp"`, layoutom timeline, UUID-om, `content.title/text/contact` i photos arrayem. Config `invitationPageTypes`, Timeline → InvitationPageContent renderer, InvitationContentPanel i inline editor, parseInvitationDocument, InvitationSession i updateInvitationDocumentAction čine postojeću arhitekturu. InvitationThumbnail ponovno koristi isti renderer. Postojeći lokalizirani template sadržaj ima RSVP title/text/contact; contact je stvarni legacy sadržaj i nije uklonjen.

Novi shape zadržava sva ta polja i dodaje opcionalno:

```ts
page.rsvp = {
  attendance: {
    label: string,
    attendingLabel: string,
    notAttendingLabel: string
  },
  questions: [{
    id: string, // UUID
    type: "short_text" | "long_text",
    label: string,
    required: boolean
  }]
}
```

Attendance je presentation konfiguracija za status; nije custom answers pitanje. Naslov, opis i contact ostaju u postojećem contentu jer editor i renderer već koriste taj record. Nema paralelnog Invitation modela, novog document versiona ili DB migracije.

## Backward compatibility i jedna sekcija

Dokument bez page.rsvp ostaje validan. getInvitationRsvp daje lokalizirane attendance defaultove i prazna pitanja; parser ne upisuje default konfiguraciju i ne generira pitanje/ID pri čitanju. Stari title/text/contact ostaju nepromijenjeni. Blank attendance label koristi lokalizirani fallback. Novi config se sprema tek kroz postojeće editor izmjene/save flow.

Document parser odbija više od jedne RSVP sekcije, config na ne-RSVP pageu i duplicirane IDs. Editor izostavlja RSVP iz add/type ponude kada već postoji, ima dodatne guards u commit/add putanji i ne dopušta duplicate RSVP page. Ne spajaju se pitanja iz više sekcija. Ako se u bazi nađe legacy dokument s više RSVP sekcija, sada je invalidan i zahtijeva zaseban pregled; implementacija ga ne prepisuje, ne spaja i ne briše automatski. Auditirani lokalni template oblici imaju uobičajenu pojedinačnu RSVP sekciju; stvarni DB dokumenti nisu batch pregledani.

## Editor i renderer

Builder je u postojećem InvitationContentPanelu za aktivnu RSVP sekciju. Podržava title/text/contact, attendance label i dva option labela, dodavanje short/long text pitanja, label edit, type, required, delete i move up/down. Nema novog DnD sustava. Izmjene prolaze onChange → session.commit → postojeći undo/autosave. Prazan question label ne commitira se; validan label sprema se na blur. IDs nastaju točno jednom pri Add preko crypto.randomUUID(), ne koriste label ili index i ne mijenjaju se na update/reorder.

InvitationPageContent koristi novi InvitationRsvpPreview kroz postojeći Timeline/renderer put. Preview je disabled fieldset s postojećim Select/Input/Textarea primitiveima, bez form submit handlera. Isti renderer koristi editor, public preview i thumbnail, s postojećim responsive površinama; builder koristi CSS Modules i postojeće UI primitive.

## Personalized integration i validacija

Jedina RSVP sekcija određuje naslov/opis/contact, attendance presentation i pitanja public personalized forme. Status ide isključivo u status, a string custom vrijednosti u answers[questionId]. Form state za podržana pitanja koristi RsvpAnswers = Record<string, string>.

- Attending: custom pitanja su vidljiva; required string mora sadržavati tekst nakon trim provjere.
- Not attending: pitanja su skrivena; local answers se resetiraju, submit šalje {}, a server također forsira {}.
- Promjena attending → not attending → attending ne vraća prethodno unesene custom vrijednosti.

Server action prije submit_rsvp ponovno dohvaća token-based context kroz get_public_rsvp i provjerava aktualna pitanja iz dokumenta. DB/RPC ostaje authority za povezanost Invitation Guests i recipienta te za prihvaćanje submita. Nema client-provided project/invitation/recipient authority ID-eva. Nema novih public/generic flowova ni token logginga/storagea. Novi kod greške je RSVP_ANSWERS_INVALID, lokaliziran na HR/EN.

Runtime config schema provjerava UUID, supported type, nonempty string label, boolean required, questions array i attendance strings. Koristi postojeći Zod i postojeći content limit od 10000 znakova. Globalna ID provjera uključuje pitanja. Current question answers smiju biti samo string; missing required attending answer odbija se i prije RPC-a.

## Lifecycle

Brisanje pitanja iz dokumenta ne radi write nad postojećim responseovima. Kod attending resubmita postojeći keys izvan aktualnih pitanja čuvaju se kao historical answers; ne renderiraju se kao nova pitanja. Eksplicitni not_attending odgovor prazni answers prema zaključanoj product odluci. Promjena required može tražiti novi odgovor pri sljedećem submitu; promjena labela/typea ne mijenja ID. Dokument može biti promijenjen između get/validation i submit RPC poziva; stroga atomic question-schema zaštita nije dio postojećeg DB contracta.

## Datoteke

Dodano u src/features/invitations:

- utils/invitationRsvp.ts
- editor/components/InvitationContentPanel/InvitationRsvpBuilder.tsx
- editor/components/InvitationContentPanel/InvitationRsvpBuilder.module.css
- components/invitation-renderer/InvitationRsvpPreview.tsx
- components/invitation-renderer/InvitationRsvpPreview.module.css
- tests/rsvpBuilder.test.cjs

Izmijenjeno u istom featureu:

- types/invitationDocument.types.ts
- utils/parseInvitationDocument.ts
- utils/invitationDocumentOperations.ts
- editor/components/InvitationContentPanel/InvitationContentPanel.tsx
- editor/components/InvitationPagePicker/InvitationPagePicker.tsx
- editor/components/InvitationPagesPanel/InvitationPagesPanel.tsx
- editor/components/InvitationEditorView/InvitationEditorView.tsx
- components/invitation-renderer/InvitationPageContent.tsx
- components/PublicPersonalizedRsvp/PublicPersonalizedRsvp.tsx
- components/PublicPersonalizedRsvp/PublicPersonalizedRsvp.module.css
- actions/rsvp/submitPersonalizedRsvpAction.ts
- tests/personalizedRsvp.test.cjs

Dodatno izmijenjeno:

- src/lib/actions/actionErrorCodes.ts
- src/messages/hr/common.json i src/messages/en/common.json
- src/messages/hr/invitations.json i src/messages/en/invitations.json
- Ovaj audit je dodan.

## Provjera

TypeScript cijelog projekta prolazi. ESLint dodanog/izmijenjenog TS/TSX/CJS koda prolazi. Svih 42 relevantna testa prolazi. Testovi provjeravaju realni document parser, legacy round-trip, stabilne IDs, builder promjene i reorder, disabled preview, server required provjeru, attending-only visibility, clearing, historical keys i HR/EN.

Browser vizualna provjera i stvarni RPC/save end-to-end nisu izvršeni. Nema preostale product odluke za implementirani scope. Generic Public RSVP nije započet.
