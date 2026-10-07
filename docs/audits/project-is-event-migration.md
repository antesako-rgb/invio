# Project = Event — migration audit, 2026-10-02

## Baseline and scope

The existing generated Supabase types already contain all event fields on
`projects`, with required `type` and `start_date`. They expose `create_project`
and `update_project` with event arguments. This migration did not edit generated
types, SQL, RPCs, grants or RLS. Database authorization and automatic Photo Wall
provisioning remain the RPC's responsibility.

This report supersedes the neutral-Project/event-details findings in the earlier
architecture audit. Existing unrelated working-tree changes were retained.

## Removed

- `repositories/getProjectEvent.ts` and `repositories/mapProjectEvent.ts`.
- `repositories/createProjectEvent.ts` and `repositories/updateProjectEvent.ts`.
- `actions/createProjectEventAction.ts` and `actions/updateProjectEventAction.ts`.
- `ProjectWithEventDetails`, `ProjectEventDetails`, `ProjectEvent` row projection,
  and separate event RPC input aliases.
- Neutral Project creation from `createAlbumEntryAction`, the optional Project
  parameter in the album form/dialog, and neutral-Project partial recovery UI.
- Standalone album entry buttons on dashboard/onboarding and associated copy.
- Neutral-versus-event dashboard cards and name-only Project settings form.

Before deletion, imports were redirected to the existing unified Project
repositories/actions. Source and script reference searches found no remaining
consumers of the removed modules. They were neither routes nor dynamic entrypoints.

## Changed files and behavior

All feature-relative paths below are under `src/features/`.

| Area | Changed files | Result |
| --- | --- | --- |
| Project data | `projects/types/project.types.ts`, `projects/types/projectEvent.types.ts`, `projects/repositories/getProject.ts`, `getProjects.ts`, `requireProjectOwner.ts` | `Project = Tables<"projects">`; generated RPC Args narrow only `p_type`; reads use `projects.*`. Owner check unchanged. |
| Project forms | `projects/utils/projectEventForm.utils.ts`, `projects/hooks/useProjectEventForm.ts`, `projects/components/ProjectEventForm/ProjectEventForm.tsx`, `projects/pages/CreateProjectEventPage/CreateProjectEventPage.tsx`, `EditProjectEventPage/EditProjectEventPage.tsx` | Flat Project form data; create/update call the existing `createProjectAction` / `updateProjectAction`, which already use unified repositories. |
| Project context | `projects/components/ProjectHeader/ProjectHeader.tsx`, `ProjectProductContext/ProjectProductContext.tsx`, `ProjectSettings/ProjectSettings.tsx` and its CSS | Direct event metadata and event edit link; products require Project context. Delete workflow unchanged. |
| App routes | `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/event/page.tsx`, `settings/page.tsx` | Existing URLs preserved, using the flat Project record. No route removed by this migration. |
| Album creation | `projects/actions/createAlbumEntryAction.ts`, `projects/components/CreateAlbumForm/CreateAlbumForm.tsx`, `CreateAlbumDialog/CreateAlbumDialog.tsx`, `digital-albums/services/createInitializedDigitalAlbum.ts` | Required existing UUID; `ActionResult` code/data contract; default document uses Project name/date. Owner authorization, initialization rollback, busy guard, retry and editor redirect retained. |
| Discovery | `dashboard/components/DashboardProjects/DashboardProjects.tsx`, `DashboardOnboarding/DashboardOnboarding.tsx` and onboarding CSS | Create event first. Album dialog opens only from the owner CTA in the Project album collection. |
| Invitations | `invitations/components/InvitationManagement/InvitationProjectTemplates.tsx` | Recommendation uses `project.type`; categories still do not restrict creation. |
| Photo Wall material | `photo-walls/repositories/materials/createPhotoWallMaterial.ts`, `photo-walls/content/createInitialPhotoWallMaterialContent.ts` | Material defaults read direct Project date/time/location. Public Photo Wall response contract unchanged. |
| Copy/docs/tests | HR/EN `projects.json`, `dashboard.json`, `src/lib/actions/ERROR_HANDLING.md`, `projects/components/CreateAlbumDialog/CreateAlbumDialog.test.cjs`, `projects/tests/projectModel.test.cjs` | Event-only copy and Project-scoped creation regression coverage. |

The existing `createProjectAction` and `updateProjectAction` are now the only
Project create/update boundary. They still return stable `PROJECT_*` codes;
services/repositories do not return UI results. `ActionFailure`, conflict results,
photo cleanup, collaboration and storage deletion order were not changed.

`ProjectEventType`, the category constants/guard, and event form/schema/component
names remain useful: they describe event categories and form values, not another
DB entity or compatibility layer. The generated `Project.type` remains `string`;
form initialization validates it using the shared category guard.

## Final audit

- No occurrences in `src` of `project_event_details`, `ProjectWithEventDetails`,
  `mapProjectEvent`, `getProjectEvent`, `create_event_project`, `update_event_project`.
- No neutral Project provisioning or standalone Album create entrypoint remains.
- `node scripts/architecture-audit.cjs`: 596 source modules, 38 action files,
  no circular dependencies. Regenerated inventory artifacts.
- `zeroImports` still lists unrelated candidates: the album delete action,
  `DigitalAlbumPhotoPicker`, `ManagementDeleteDangerZone`, preview photo fixture,
  five collaboration actions and collaboration schema. These are candidates,
  not proof of dead code; no unrelated deletion was performed. Test files in this
  list are Node test entrypoints and must remain.
- Existing repository-to-photo-cleanup-service edges remain deliberately unchanged.
- TypeScript: PASS (`tsc --noEmit --incremental false`).
- ESLint: PASS for all Project feature files and other affected TS/TSX files.
- Tests: PASS, 23/23 across all six existing/new CJS suites.
- Changed HR/EN translation namespaces have identical keys.

Validation uses repository/service mocks, not a live DB mutation or browser E2E.
SQL runtime behavior is the separately supplied DB baseline; no migration or
database refresh was executed here.
