# Invitation guest domain migration

## Contract and architecture

The generated Database already contains invitation_guests and invitation_guest_groups, the six guest/group write RPCs and the migrated recipient RPCs. The generated file was not manually patched. No SQL definitions are present locally, so group signatures were verified against generated types: create(p_invitation_id,p_name), update(p_group_id,p_name), delete(p_group_id). Deployment SQL/grants and validation constraints still require separate verification; no database changes or migrations were made.

The former project-guests feature was moved to invitation-guests. Types derive from generated rows/RPC arguments, with the existing narrow nullable scalar-argument refinement. Reads use invitation_id-scoped explicit SELECT projections under RLS; writes use only existing RPCs. No global status/source remains in the guest model. Error codes and HR/EN localization remain within the existing ActionResult infrastructure.

The existing Invitation guests route hosts Popis gostiju and Poveznice i odgovori views. Guest CRUD, groups, notes, avatar fallback, search, read-only response-derived status, responsive table/cards and Sheet/Drawer reuse the previous UI. Missing response is presentation-only. Group deletion uses the existing RPC and does not issue guest deletes. Guest deletion confirmation explains response deletion and last-recipient-guest cascade. Personalized recipient create/update selects existing invitation guest IDs, not copies. Contact can be absent. Responded recipients cannot change their selected guest composition in the form; primary guest/contact remain editable. Database authorization and cascade/integrity behavior remain authoritative.

Recipient reads attach invitation guest identities directly via recipient_id. Personalized statuses and answers come from invitation-scoped response rows. Generic submissions remain separate and never create/merge invitation guests. Public personalized context no longer expects guest_id. Submit validates exact recipient guest membership once each and validates the new success/submitted_at result. Token authority, credential RPC, public renderer, generic limits/capacity and builder question IDs are unchanged.

Removed primary-RSVP repository/action/UI/query fields and project guest navigation. The old project Guests URL redirects to that project's invitation list rather than querying a removed table. Mobile project navigation now has Event/Invitations/More, with three equal columns. No changes to Photo Wall or Digital Album business logic were required.

## Verification and remaining work

TypeScript and targeted ESLint/test results are reported in the final task response. Tests cover six CRUD RPCs, invitation-scoped reads, validation, group confirmation, read-only status, optional contacts, recipient identity/link flow, composition lock, personalized membership/success contract, generic RSVP, builder and navigation.

Real DB guest/recipient cascade behavior, authenticated RLS and browser/mobile visual behavior are not established by mocked tests. Live end-to-end verification remains required, especially deleting the primary or final guest, removing a recipient while preserving guests, and group deletion setting group_id null.

Known DB security/business gap from the final contract: submit_rsvp and submit_generic_rsvp do not enforce RSVP deadline; submit_rsvp does not enforce allow_response_changes. No structured deadline/allow_response_changes fields were found in current generated types or application code. Adding a frontend-only gate would not secure the RPC. The DB owner must define/expose those settings and enforce them atomically in the submit RPCs. This migration does not claim that lifecycle protection is complete.

No local active SQL files existed to clean up. Historical migration files were not rewritten. Existing historical audit documents may describe the previous domain; this document supersedes them for the current guest model.
