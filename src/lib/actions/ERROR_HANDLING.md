# Server Action error boundary

`ActionResult<T, Code extends ActionErrorCode = ActionErrorCode>` is a success
(`success: true`, plus `data` when applicable) or `ActionError<Code>`
(`success: false`, `code`). Public codes are grouped into Common, Project,
Product and Photo types in actionErrorCodes.ts. Backend text is not a public code.

UI uses useActionError() / Common.errors, with identical HR and EN keys.
ActionFailure carries a code through existing client callback APIs; it is not a
repository/service result. Unknown transport exceptions use local translated
fallbacks. Existing editor save/conflict state messages remain localized in their
domain namespaces; session/conflict behavior is unchanged.

Preserved special cases:
- createAlbumEntryAction requires an existing projectId. Album initialization
  rollback remains in the service; retry uses the same Project. Success uses data.albumId.
- Invitation/Album document saves retain CONFLICT and SAVE_FAILED codes.
- Material editing retains VALIDATION, CONFLICT and SAVE_FAILED.
- Photo uploads and cleanup retain their existing partial-failure semantics.
  This migration does not claim an upload/delete was rolled back after failure.

Previously unwrapped public photo pagination now returns ActionResult. Collaboration
link/response and material create/update successes now put their payload under data;
all corresponding consumers were migrated.

No DB, RPC, routing, repository/service result contracts or storage ordering changed.
Pre-existing direct repository-style queries inside some actions were retained;
this task does not relocate persistence code. No Server Actions were found in
Seating or profile/account/auth (their existing client forms are not server actions).
Local form-validation issue messages are separate from backend ActionResult errors.
The material action's internal error.message === CONFLICT check is deliberately
preserved; its returned result contains only the code.

## Audited Server Action files

- `src/features/digital-albums/actions/album/deleteDigitalAlbumAction.ts`
- `src/features/digital-albums/actions/album/publishDigitalAlbumAction.ts`
- `src/features/digital-albums/actions/album/unpublishDigitalAlbumAction.ts`
- `src/features/digital-albums/actions/album/updateDigitalAlbumAction.ts`
- `src/features/digital-albums/actions/album/updateDigitalAlbumDocumentAction.ts`
- `src/features/digital-albums/actions/photos/addDigitalAlbumPhotosAction.ts`
- `src/features/digital-albums/actions/photos/getDigitalAlbumProjectPhotosAction.ts`
- `src/features/digital-albums/actions/photos/removeDigitalAlbumPhotoAction.ts`
- `src/features/digital-albums/actions/photos/updateDigitalAlbumPhotoDescriptionAction.ts`
- `src/features/digital-albums/actions/photos/uploadDigitalAlbumPhotoAction.ts`
- `src/features/invitations/actions/invitation/createInvitationAction.ts`
- `src/features/invitations/actions/invitation/manageInvitationAction.ts`
- `src/features/invitations/actions/invitation/setInvitationPublishedAction.ts`
- `src/features/invitations/actions/invitation/updateInvitationAction.ts`
- `src/features/invitations/actions/invitation/updateInvitationDocumentAction.ts`
- `src/features/invitations/actions/photos/invitationPhotoActions.ts`
- `src/features/invitations/actions/photos/updateInvitationPhotoDescriptionAction.ts`
- `src/features/photo-walls/actions/materials/createPhotoWallMaterialAction.ts`
- `src/features/photo-walls/actions/materials/updatePhotoWallMaterialAction.ts`
- `src/features/photo-walls/actions/photos/deletePhotoWallPhotoAction.ts`
- `src/features/photo-walls/actions/photos/getPhotoWallPhotosPageAction.ts`
- `src/features/photo-walls/actions/photos/loadPublicPhotoWallPhotosAction.ts`
- `src/features/photo-walls/actions/photos/setPhotoWallPhotoFavoriteAction.ts`
- `src/features/photo-walls/actions/photos/updatePhotoWallPhotoDescriptionAction.ts`
- `src/features/photo-walls/actions/photos/uploadPhotoWallPhotoAction.ts`
- `src/features/photo-walls/actions/photos-wall/publishPhotoWallAction.ts`
- `src/features/photo-walls/actions/photos-wall/unpublishPhotoWallAction.ts`
- `src/features/photo-walls/actions/photos-wall/updatePhotoWallAction.ts`
- `src/features/project-collaboration/actions/acceptProjectCollaborationAction.ts`
- `src/features/project-collaboration/actions/cancelProjectCollaborationAction.ts`
- `src/features/project-collaboration/actions/collaborationUiActions.ts`
- `src/features/project-collaboration/actions/declineProjectCollaborationAction.ts`
- `src/features/project-collaboration/actions/inviteProjectCollaboratorAction.ts`
- `src/features/project-collaboration/actions/removeProjectCollaboratorAction.ts`
- `src/features/projects/actions/createAlbumEntryAction.ts`
- `src/features/projects/actions/createProjectAction.ts`
- `src/features/projects/actions/deleteProjectAction.ts`
- `src/features/projects/actions/updateProjectAction.ts`

