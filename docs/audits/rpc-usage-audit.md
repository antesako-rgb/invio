# RPC usage audit — 2026-10-07

Read-only live PostgreSQL catalog and local repository audit. No mutation RPC, grants,
DROP, Bunny call, credential value or user row was accessed. Local audit files only.

## Scope and method

75 public/private functions: 60 public RPC functions, 15 private helpers/trigger functions.
Scanned repository source, SQL, scripts and documentation excluding dependencies, build output,
.git and .tmp; database.types.ts declarations excluded from application usage evidence.
TypeScript AST found 58 rpc calls, all with literal function names; no dynamic rpc names found.
Supplemental text search covered rpc aliases/bracket access and REST rpc endpoint construction
in local source/scripts. No production dispatcher identified. Test mocks accept dynamic names
but are not production RPC usage. Presence of a call site is evidence of implemented use, not
proof the operation was exercised or is reachable through every current UI state.

Read pg_proc source, pg_depend, all 24 noninternal triggers calling public/private functions,
and all 26 RLS policies. Checked other non-system schemas for candidate-name source references.
Function-source substring references are conservative; pg_depend alone is insufficient for
PL/pgSQL calls/dynamic SQL. External caller checks are static, not runtime telemetry.
Supabase list_migrations returned an empty list; no local historical migration files were
found in the inspected repository. Install/rollback/check/fixture SQL was inspected. This
does not establish what manually executed SQL or migration files exist outside this repository.

## Confirmed candidates within inspected application/database scope

| Schema | Function and exact identity signature | Active dependencies | Reason | Script dependencies |
| --- | --- | --- | --- | --- |
| public | create_invitation_photo(p_invitation_id uuid, p_image_path text, p_file_size bigint, p_description text) | No application calls, SQL function callers, trigger/policy references or pg_depend dependents found | Replaced by storage reservation/finalization; obsolete arbitrary-path registration | install/activation/018_ACTIVATE.sql and definitions/storage_lifecycle/grants.sql REVOKE; rollback/rollback_freeze.sql REVOKE; preflight/verify expect function; synthetic fixture defines test stub |
| public | create_digital_album_photo(p_album_id uuid, p_image_path text, p_file_size bigint, p_description text) | Same absence of active dependencies | Same replacement for Digital Album | Same install, definitions, rollback, check and fixture references |

They are confirmed cleanup candidates, NOT safe to drop without updating operational scripts.
Keep disabled until actual upload smoke tests pass. rollback_freeze currently depends on their
existence: its unconditional REVOKE fails if a function is missing, aborting the transaction.
Update reviewed rollback/check definitions first. Historical install scripts should be retained
as the applied installation record, not replayed after removal. Add a separate manually reviewed
DROP FUNCTION transaction without CASCADE only after this decision; none is prepared/executed here.
Generated types would still declare them until regenerated after removal.

## Uncertain cases and rollback-required functions

No additional unreferenced public/private function identified. No separate rollback-only business
RPC found. The two candidates have rollback script references as explained above. Current storage
RPCs/private helpers must stay: rollback/freezing is not a reason to delete active dependencies.
Private handle_new_user is called by auth.users trigger; update_timestamp by 13 update triggers;
is_project_member/is_project_owner by RLS and many SQL functions. Document photo-ID helpers and
storage helpers are transitively used even when pg_depend reports no dependent objects.

## Complete inventory

Call-site evidence, not runtime usage analytics. Private SQL callers are conservative source matches.

