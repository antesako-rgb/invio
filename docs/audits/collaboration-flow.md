# Collaboration flow

## Existing model and fixes

`projects.owner_id` owns an event. `project_collaborators` gives accepted users
access. `project_collaboration_invites` stores the recipient email, expiry,
status and a token hash. The original token is returned only when creating an
invitation; it cannot be recovered from the hash.

The overview previously mounted `DashboardInvites` only when the recipient
already had a project. The dashboard card also opened a generic link-input form,
and the owner lists did not use cancellation or removal actions. The received
invitation query joined `projects`, whose RLS may hide the event name until
membership exists. The frontend now follows the final, locked RPC contract
provided by the user. Database authorization stays in the RPCs.

## Resulting flow

1. The owner enters an email in Suradnici. The existing invitation RPC creates
   a pending invitation and returns the shareable link. No email is sent.
2. A user whose `public.profiles.email` matches sees an active pending invitation on the overview,
   including when they have no events yet. The card opens that invitation.
3. They accept or decline directly. Acceptance inserts membership; decline
   changes only invitation status. Both navigate back to a relevant page.
4. The owner can cancel pending invitations and remove accepted collaborators,
   with confirmation. Expired pending invitations stay visible with an expiry
   label. A new link cancels and replaces the previous invitation atomically.
5. Shared token links still use the existing accept/decline actions. The original
   token is never persisted in browser storage, queried from the database, or
   placed in dashboard query parameters.

## Final database contract

The collaboration database is finalized. No new migration is required by this
frontend alignment and no database model changes are made.

- `get_received_collaboration_invites()`: resolves `auth.uid()` through
  `public.profiles.email` and returns `id`, `project_id`, `project_name`, and
  `expires_at` for matching pending invitations with `expires_at > now()`.
  The frontend does not require `auth.user.email` or a token to fetch this list.
- `respond_project_collaboration_invite_by_id`: locks the invitation and checks
  recipient identity, pending status and expiry before changing membership/status.
- `renew_project_collaboration_invite`: owner-only atomic cancellation and
  replacement using existing cancellation and invitation RPCs.

`invite_project_collaborator(p_project_id, p_email)` refuses a second pending
invitation for the same project/email. Both it and `renew` return `invite_id`,
`token`, and `expires_at`; server actions preserve those fields. If renewal fails,
the DB transaction preserves the old invitation. The frontend must not implement
renewal as separate cancellation and creation calls.

Two recipient flows remain supported:

- Shared link: token -> `accept_project_collaboration_invite(p_token)` or
  `decline_project_collaboration_invite(p_token)`.
- Dashboard: invitation ID ->
  `respond_project_collaboration_invite_by_id(p_invite_id, p_response)` with
  `accept` or `decline`; returns `project_id` and requires no token.

The DB checks authentication, recipient identity, pending status and expiry.
The frontend validates input format, displays account context from `profiles.email`,
and refreshes dashboard data after successful mutations.

## Verification

TypeScript, targeted ESLint and contract checks verify RPC arguments, return
shapes, profile-based recipient lookup and the two separate recipient flows.

Database integration verification requires two accounts (owner and recipient):
create an invitation, inspect the recipient's empty dashboard, accept, verify
event access, remove membership, invite again, decline, then verify cancellation,
expiry and regeneration. A third account must not see or respond to another
person's invitation. Reusing a consumed/cancelled/expired invitation must fail.
Confirm that a failed replacement leaves the old invitation unchanged.
