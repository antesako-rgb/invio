# Invitation event date and time

`InvitationDocument.eventDate` stores `YYYY-MM-DD`; `eventTime` stores `HH:mm`.
`null` is an explicitly empty value. Optional keys allow older version-1 documents
to be read. The existing version-1 parser supports this additive JSON extension;
no database/RPC or Project Event changes are needed.

The editor commits a single root property. Pages are not rewritten. The renderer
projects these properties into the existing layout props only for page types whose
field registry contains date/time. The projection is never saved. New pages and
duplicates automatically consume the root values. Schedule text is independent.

## Legacy migration

The parser handles each field independently when its root key is absent:

- No nonempty legacy values: canonical value becomes null.
- One distinct valid machine-readable value: promote it and remove redundant
  page values once during normalization.
- Conflicting values or presentation text: canonical value becomes null and
  `legacyDateTime.date/time = true` records that explicit resolution is needed.
  Preserve legacy content and render it until the user chooses a shared value.
  Never infer a winner from page order or guess a localized date format.

The persisted compatibility marker makes normalization idempotent even after
deleting/reordering pages. The editor warns about unresolved legacy fields.
Choosing or clearing a field removes its marker in the same undoable commit.
Original legacy strings remain as inactive compatibility data; they cannot
override an owned root value. They are not synchronized or used by new pages.

## Templates and future initialization

Templates define canonical date/time defaults separately from localized copy.
`createInvitationTemplateDocument` optionally accepts initial root values; these
take precedence over template defaults (including explicit null). Future creation
code can pass Project Event values here once. There is no Project/Event read or
write in this implementation.

Applying a template to an existing invitation preserves its owned root values,
including null. Confirmed replacement discards unresolved legacy page content with
the old pages; undo restores the entire previous document and migration markers.

## Validation

Persistence validates real calendar dates and 24-hour times, but accepts past dates
so previously published invitations remain readable. The DatePicker separately
blocks new past-date selections. Layouts keep locale-aware display formatting.

Run: `node --test src/features/invitations/tests/sharedDateTime.test.cjs`.