| Schema | Function / exact signature | Application evidence | SQL / trigger / policy dependencies | Assessment |
| --- | --- | --- | --- | --- |
| private | digital_album_document_photo_ids(p_document jsonb) | No direct RPC call | private.storage_document_guard<br>private.storage_has_references<br>private.storage_link_guard<br>public.remove_digital_album_photo<br>public.update_digital_album_document | Retain: DB dependency |
| private | handle_new_user() | No direct RPC call | trigger on_auth_user_created on table auth.users | Retain: DB dependency |
| private | invitation_document_photo_ids(p_document jsonb) | No direct RPC call | private.storage_document_guard<br>private.storage_has_references<br>private.storage_link_guard<br>public.remove_invitation_photo<br>public.update_invitation_document | Retain: DB dependency |
| private | is_project_member(p_project_id uuid, p_user_id uuid) | No direct RPC call | public.add_digital_album_photos<br>public.add_invitation_photos<br>public.create_digital_album_photo<br>public.create_invitation_guest<br>public.create_invitation_guest_group<br>public.create_invitation_photo<br>public.create_invitation_recipient<br>public.delete_invitation_guest<br>public.delete_invitation_guest_group<br>public.delete_invitation_recipient<br>public.get_invitation_recipient_link_token<br>public.get_project_collaborators<br>public.remove_digital_album_photo<br>public.remove_invitation_photo<br>public.remove_photo_wall_photo<br>public.set_photo_wall_photo_favorite<br>public.storage_finalize_upload<br>public.storage_reserve_upload<br>public.update_digital_album<br>public.update_digital_album_document<br>public.update_digital_album_photo<br>public.update_invitation<br>public.update_invitation_document<br>public.update_invitation_guest<br>public.update_invitation_guest_group<br>public.update_invitation_photo<br>public.update_invitation_recipient<br>public.update_invitation_rsvp_settings<br>public.update_photo_wall<br>policy photo_wall_photos_select on table photo_wall_photos<br>policy project_collaborators_select on table project_collaborators<br>policy projects_select on table projects<br>policy photo_walls_select on table photo_walls<br>policy invitation_recipients_select on table invitation_recipients<br>policy photo_wall_materials_select on table photo_wall_materials<br>policy photo_wall_materials_insert on table photo_wall_materials<br>policy photo_wall_materials_update on table photo_wall_materials<br>policy photo_wall_materials_update on table photo_wall_materials<br>policy photo_wall_materials_delete on table photo_wall_materials<br>policy project_photos_select on table project_photos<br>policy invitation_photos_select on table invitation_photos<br>policy invitation_guests_select on table invitation_guests<br>policy rsvp_responses_select on table rsvp_responses<br>policy digital_albums_select on table digital_albums<br>policy digital_album_photos_select on table digital_album_photos<br>policy invitations_select on table invitations<br>policy rsvp_response_guests_select on table rsvp_response_guests<br>policy invitation_guest_groups_select on table invitation_guest_groups | Retain: DB dependency |
| private | is_project_owner(p_project_id uuid, p_user_id uuid) | No direct RPC call | private.is_project_member<br>public.cancel_project_collaboration_invite<br>public.create_digital_album<br>public.create_invitation<br>public.delete_digital_album<br>public.delete_invitation<br>public.delete_project<br>public.invite_project_collaborator<br>public.publish_digital_album<br>public.publish_invitation<br>public.publish_photo_wall<br>public.remove_project_collaborator<br>public.renew_project_collaboration_invite<br>public.unpublish_digital_album<br>public.unpublish_invitation<br>public.unpublish_photo_wall<br>public.update_project<br>policy project_collaboration_invites_select on table project_collaboration_invites | Retain: DB dependency |
| private | storage_document_guard() | No direct RPC call | trigger storage_document_guard on table invitations<br>trigger storage_document_guard on table digital_albums | Retain: DB dependency |
| private | storage_has_references(p_key text) | No direct RPC call | private.storage_queue<br>public.storage_claim_cleanup<br>public.storage_finish_cleanup | Retain: DB dependency |
| private | storage_key_alias(p_path text) | No direct RPC call | private.storage_document_guard<br>private.storage_has_references<br>private.storage_link_guard<br>private.storage_queue<br>public.storage_claim_cleanup<br>public.storage_reserve_upload | Retain: DB dependency |
| private | storage_link_guard() | No direct RPC call | trigger storage_link_guard on table invitation_photos<br>trigger storage_link_guard on table digital_album_photos<br>trigger storage_link_guard on table photo_wall_photos | Retain: DB dependency |
| private | storage_lock() | No direct RPC call | private.storage_document_guard<br>private.storage_link_guard<br>private.storage_photo_guard<br>private.storage_project_deleted<br>private.storage_queue<br>public.storage_claim_cleanup<br>public.storage_finalize_upload<br>public.storage_finish_cleanup<br>public.storage_reserve_upload | Retain: DB dependency |
| private | storage_photo_guard() | No direct RPC call | trigger storage_photo_guard on table project_photos | Retain: DB dependency |
| private | storage_project_deleted() | No direct RPC call | trigger storage_project_deleted on table projects | Retain: DB dependency |
| private | storage_queue(p_id uuid) | No direct RPC call | private.storage_project_deleted<br>private.storage_unlinked<br>public.storage_claim_cleanup<br>public.storage_request_cleanup | Retain: DB dependency |
| private | storage_unlinked() | No direct RPC call | trigger storage_unlinked on table invitation_photos<br>trigger storage_unlinked on table digital_album_photos<br>trigger storage_unlinked on table photo_wall_photos | Retain: DB dependency |
| private | update_timestamp() | No direct RPC call | trigger trg_rsvp_responses_update_timestamp on table rsvp_responses<br>trigger trg_rsvp_response_guests_update_timestamp on table rsvp_response_guests<br>trigger set_profiles_updated_at on table profiles<br>trigger set_projects_updated_at on table projects<br>trigger trg_photo_walls_update_timestamp on table photo_walls<br>trigger set_project_collaboration_invites_updated_at on table project_collaboration_invites<br>trigger trg_invitation_recipients_update_timestamp on table invitation_recipients<br>trigger trg_digital_albums_update_timestamp on table digital_albums<br>trigger trg_invitation_templates_update_timestamp on table invitation_templates<br>trigger trg_invitations_update_timestamp on table invitations<br>trigger set_photo_wall_materials_updated_at on table photo_wall_materials<br>trigger set_invitation_guest_groups_updated_at on table invitation_guest_groups<br>trigger set_invitation_guests_updated_at on table invitation_guests | Retain: DB dependency |
| public | accept_project_collaboration_invite(p_token text) | src/features/project-collaboration/repositories/acceptProjectCollaborationInvite.ts:24 | None found | Retain: implemented RPC call |
| public | add_digital_album_photos(p_album_id uuid, p_photo_ids uuid[]) | src/features/digital-albums/repositories/photos/addDigitalAlbumPhotos.ts:26 | None found | Retain: implemented RPC call |
| public | add_invitation_photos(p_invitation_id uuid, p_photo_ids uuid[]) | src/features/invitations/repositories/photos/addInvitationPhotos.ts:37 | None found | Retain: implemented RPC call |
| public | cancel_project_collaboration_invite(p_invite_id uuid) | src/features/project-collaboration/repositories/cancelProjectCollaborationInvite.ts:24 | public.renew_project_collaboration_invite | Retain: implemented RPC call |
| public | create_digital_album(p_project_id uuid, p_name text) | src/features/digital-albums/repositories/album/createDigitalAlbum.ts:6 | None found | Retain: implemented RPC call |
| public | create_digital_album_photo(p_album_id uuid, p_image_path text, p_file_size bigint, p_description text) | No direct RPC call | None found | Candidate; rollback/check references require update |
| public | create_invitation(p_project_id uuid, p_template_id uuid) | src/features/invitations/repositories/invitation/createInvitation.ts:24 | None found | Retain: implemented RPC call |
| public | create_invitation_guest(p_invitation_id uuid, p_group_id uuid, p_first_name text, p_last_name text, p_notes text) | src/features/invitation-guests/repositories/guests/mutateInvitationGuests.ts:8 | None found | Retain: implemented RPC call |
| public | create_invitation_guest_group(p_invitation_id uuid, p_name text) | src/features/invitation-guests/repositories/guests/mutateInvitationGuests.ts:29 | None found | Retain: implemented RPC call |
| public | create_invitation_photo(p_invitation_id uuid, p_image_path text, p_file_size bigint, p_description text) | No direct RPC call | None found | Candidate; rollback/check references require update |
| public | create_invitation_recipient(p_invitation_id uuid, p_email text, p_phone text, p_guest_ids uuid[], p_primary_guest_id uuid) | src/features/invitation-guests/repositories/recipients/mutateInvitationRecipients.ts:9 | None found | Retain: implemented RPC call |
| public | create_project(p_name text, p_type text, p_start_date date, p_custom_type text, p_start_time time without time zone, p_location_name text, p_location_address text) | src/features/projects/repositories/createProject.ts:25 | None found | Retain: implemented RPC call |
| public | decline_project_collaboration_invite(p_token text) | src/features/project-collaboration/repositories/declineProjectCollaborationInvite.ts:24 | None found | Retain: implemented RPC call |
| public | delete_digital_album(p_album_id uuid) | src/features/digital-albums/repositories/album/deleteDigitalAlbum.ts:5 | None found | Retain: implemented RPC call |
| public | delete_invitation(p_invitation_id uuid) | src/features/invitations/repositories/invitation/manageInvitation.ts:5 | None found | Retain: implemented RPC call |
| public | delete_invitation_guest(p_guest_id uuid) | src/features/invitation-guests/repositories/guests/mutateInvitationGuests.ts:22 | None found | Retain: implemented RPC call |
| public | delete_invitation_guest_group(p_group_id uuid) | src/features/invitation-guests/repositories/guests/mutateInvitationGuests.ts:43 | None found | Retain: implemented RPC call |
| public | delete_invitation_recipient(p_recipient_id uuid) | src/features/invitation-guests/repositories/recipients/mutateInvitationRecipients.ts:23 | None found | Retain: implemented RPC call |
| public | delete_project(p_project_id uuid) | src/features/projects/repositories/deleteProject.ts:23 | None found | Retain: implemented RPC call |
| public | get_invitation_recipient_link_token(p_recipient_id uuid) | src/features/invitation-guests/repositories/recipients/getInvitationRecipientLinkToken.ts:6 | None found | Retain: implemented RPC call |
| public | get_project_collaborators(p_project_id uuid) | src/features/project-collaboration/repositories/getProjectCollaborators.ts:24 | None found | Retain: implemented RPC call |
| public | get_public_digital_album(p_public_id text) | src/features/digital-albums/repositories/album/getPublicDigitalAlbum.ts:47 | None found | Retain: implemented RPC call |
| public | get_public_invitation(p_public_id text) | src/features/invitations/repositories/invitation/getPublicInvitation.ts:89 | None found | Retain: implemented RPC call |
| public | get_public_photo_wall(p_public_id text) | src/features/photo-walls/repositories/photo-wall/getPublicPhotoWall.ts:25 | None found | Retain: implemented RPC call |
| public | get_public_photo_wall_photos(p_public_id text, p_limit integer, p_cursor_created_at timestamp with time zone, p_cursor_id uuid) | src/features/photo-walls/repositories/photos/getPublicPhotoWallPhotos.ts:53 | None found | Retain: implemented RPC call |
| public | get_public_rsvp(p_token text) | src/features/invitations/repositories/rsvp/personalizedRsvp.ts:8 | None found | Retain: implemented RPC call |
| public | get_received_collaboration_invites() | src/features/project-collaboration/repositories/getReceivedCollaborationInvites.ts:16 | None found | Retain: implemented RPC call |
| public | invite_project_collaborator(p_project_id uuid, p_email text) | src/features/project-collaboration/repositories/inviteProjectCollaborator.ts:25 | public.renew_project_collaboration_invite | Retain: implemented RPC call |
| public | publish_digital_album(p_album_id uuid) | src/features/digital-albums/repositories/album/publishDigitalAlbum.ts:26 | None found | Retain: implemented RPC call |
| public | publish_invitation(p_invitation_id uuid) | src/features/invitations/repositories/invitation/publishInvitation.ts:20 | None found | Retain: implemented RPC call |
| public | publish_photo_wall(p_photo_wall_id uuid) | src/features/photo-walls/repositories/photo-wall/publishPhotoWall.ts:26 | None found | Retain: implemented RPC call |
| public | remove_digital_album_photo(p_album_id uuid, p_photo_id uuid) | src/features/digital-albums/repositories/photos/removeDigitalAlbumPhoto.ts:10 | None found | Retain: implemented RPC call |
| public | remove_invitation_photo(p_invitation_id uuid, p_photo_id uuid) | src/features/invitations/repositories/photos/removeInvitationPhoto.ts:9 | None found | Retain: implemented RPC call |
| public | remove_photo_wall_photo(p_photo_wall_id uuid, p_photo_id uuid) | src/features/photo-walls/repositories/photos/deletePhotoWallPhoto.ts:10 | None found | Retain: implemented RPC call |
| public | remove_project_collaborator(p_project_id uuid, p_profile_id uuid) | src/features/project-collaboration/repositories/removeProjectCollaborator.ts:23 | None found | Retain: implemented RPC call |
| public | renew_project_collaboration_invite(p_invite_id uuid) | src/features/project-collaboration/repositories/renewProjectCollaborationInvite.ts:5 | None found | Retain: implemented RPC call |
| public | respond_project_collaboration_invite_by_id(p_invite_id uuid, p_response text) | src/features/project-collaboration/repositories/respondToReceivedCollaborationInvite.ts:5 | None found | Retain: implemented RPC call |
| public | set_photo_wall_photo_favorite(p_photo_wall_id uuid, p_photo_id uuid, p_is_favorite boolean) | src/features/photo-walls/repositories/photos/setPhotoWallPhotoFavorite.ts:25 | None found | Retain: implemented RPC call |
| public | storage_claim_cleanup(p_limit integer) | src/features/project-photos/storage/storageLifecycleRepository.ts:49 | None found | Retain: implemented RPC call |
| public | storage_finalize_upload(p_id uuid, p_file_size bigint, p_description text) | src/features/project-photos/storage/storageLifecycleRepository.ts:32 | None found | Retain: implemented RPC call |
| public | storage_finish_cleanup(p_id uuid, p_lease_token uuid, p_success boolean) | src/features/project-photos/storage/storageLifecycleRepository.ts:55 | None found | Retain: implemented RPC call |
| public | storage_request_cleanup(p_photo_id uuid) | src/features/project-photos/storage/storageLifecycleRepository.ts:44 | None found | Retain: implemented RPC call |
| public | storage_reserve_upload(p_id uuid, p_kind text, p_product_id uuid, p_public_id text, p_actor_id uuid) | src/features/project-photos/storage/storageLifecycleRepository.ts:19 | None found | Retain: implemented RPC call |
| public | submit_generic_rsvp(p_public_id text, p_guests jsonb) | src/features/invitations/repositories/rsvp/genericRsvp.ts:7 | None found | Retain: implemented RPC call |
| public | submit_rsvp(p_token text, p_guests jsonb) | src/features/invitations/repositories/rsvp/personalizedRsvp.ts:14 | None found | Retain: implemented RPC call |
| public | unpublish_digital_album(p_album_id uuid) | src/features/digital-albums/repositories/album/unpublishDigitalAlbum.ts:26 | None found | Retain: implemented RPC call |
| public | unpublish_invitation(p_invitation_id uuid) | src/features/invitations/repositories/invitation/unpublishInvitation.ts:20 | None found | Retain: implemented RPC call |
| public | unpublish_photo_wall(p_photo_wall_id uuid) | src/features/photo-walls/repositories/photo-wall/unpublishPhotoWall.ts:26 | None found | Retain: implemented RPC call |
| public | update_digital_album(p_album_id uuid, p_name text) | src/features/digital-albums/repositories/album/updateDigitalAlbum.ts:26 | None found | Retain: implemented RPC call |
| public | update_digital_album_document(p_album_id uuid, p_document jsonb, p_document_version integer, p_expected_revision bigint) | src/features/digital-albums/repositories/album/updateDigitalAlbumDocument.ts:53 | None found | Retain: implemented RPC call |
| public | update_digital_album_photo(p_album_id uuid, p_photo_id uuid, p_description text) | src/features/digital-albums/actions/photos/updateDigitalAlbumPhotoDescriptionAction.ts:49 | None found | Retain: implemented RPC call |
| public | update_invitation(p_invitation_id uuid, p_name text) | src/features/invitations/repositories/invitation/updateInvitation.ts:24 | None found | Retain: implemented RPC call |
| public | update_invitation_document(p_invitation_id uuid, p_document jsonb, p_document_version integer, p_expected_revision bigint) | src/features/invitations/repositories/invitation/updateInvitationDocument.ts:51 | None found | Retain: implemented RPC call |
| public | update_invitation_guest(p_guest_id uuid, p_group_id uuid, p_first_name text, p_last_name text, p_notes text) | src/features/invitation-guests/repositories/guests/mutateInvitationGuests.ts:15 | None found | Retain: implemented RPC call |
| public | update_invitation_guest_group(p_group_id uuid, p_name text) | src/features/invitation-guests/repositories/guests/mutateInvitationGuests.ts:36 | None found | Retain: implemented RPC call |
| public | update_invitation_photo(p_invitation_id uuid, p_photo_id uuid, p_description text) | src/features/invitations/actions/photos/updateInvitationPhotoDescriptionAction.ts:49 | None found | Retain: implemented RPC call |
| public | update_invitation_recipient(p_recipient_id uuid, p_email text, p_phone text, p_guest_ids uuid[], p_primary_guest_id uuid) | src/features/invitation-guests/repositories/recipients/mutateInvitationRecipients.ts:16 | None found | Retain: implemented RPC call |
| public | update_invitation_rsvp_settings(p_invitation_id uuid, p_generic_rsvp_enabled boolean, p_generic_rsvp_max_guests integer, p_generic_rsvp_capacity integer) | src/features/invitations/repositories/invitation/updateInvitationRsvpSettings.ts:9 | None found | Retain: implemented RPC call |
| public | update_photo_wall(p_photo_wall_id uuid, p_name text, p_appearance jsonb) | src/features/photo-walls/repositories/photo-wall/updatePhotoWall.ts:26 | None found | Retain: implemented RPC call |
| public | update_project(p_project_id uuid, p_name text, p_type text, p_start_date date, p_custom_type text, p_start_time time without time zone, p_location_name text, p_location_address text) | src/features/projects/repositories/updateProject.ts:25 | None found | Retain: implemented RPC call |

## Limits and next step

Cannot inspect saved SQL Editor queries, external scripts/clients, other deployments or arbitrary
runtime-generated function names. Catalog absence does not prove absence of such callers. No
functions in auth/extensions/internal schemas are classified as cleanup candidates; these were
only inspected for references to the two candidates. No claim that all database objects are unused.

First perform normal upload smoke tests across three products with cleanup disabled. Then review
operational rollback/check updates and separate DROP without CASCADE for only the two candidates.
No grants or database objects were changed during this audit.