## Migrated UI/helpers

- `src/features/photo-walls/editor/hooks/usePhotoWallMaterialEditor.ts`
- `src/features/project-collaboration/components/CollaborationInviteResponse.tsx`
- `src/features/project-collaboration/components/CollaborationLinkForm.tsx`
- `src/features/digital-albums/components/album-management/DigitalAlbumManagementHeader/DigitalAlbumNameEdit/DigitalAlbumNameEdit.tsx`
- `src/features/digital-albums/components/album-management/DigitalAlbumStatusCard/DigitalAlbumStatusAction.tsx`
- `src/features/digital-albums/editor/components/DigitalAlbumAddPhotosDialog/DigitalAlbumAddPhotosDialog.tsx`
- `src/features/digital-albums/editor/hooks/useDigitalAlbumPhotoLibrary.ts`
- `src/features/invitations/components/InvitationManagement/InvitationManagementActions.tsx`
- `src/features/invitations/components/InvitationManagement/InvitationManagementNavigation.tsx`
- `src/features/invitations/components/InvitationManagement/InvitationPublishAction.tsx`
- `src/features/invitations/components/InvitationProjectCard/CreateInvitationButton.tsx`
- `src/features/invitations/editor/components/InvitationEditorView/InvitationEditorView.tsx`
- `src/features/invitations/editor/components/InvitationPhotosPanel/InvitationPhotosPanel.tsx`
- `src/features/photo-walls/components/photo-wall-experience/PhotoWallUpload/hooks/usePhotoWallUpload.ts`
- `src/features/photo-walls/components/photo-wall-experience/hooks/usePublicPhotoWallPhotos.ts`
- `src/features/photo-walls/components/photo-wall-management/hooks/usePhotoWallPhotosManagement.ts`
- `src/features/photo-walls/components/settings/PhotoWallSettingsAppearance/PhotoWallSettingsAppearance.tsx`
- `src/features/photo-walls/components/template-picker/PhotoWallMaterialTemplatePicker/PhotoWallMaterialTemplatePicker.tsx`
- `src/features/photo-walls/components/wall-management/PhotoWallManagementHeader/PhotoWallNameEdit/PhotoWallNameEdit.tsx`
- `src/features/photo-walls/components/wall-management/PhotoWallStatusCard/PhotoWallStatusAction.tsx`
- `src/features/project-collaboration/components/CollaborationInviteResponse.tsx`
- `src/features/project-collaboration/components/CollaborationLinkForm.tsx`
- `src/features/projects/components/CreateAlbumForm/CreateAlbumForm.tsx`
- `src/features/projects/components/ProjectEventForm/ProjectEventForm.tsx`
- `src/features/projects/components/ProjectSettings/ProjectSettings.tsx`
- `src/features/projects/pages/CreateProjectEventPage/CreateProjectEventPage.tsx`
- `src/features/projects/pages/EditProjectEventPage/EditProjectEventPage.tsx`
- `src/lib/actions/ActionFailure.ts`
- `src/lib/actions/useActionError.ts`

## Validation

23 regression tests pass (including 8 error-boundary/recovery tests).
Scoped ESLint for actions/shared error infrastructure passes.
Full affected-client lint remains blocked by the existing render-time
photosRef.current assignment in usePhotoWallUpload.ts.
TypeScript remains blocked by the existing nullable TimePicker value in
ProjectEventScheduleSection.tsx (string | null passed to string).
Those unrelated lines were left unchanged.
