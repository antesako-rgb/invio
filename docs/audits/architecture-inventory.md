# Memora: statički inventar po featureima

Generirano naredbom `node scripts/architecture-audit.cjs`. Tumačenje i klasifikacija nalaza: [architecture-audit.md](./architecture-audit.md).

Consumer znači direktni modul koji importira/re-exporta datoteku, uključujući type-only importe i testove. Ne dokazuje dosegljivost iz routea. RPC naziv sam ne dokazuje autorizaciju niti DB grantove. READ/WRITE oznake izvedene su iz lokalnih poziva; delegirane operacije označene su zasebno.

## auth

### Repositories — sve datoteke

| Datoteka | Lokalna operacija | Direktni consumeri |
|---|---|---|
| src/features/auth/repositories/login.ts | Delegacija / auth / mapiranje (vidi izvor) | src/features/auth/components/LoginForm/LoginForm.tsx |
| src/features/auth/repositories/logout.ts | Delegacija / auth / mapiranje (vidi izvor) | src/features/auth/context/AuthProvider.tsx |
| src/features/auth/repositories/register.ts | Delegacija / auth / mapiranje (vidi izvor) | src/features/auth/components/RegisterForm/RegisterForm.tsx |

### Actions

Nema zasebnih datoteka u ovoj kategoriji.

### Services

Nema zasebnih datoteka u ovoj kategoriji.

### Types

- `src/features/auth/types/auth.types.ts` — consumeri: `src/features/auth/repositories/login.ts`, `src/features/auth/repositories/register.ts`, `src/features/auth/utils/authErrors.ts`

### Validation

- `src/features/auth/validation/login.schema.ts` — consumeri: `src/features/auth/components/LoginForm/LoginForm.tsx`
- `src/features/auth/validation/register.schema.ts` — consumeri: `src/features/auth/components/RegisterForm/RegisterForm.tsx`

### Utils

- `src/features/auth/utils/authErrors.ts` — consumeri: `src/features/auth/components/LoginForm/LoginForm.tsx`, `src/features/auth/components/RegisterForm/RegisterForm.tsx`, `src/features/auth/repositories/login.ts`, `src/features/auth/repositories/logout.ts`, `src/features/auth/repositories/register.ts`

### Feature pages

- `src/features/auth/pages/LoginPage/LoginPage.tsx` — consumeri: `src/app/[locale]/(auth)/prijava/page.tsx`
- `src/features/auth/pages/RegisterPage/RegisterPage.tsx` — consumeri: `src/app/[locale]/(auth)/registracija/page.tsx`

### Client boundaries

- `src/features/auth/components/LoginForm/LoginForm.tsx` — consumeri: `src/features/auth/pages/LoginPage/LoginPage.tsx`
- `src/features/auth/components/RegisterForm/RegisterForm.tsx` — consumeri: `src/features/auth/pages/RegisterPage/RegisterPage.tsx`
- `src/features/auth/context/AuthContext.tsx` — consumeri: `src/features/auth/context/AuthProvider.tsx`, `src/features/auth/hooks/useAuth.ts`
- `src/features/auth/context/AuthProvider.tsx` — consumeri: `src/components/providers/Providers.tsx`
- `src/features/auth/hooks/useAuth.ts` — consumeri: `src/components/navigation/DashboardMoreMenu/DashboardMoreMenu.tsx`, `src/components/navigation/DashboardSidebar/DashboardSidebar.tsx`, `src/components/navigation/PublicNavbar/PublicNavbar.tsx`, `src/components/navigation/UserMenu/UserMenu.tsx`
## dashboard

### Repositories — sve datoteke

| Datoteka | Lokalna operacija | Direktni consumeri |
|---|---|---|
| src/features/dashboard/repositories/getDashboardProducts.ts | from "photo_walls"; from "digital_albums"; from "invitations" | src/features/dashboard/components/DashboardProjects/DashboardProjects.tsx |

### Actions

Nema zasebnih datoteka u ovoj kategoriji.

### Services

Nema zasebnih datoteka u ovoj kategoriji.

### Types

Nema zasebnih datoteka u ovoj kategoriji.

### Validation

Nema zasebnih datoteka u ovoj kategoriji.

### Utils

Nema zasebnih datoteka u ovoj kategoriji.

### Feature pages

- `src/features/dashboard/pages/DashboardOverviewPage/DashboardOverviewPage.tsx` — consumeri: `src/app/[locale]/(dashboard)/dashboard/page.tsx`

### Client boundaries

- `src/features/dashboard/components/DashboardWelcome/DashboardWelcome.tsx` — consumeri: `src/features/dashboard/pages/DashboardOverviewPage/DashboardOverviewPage.tsx`
## digital-albums

### Repositories — sve datoteke

| Datoteka | Lokalna operacija | Direktni consumeri |
|---|---|---|
| src/features/digital-albums/repositories/album/createDigitalAlbum.ts | rpc "create_digital_album" | src/features/digital-albums/services/createInitializedDigitalAlbum.ts |
| src/features/digital-albums/repositories/album/deleteDigitalAlbum.ts | rpc "delete_digital_album" | src/features/digital-albums/services/createInitializedDigitalAlbum.ts<br>src/features/digital-albums/services/deleteDigitalAlbumWithStorage.ts |
| src/features/digital-albums/repositories/album/getDigitalAlbum.ts | from "digital_albums" | src/app/api/digital-albums/[albumId]/pdf/route.ts<br>src/app/[locale]/(dashboard)/dashboard/albums/[albumId]/page.tsx<br>src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/albums/[albumId]/page.tsx<br>src/app/[locale]/(standalone)/editor/album/[albumId]/uredi/page.tsx<br>src/app/[locale]/(standalone)/internal/digital-albums/[albumId]/render/page.tsx<br>src/features/digital-albums/repositories/photos/removeDigitalAlbumPhoto.ts |
| src/features/digital-albums/repositories/album/getProjectDigitalAlbums.ts | from "digital_albums" | src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/albums/page.tsx |
| src/features/digital-albums/repositories/album/getPublicDigitalAlbum.ts | rpc "get_public_digital_album" | src/app/[locale]/(fullscreen)/album/[publicId]/page.tsx |
| src/features/digital-albums/repositories/album/publishDigitalAlbum.ts | rpc "publish_digital_album" | src/features/digital-albums/actions/album/publishDigitalAlbumAction.ts |
| src/features/digital-albums/repositories/album/unpublishDigitalAlbum.ts | rpc "unpublish_digital_album" | src/features/digital-albums/actions/album/unpublishDigitalAlbumAction.ts |
| src/features/digital-albums/repositories/album/updateDigitalAlbum.ts | rpc "update_digital_album" | src/features/digital-albums/actions/album/updateDigitalAlbumAction.ts |
| src/features/digital-albums/repositories/album/updateDigitalAlbumDocument.ts | rpc "update_digital_album_document" | src/features/digital-albums/actions/album/updateDigitalAlbumDocumentAction.ts<br>src/features/digital-albums/services/createInitializedDigitalAlbum.ts |
| src/features/digital-albums/repositories/photos/addDigitalAlbumPhotos.ts | rpc "add_digital_album_photos" | src/features/digital-albums/actions/photos/addDigitalAlbumPhotosAction.ts |
| src/features/digital-albums/repositories/photos/createDigitalAlbumPhoto.ts | rpc "create_digital_album_photo" | src/features/digital-albums/repositories/photos/uploadDigitalAlbumPhoto.ts |
| src/features/digital-albums/repositories/photos/getDigitalAlbumPhotos.ts | from "digital_album_photos" | src/app/[locale]/(standalone)/editor/album/[albumId]/uredi/page.tsx<br>src/app/[locale]/(standalone)/internal/digital-albums/[albumId]/render/page.tsx |
| src/features/digital-albums/repositories/photos/removeDigitalAlbumPhoto.ts | from "project_photos"; rpc "remove_digital_album_photo" | src/features/digital-albums/actions/photos/removeDigitalAlbumPhotoAction.ts |
| src/features/digital-albums/repositories/photos/uploadDigitalAlbumPhoto.ts | Delegacija / auth / mapiranje (vidi izvor) | src/features/digital-albums/actions/photos/uploadDigitalAlbumPhotoAction.ts |

### Actions

- `src/features/digital-albums/actions/album/deleteDigitalAlbumAction.ts` — consumeri: nema statičkih importa
- `src/features/digital-albums/actions/album/publishDigitalAlbumAction.ts` — consumeri: `src/features/digital-albums/components/album-management/DigitalAlbumStatusCard/DigitalAlbumStatusAction.tsx`
- `src/features/digital-albums/actions/album/unpublishDigitalAlbumAction.ts` — consumeri: `src/features/digital-albums/components/album-management/DigitalAlbumStatusCard/DigitalAlbumStatusAction.tsx`
- `src/features/digital-albums/actions/album/updateDigitalAlbumAction.ts` — consumeri: `src/features/digital-albums/components/album-management/DigitalAlbumManagementHeader/DigitalAlbumNameEdit/DigitalAlbumNameEdit.tsx`
- `src/features/digital-albums/actions/album/updateDigitalAlbumDocumentAction.ts` — consumeri: `src/features/digital-albums/editor/hooks/album-editor/useDigitalAlbumEditor.ts`
- `src/features/digital-albums/actions/photos/addDigitalAlbumPhotosAction.ts` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumPhotosPanel/DigitalAlbumPhotosPanel.tsx`
- `src/features/digital-albums/actions/photos/getDigitalAlbumProjectPhotosAction.ts` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumAddPhotosDialog/DigitalAlbumAddPhotosDialog.tsx`
- `src/features/digital-albums/actions/photos/removeDigitalAlbumPhotoAction.ts` — consumeri: `src/features/digital-albums/editor/hooks/useDigitalAlbumPhotoLibrary.ts`
- `src/features/digital-albums/actions/photos/updateDigitalAlbumPhotoDescriptionAction.ts` — consumeri: `src/features/digital-albums/editor/hooks/useDigitalAlbumPhotoLibrary.ts`
- `src/features/digital-albums/actions/photos/uploadDigitalAlbumPhotoAction.ts` — consumeri: `src/features/digital-albums/editor/hooks/useDigitalAlbumUpload.ts`

### Services

- `src/features/digital-albums/services/createInitializedDigitalAlbum.ts` — consumeri: `src/features/projects/actions/createAlbumEntryAction.ts`; server-only: true
- `src/features/digital-albums/services/deleteDigitalAlbumWithStorage.ts` — consumeri: `src/features/digital-albums/actions/album/deleteDigitalAlbumAction.ts`; server-only: true

### Types

- `src/features/digital-albums/components/album-renderer/types/digitalAlbumRenderer.types.ts` — consumeri: `src/app/[locale]/(fullscreen)/album/[publicId]/page.tsx`, `src/app/[locale]/(standalone)/internal/digital-albums/[albumId]/render/page.tsx`, `src/features/digital-albums/components/album-renderer/DigitalAlbumPagePreview/DigitalAlbumPagePreview.tsx`, `src/features/digital-albums/components/album-renderer/DigitalAlbumPageRenderer/DigitalAlbumPageRenderer.tsx`, `src/features/digital-albums/components/album-renderer/DigitalAlbumPhoto/DigitalAlbumPhoto.tsx`, `src/features/digital-albums/components/album-renderer/DigitalAlbumPrintRenderer/DigitalAlbumPrintRenderer.tsx`, `src/features/digital-albums/components/album-renderer/DigitalAlbumRenderer/DigitalAlbumRenderer.tsx`, `src/features/digital-albums/components/album-renderer/DigitalAlbumViewer/DigitalAlbumReaderFrame.tsx`, `src/features/digital-albums/components/album-renderer/DigitalAlbumViewer/DigitalAlbumViewer.tsx`, `src/features/digital-albums/components/album-renderer/layouts/DigitalAlbumLayouts/DigitalAlbumLayouts.tsx`, `src/features/digital-albums/components/album-renderer/utils/getDigitalAlbumPhotoUrl.ts`, `src/features/digital-albums/components/album-renderer/utils/indexDigitalAlbumPhotos.ts`, `src/features/digital-albums/demo/digitalAlbumDemoPhotos.ts`
- `src/features/digital-albums/editor/types/digitalAlbumEditor.types.ts` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditor/DigitalAlbumEditor.tsx`, `src/features/digital-albums/editor/components/DigitalAlbumEditorMobileNavigation/DigitalAlbumEditorMobileNavigation.tsx`, `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/DigitalAlbumEditorSidebar.tsx`, `src/features/digital-albums/editor/components/DigitalAlbumEditorToolRail/DigitalAlbumEditorToolRail.tsx`, `src/features/digital-albums/editor/components/DigitalAlbumEditorView/DigitalAlbumEditorView.tsx`
- `src/features/digital-albums/types/digitalAlbum.types.ts` — consumeri: `src/features/digital-albums/actions/album/publishDigitalAlbumAction.ts`, `src/features/digital-albums/actions/album/unpublishDigitalAlbumAction.ts`, `src/features/digital-albums/actions/album/updateDigitalAlbumAction.ts`, `src/features/digital-albums/actions/album/updateDigitalAlbumDocumentAction.ts`, `src/features/digital-albums/components/album-management/DigitalAlbumCollection/DigitalAlbumCollection.tsx`, `src/features/digital-albums/components/album-management/DigitalAlbumManagementHeader/DigitalAlbumManagementHeader.tsx`, `src/features/digital-albums/components/album-management/DigitalAlbumPublicLinkCard/DigitalAlbumPublicLinkCard.tsx`, `src/features/digital-albums/components/album-management/DigitalAlbumStatusCard/DigitalAlbumStatusCard.tsx`, `src/features/digital-albums/pages/DigitalAlbumManagementPage/DigitalAlbumManagementPage.tsx`, `src/features/digital-albums/repositories/album/getDigitalAlbum.ts`, `src/features/digital-albums/repositories/album/getProjectDigitalAlbums.ts`, `src/features/digital-albums/repositories/album/getPublicDigitalAlbum.ts`, `src/features/digital-albums/repositories/album/publishDigitalAlbum.ts`, `src/features/digital-albums/repositories/album/unpublishDigitalAlbum.ts`, `src/features/digital-albums/repositories/album/updateDigitalAlbum.ts`, `src/features/digital-albums/repositories/album/updateDigitalAlbumDocument.ts`
- `src/features/digital-albums/types/digitalAlbumDocument.types.ts` — consumeri: `src/features/digital-albums/components/album-renderer/DigitalAlbumPagePreview/DigitalAlbumPagePreview.tsx`, `src/features/digital-albums/components/album-renderer/DigitalAlbumPageRenderer/DigitalAlbumPageRenderer.tsx`, `src/features/digital-albums/components/album-renderer/DigitalAlbumPhoto/DigitalAlbumPhoto.tsx`, `src/features/digital-albums/components/album-renderer/DigitalAlbumPrintRenderer/DigitalAlbumPrintRenderer.tsx`, `src/features/digital-albums/components/album-renderer/DigitalAlbumRenderer/DigitalAlbumRenderer.tsx`, `src/features/digital-albums/components/album-renderer/DigitalAlbumViewer/DigitalAlbumReaderFrame.tsx`, `src/features/digital-albums/components/album-renderer/DigitalAlbumViewer/DigitalAlbumViewer.tsx`, `src/features/digital-albums/components/album-renderer/layouts/DigitalAlbumLayouts/DigitalAlbumLayouts.tsx`, `src/features/digital-albums/components/album-renderer/layouts/DigitalAlbumLayouts/types.ts`, `src/features/digital-albums/config/digitalAlbumLayouts.ts`, `src/features/digital-albums/demo/createDemoDigitalAlbumDocument.ts`, `src/features/digital-albums/demo/digitalAlbumDemoContent.ts`, `src/features/digital-albums/document/createDefaultDigitalAlbumDocument.ts`, `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/components/DigitalAlbumLayoutPicker/DigitalAlbumLayoutPicker.tsx`, `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/components/DigitalAlbumThemePicker/DigitalAlbumThemePicker.tsx`, `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/DigitalAlbumEditorSidebar.tsx`, `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumDesignPanel/DigitalAlbumDesignPanel.tsx`, `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumPagesPanel/DigitalAlbumAddPageDialog/DigitalAlbumAddPageDialog.tsx`, `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumPagesPanel/DigitalAlbumPagesPanel.tsx`, `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumPagesPanel/DigitalAlbumSortablePage/DigitalAlbumSortablePage.tsx`, `src/features/digital-albums/editor/components/DigitalAlbumEditorView/DigitalAlbumEditorView.tsx`, `src/features/digital-albums/editor/components/DigitalAlbumPhotoContext/DigitalAlbumPhotoContext.tsx`, `src/features/digital-albums/editor/components/DigitalAlbumPhotoPositionEditor/DigitalAlbumPhotoPositionEditor.tsx`, `src/features/digital-albums/editor/hooks/album-editor/useDigitalAlbumEditor.ts`, `src/features/digital-albums/editor/hooks/album-editor/useDigitalAlbumPageActions.ts`, `src/features/digital-albums/editor/hooks/album-editor/useDigitalAlbumPhotoActions.ts`, `src/features/digital-albums/editor/state/DigitalAlbumSession.ts`, `src/features/digital-albums/editor/utils/resolveDigitalAlbumPhotoView.ts`, `src/features/digital-albums/types/digitalAlbum.types.ts`, `src/features/digital-albums/utils/digitalAlbumDocumentOperations.ts`, `src/features/digital-albums/utils/digitalAlbumPhotoContext.ts`, `src/features/digital-albums/utils/digitalAlbumPhotoReferences.ts`, `src/features/digital-albums/utils/parseDigitalAlbumDocument.ts`, `src/features/digital-albums/utils/parseDigitalAlbumDocument.ts`
- `src/features/digital-albums/types/digitalAlbumPhoto.types.ts` — consumeri: `src/features/digital-albums/actions/photos/addDigitalAlbumPhotosAction.ts`, `src/features/digital-albums/actions/photos/removeDigitalAlbumPhotoAction.ts`, `src/features/digital-albums/actions/photos/uploadDigitalAlbumPhotoAction.ts`, `src/features/digital-albums/components/album-renderer/DigitalAlbumPagePreview/DigitalAlbumPagePreview.tsx`, `src/features/digital-albums/editor/components/DigitalAlbumAddPhotosDialog/DigitalAlbumAddPhotosDialog.tsx`, `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/DigitalAlbumEditorSidebar.tsx`, `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumPagesPanel/DigitalAlbumPagesPanel.tsx`, `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumPagesPanel/DigitalAlbumSortablePage/DigitalAlbumSortablePage.tsx`, `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumPhotosPanel/DigitalAlbumPhotosPanel.tsx`, `src/features/digital-albums/editor/components/DigitalAlbumEditorView/DigitalAlbumEditorView.tsx`, `src/features/digital-albums/editor/components/DigitalAlbumUpload/DigitalAlbumUpload.tsx`, `src/features/digital-albums/editor/hooks/useDigitalAlbumPhotoLibrary.ts`, `src/features/digital-albums/editor/hooks/useDigitalAlbumUpload.ts`, `src/features/digital-albums/repositories/photos/addDigitalAlbumPhotos.ts`, `src/features/digital-albums/repositories/photos/createDigitalAlbumPhoto.ts`, `src/features/digital-albums/repositories/photos/getDigitalAlbumPhotos.ts`, `src/features/digital-albums/repositories/photos/removeDigitalAlbumPhoto.ts`, `src/features/digital-albums/repositories/photos/uploadDigitalAlbumPhoto.ts`, `src/features/digital-albums/types/digitalAlbum.types.ts`

### Validation

Nema zasebnih datoteka u ovoj kategoriji.

### Utils

- `src/features/digital-albums/components/album-renderer/utils/getDigitalAlbumPhotoUrl.ts` — consumeri: `src/features/digital-albums/components/album-renderer/DigitalAlbumPhoto/DigitalAlbumPhoto.tsx`
- `src/features/digital-albums/components/album-renderer/utils/indexDigitalAlbumPhotos.ts` — consumeri: `src/features/digital-albums/components/album-renderer/DigitalAlbumPrintRenderer/DigitalAlbumPrintRenderer.tsx`, `src/features/digital-albums/components/album-renderer/DigitalAlbumRenderer/DigitalAlbumRenderer.tsx`, `src/features/digital-albums/components/album-renderer/DigitalAlbumViewer/DigitalAlbumReaderFrame.tsx`
- `src/features/digital-albums/editor/utils/deleteDigitalAlbumLibraryPhoto.ts` — consumeri: `src/features/digital-albums/editor/hooks/useDigitalAlbumPhotoLibrary.ts`
- `src/features/digital-albums/editor/utils/resolveDigitalAlbumPhotoView.ts` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditorView/DigitalAlbumEditorView.tsx`
- `src/features/digital-albums/utils/digitalAlbumDocumentOperations.ts` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditorView/DigitalAlbumEditorView.tsx`, `src/features/digital-albums/editor/hooks/album-editor/useDigitalAlbumPageActions.ts`, `src/features/digital-albums/editor/state/DigitalAlbumSession.ts`, `src/features/digital-albums/repositories/album/updateDigitalAlbumDocument.ts`, `src/features/digital-albums/repositories/photos/removeDigitalAlbumPhoto.ts`
- `src/features/digital-albums/utils/digitalAlbumPhotoContext.ts` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditorView/DigitalAlbumEditorView.tsx`, `src/features/digital-albums/editor/hooks/album-editor/useDigitalAlbumPhotoActions.ts`
- `src/features/digital-albums/utils/digitalAlbumPhotoReferences.ts` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumPhotoUsageDialog/DigitalAlbumPhotoUsageDialog.tsx`, `src/features/digital-albums/editor/hooks/album-editor/useDigitalAlbumPhotoActions.ts`, `src/features/digital-albums/editor/hooks/useDigitalAlbumPhotoLibrary.ts`
- `src/features/digital-albums/utils/digitalAlbumRevision.ts` — consumeri: `src/features/digital-albums/actions/album/updateDigitalAlbumDocumentAction.ts`, `src/features/digital-albums/editor/hooks/album-editor/useDigitalAlbumEditor.ts`, `src/features/digital-albums/editor/state/DigitalAlbumSession.ts`, `src/features/digital-albums/repositories/album/getDigitalAlbum.ts`, `src/features/digital-albums/repositories/album/updateDigitalAlbumDocument.ts`
- `src/features/digital-albums/utils/formatDigitalAlbumDate.ts` — consumeri: `src/features/digital-albums/components/album-renderer/layouts/DigitalAlbumLayouts/DigitalAlbumLayouts.tsx`
- `src/features/digital-albums/utils/getDigitalAlbumPublicPath.ts` — consumeri: `src/features/digital-albums/components/album-management/DigitalAlbumManagementHeader/DigitalAlbumManagementHeader.tsx`, `src/features/digital-albums/components/album-management/DigitalAlbumPublicLinkCard/DigitalAlbumPublicLinkCard.tsx`
- `src/features/digital-albums/utils/getDigitalAlbumTextOverflow.ts` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditorView/DigitalAlbumEditorView.tsx`, `src/features/digital-albums/server/pdf/waitForDigitalAlbumPrintReady.ts`
- `src/features/digital-albums/utils/parseDigitalAlbumDocument.ts` — consumeri: `src/app/[locale]/(standalone)/editor/album/[albumId]/uredi/page.tsx`, `src/app/[locale]/(standalone)/internal/digital-albums/[albumId]/render/page.tsx`, `src/features/digital-albums/editor/hooks/album-editor/useDigitalAlbumEditor.ts`, `src/features/digital-albums/repositories/album/getDigitalAlbum.ts`, `src/features/digital-albums/repositories/album/getPublicDigitalAlbum.ts`, `src/features/digital-albums/repositories/album/updateDigitalAlbumDocument.ts`, `src/features/digital-albums/repositories/photos/removeDigitalAlbumPhoto.ts`

### Feature pages

- `src/features/digital-albums/pages/DigitalAlbumManagementPage/DigitalAlbumManagementPage.tsx` — consumeri: `src/app/[locale]/(dashboard)/dashboard/albums/[albumId]/page.tsx`

### Client boundaries

- `src/features/digital-albums/components/album-management/DigitalAlbumManagementHeader/DigitalAlbumNameEdit/DigitalAlbumNameEdit.tsx` — consumeri: `src/features/digital-albums/components/album-management/DigitalAlbumManagementHeader/DigitalAlbumManagementHeader.tsx`
- `src/features/digital-albums/components/album-management/DigitalAlbumStatusCard/DigitalAlbumStatusAction.tsx` — consumeri: `src/features/digital-albums/components/album-management/DigitalAlbumStatusCard/DigitalAlbumStatusCard.tsx`
- `src/features/digital-albums/components/album-renderer/DigitalAlbumFlipBook/DigitalAlbumFlipBook.tsx` — consumeri: `src/features/digital-albums/components/album-renderer/DigitalAlbumRenderer/DigitalAlbumRenderer.tsx`, `src/features/digital-albums/components/album-renderer/DigitalAlbumRenderer/DigitalAlbumRenderer.tsx`, `src/features/digital-albums/components/album-renderer/DigitalAlbumViewer/DigitalAlbumReaderFrame.tsx`
- `src/features/digital-albums/components/album-renderer/DigitalAlbumPhoto/DigitalAlbumPhoto.tsx` — consumeri: `src/features/digital-albums/components/album-renderer/layouts/DigitalAlbumLayouts/DigitalAlbumLayouts.tsx`
- `src/features/digital-albums/components/album-renderer/DigitalAlbumPhotoSlot/DigitalAlbumPhotoSlot.tsx` — consumeri: `src/features/digital-albums/components/album-renderer/DigitalAlbumPhoto/DigitalAlbumPhoto.tsx`
- `src/features/digital-albums/components/album-renderer/DigitalAlbumPrintRenderer/DigitalAlbumPrintRenderer.tsx` — consumeri: `src/app/[locale]/(standalone)/internal/digital-albums/[albumId]/render/page.tsx`
- `src/features/digital-albums/components/album-renderer/DigitalAlbumRenderer/DigitalAlbumRenderer.tsx` — consumeri: `src/features/digital-albums/components/album-renderer/DigitalAlbumViewer/DigitalAlbumViewer.tsx`, `src/features/digital-albums/editor/components/DigitalAlbumEditorView/DigitalAlbumEditorView.tsx`
- `src/features/digital-albums/components/album-renderer/DigitalAlbumViewer/DigitalAlbumReaderFrame.tsx` — consumeri: `src/features/digital-albums/components/album-renderer/DigitalAlbumViewer/DigitalAlbumViewer.tsx`, `src/features/digital-albums/editor/components/DigitalAlbumEditorView/DigitalAlbumEditorView.tsx`
- `src/features/digital-albums/components/album-renderer/DigitalAlbumViewer/DigitalAlbumViewer.tsx` — consumeri: `src/app/[locale]/(fullscreen)/album/[publicId]/page.tsx`, `src/app/[locale]/(templates)/templates/album/[theme]/page.tsx`
- `src/features/digital-albums/components/album-renderer/layouts/DigitalAlbumLayouts/DigitalAlbumLayouts.tsx` — consumeri: `src/features/digital-albums/components/album-renderer/DigitalAlbumPageRenderer/DigitalAlbumPageRenderer.tsx`
- `src/features/digital-albums/editor/components/DigitalAlbumAddPhotosDialog/DigitalAlbumAddPhotosDialog.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumPhotosPanel/DigitalAlbumPhotosPanel.tsx`
- `src/features/digital-albums/editor/components/DigitalAlbumEditableText/DigitalAlbumEditableText.tsx` — consumeri: `src/features/digital-albums/components/album-renderer/layouts/DigitalAlbumLayouts/DigitalAlbumLayouts.tsx`
- `src/features/digital-albums/editor/components/DigitalAlbumEditor/DigitalAlbumEditor.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditorView/DigitalAlbumEditorView.tsx`
- `src/features/digital-albums/editor/components/DigitalAlbumEditorHeader/DigitalAlbumEditorHeader.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditor/DigitalAlbumEditor.tsx`
- `src/features/digital-albums/editor/components/DigitalAlbumEditorMobileNavigation/DigitalAlbumEditorMobileNavigation.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditor/DigitalAlbumEditor.tsx`
- `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/components/DigitalAlbumLayoutPicker/DigitalAlbumLayoutPicker.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumDesignPanel/DigitalAlbumDesignPanel.tsx`, `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumPagesPanel/DigitalAlbumAddPageDialog/DigitalAlbumAddPageDialog.tsx`
- `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/components/DigitalAlbumPicker/DigitalAlbumPicker.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/components/DigitalAlbumThemePicker/DigitalAlbumThemePicker.tsx`
- `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/components/DigitalAlbumThemePicker/DigitalAlbumThemePicker.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumDesignPanel/DigitalAlbumDesignPanel.tsx`
- `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/DigitalAlbumEditorSidebar.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditorView/DigitalAlbumEditorView.tsx`
- `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumDesignPanel/DigitalAlbumDesignPanel.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/DigitalAlbumEditorSidebar.tsx`
- `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumPagesPanel/DigitalAlbumAddPageDialog/DigitalAlbumAddPageDialog.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumPagesPanel/DigitalAlbumPagesPanel.tsx`
- `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumPagesPanel/DigitalAlbumPagesPanel.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/DigitalAlbumEditorSidebar.tsx`
- `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumPagesPanel/DigitalAlbumSortablePage/DigitalAlbumSortablePage.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumPagesPanel/DigitalAlbumPagesPanel.tsx`
- `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumPhotosPanel/DigitalAlbumPhotosPanel.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/DigitalAlbumEditorSidebar.tsx`
- `src/features/digital-albums/editor/components/DigitalAlbumEditorToolRail/DigitalAlbumEditorToolRail.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditor/DigitalAlbumEditor.tsx`
- `src/features/digital-albums/editor/components/DigitalAlbumEditorView/DigitalAlbumEditorView.tsx` — consumeri: `src/app/[locale]/(standalone)/editor/album/[albumId]/uredi/page.tsx`
- `src/features/digital-albums/editor/components/DigitalAlbumPdfExportAction/DigitalAlbumPdfExportAction.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditorHeader/DigitalAlbumEditorHeader.tsx`
- `src/features/digital-albums/editor/components/DigitalAlbumPhotoContext/DigitalAlbumPhotoContext.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditorView/DigitalAlbumEditorView.tsx`
- `src/features/digital-albums/editor/components/DigitalAlbumPhotoPicker/DigitalAlbumPhotoPicker.tsx` — consumeri: nema statičkih importa
- `src/features/digital-albums/editor/components/DigitalAlbumPhotoPositionEditor/DigitalAlbumPhotoPositionEditor.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditorView/DigitalAlbumEditorView.tsx`
- `src/features/digital-albums/editor/components/DigitalAlbumPhotoUsageDialog/DigitalAlbumPhotoUsageDialog.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditorView/DigitalAlbumEditorView.tsx`
- `src/features/digital-albums/editor/components/DigitalAlbumUpload/DigitalAlbumUpload.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumAddPhotosDialog/DigitalAlbumAddPhotosDialog.tsx`
- `src/features/digital-albums/editor/hooks/album-editor/useDigitalAlbumEditor.ts` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditorView/DigitalAlbumEditorView.tsx`, `src/features/digital-albums/editor/hooks/useDigitalAlbumPhotoLibrary.ts`
- `src/features/digital-albums/editor/hooks/useDigitalAlbumMobilePanel.ts` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditor/DigitalAlbumEditor.tsx`, `src/features/digital-albums/editor/components/DigitalAlbumEditorView/DigitalAlbumEditorView.tsx`, `src/features/digital-albums/editor/components/DigitalAlbumEditorView/DigitalAlbumEditorView.tsx`
- `src/features/digital-albums/editor/hooks/useDigitalAlbumPhotoLibrary.ts` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditorView/DigitalAlbumEditorView.tsx`
- `src/features/digital-albums/editor/hooks/useDigitalAlbumPhotoPicker.ts` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumPhotoPicker/DigitalAlbumPhotoPicker.tsx`
- `src/features/digital-albums/editor/hooks/useDigitalAlbumUpload.ts` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumUpload/DigitalAlbumUpload.tsx`
## editor

### Repositories — sve datoteke

| Datoteka | Lokalna operacija | Direktni consumeri |
|---|---|---|

### Actions

Nema zasebnih datoteka u ovoj kategoriji.

### Services

Nema zasebnih datoteka u ovoj kategoriji.

### Types

- `src/features/editor/types/editorPhotoFraming.types.ts` — consumeri: `src/features/digital-albums/types/digitalAlbumDocument.types.ts`, `src/features/editor/components/EditorPhotoFraming/EditorPhotoFraming.tsx`, `src/features/editor/utils/editorPhotoStyle.ts`, `src/features/invitations/editor/components/InvitationEditorView/InvitationEditorView.tsx`, `src/features/invitations/types/invitationDocument.types.ts`

### Validation

Nema zasebnih datoteka u ovoj kategoriji.

### Utils

- `src/features/editor/utils/editorPhotoStyle.ts` — consumeri: `src/features/digital-albums/components/album-renderer/DigitalAlbumPhoto/DigitalAlbumPhoto.tsx`, `src/features/editor/components/EditorPhotoFraming/EditorPhotoFraming.tsx`, `src/features/invitations/components/invitation-renderer/InvitationPhotos.tsx`

### Feature pages

Nema zasebnih datoteka u ovoj kategoriji.

### Client boundaries

- `src/features/editor/components/EditorDateTimeValue/EditorDateTimeValue.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditableText/DigitalAlbumEditableText.tsx`, `src/features/invitations/editor/components/InvitationEditorView/InvitationEditorView.tsx`
- `src/features/editor/components/EditorEditableText/EditorEditableText.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditableText/DigitalAlbumEditableText.tsx`, `src/features/invitations/editor/components/InvitationEditorView/InvitationEditorView.tsx`
- `src/features/editor/components/EditorExistingPhotosPicker/EditorExistingPhotosPicker.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumAddPhotosDialog/DigitalAlbumAddPhotosDialog.tsx`, `src/features/invitations/editor/components/InvitationPhotosPanel/InvitationPhotosPanel.tsx`
- `src/features/editor/components/EditorMobileNavigation/EditorMobileNavigation.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditorMobileNavigation/DigitalAlbumEditorMobileNavigation.tsx`, `src/features/invitations/editor/components/InvitationEditor/InvitationEditor.tsx`, `src/features/photo-walls/editor/components/PhotoWallMaterialEditor/PhotoWallMaterialEditor.tsx`
- `src/features/editor/components/EditorMobilePanel/EditorMobilePanel.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditor/DigitalAlbumEditor.tsx`, `src/features/digital-albums/editor/components/DigitalAlbumEditorView/DigitalAlbumEditorView.tsx`, `src/features/digital-albums/editor/hooks/useDigitalAlbumMobilePanel.ts`, `src/features/invitations/editor/components/InvitationEditor/InvitationEditor.tsx`, `src/features/photo-walls/editor/components/PhotoWallMaterialEditor/PhotoWallMaterialEditor.tsx`
- `src/features/editor/components/EditorPhotoDescription/EditorPhotoDescription.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumPhotosPanel/DigitalAlbumPhotosPanel.tsx`, `src/features/digital-albums/editor/components/DigitalAlbumEditorView/DigitalAlbumEditorView.tsx`, `src/features/invitations/editor/components/InvitationEditorView/InvitationEditorView.tsx`, `src/features/invitations/editor/components/InvitationPhotosPanel/InvitationPhotosPanel.tsx`, `src/features/photo-walls/components/photo-wall-management/PhotoWallPhotoManagementActions/PhotoWallPhotoManagementActions.tsx`
- `src/features/editor/components/EditorPhotoFraming/EditorPhotoFraming.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumPhotoPositionEditor/DigitalAlbumPhotoPositionEditor.tsx`, `src/features/invitations/editor/components/InvitationEditorView/InvitationEditorView.tsx`
- `src/features/editor/components/EditorPhotoInspector/EditorPhotoInspector.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumPhotoContext/DigitalAlbumPhotoContext.tsx`, `src/features/invitations/editor/components/InvitationEditorView/InvitationEditorView.tsx`
- `src/features/editor/components/EditorPhotoLibrary/EditorLibraryPhoto.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumPhotosPanel/DigitalAlbumPhotosPanel.tsx`, `src/features/editor/components/EditorExistingPhotosPicker/EditorExistingPhotosPicker.tsx`, `src/features/invitations/editor/components/InvitationPhotosPanel/InvitationPhotosPanel.tsx`
- `src/features/editor/components/EditorPhotoLibrary/EditorPhotoLibrary.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumPhotosPanel/DigitalAlbumPhotosPanel.tsx`, `src/features/invitations/editor/components/InvitationPhotosPanel/InvitationPhotosPanel.tsx`
- `src/features/editor/components/EditorPhotoLibrary/EditorPhotoSource.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumAddPhotosDialog/DigitalAlbumAddPhotosDialog.tsx`, `src/features/invitations/editor/components/InvitationPhotosPanel/InvitationPhotosPanel.tsx`
- `src/features/editor/components/EditorPhotoUsageDialog/EditorPhotoUsageDialog.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumPhotoUsageDialog/DigitalAlbumPhotoUsageDialog.tsx`, `src/features/invitations/editor/components/InvitationEditorView/InvitationEditorView.tsx`
- `src/features/editor/components/EditorPreview/EditorPreview.tsx` — consumeri: `src/features/invitations/editor/components/InvitationEditor/InvitationEditor.tsx`
- `src/features/editor/components/pages/EditorPageActionButton/EditorPageActionButton.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumPagesPanel/DigitalAlbumSortablePage/DigitalAlbumSortablePage.tsx`, `src/features/invitations/editor/components/InvitationPagesPanel/InvitationPageRow.tsx`
- `src/features/editor/components/pages/EditorPageAddButton/EditorPageAddButton.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumPagesPanel/DigitalAlbumPagesPanel.tsx`, `src/features/invitations/editor/components/InvitationPagePicker/InvitationPagePicker.tsx`
## invitations

### Repositories — sve datoteke

| Datoteka | Lokalna operacija | Direktni consumeri |
|---|---|---|
| src/features/invitations/repositories/invitation/createInvitation.ts | rpc "create_invitation" | src/features/invitations/actions/invitation/createInvitationAction.ts |
| src/features/invitations/repositories/invitation/getInvitation.ts | from "invitations" | src/app/[locale]/(dashboard)/dashboard/invitations/[invitationId]/layout.tsx<br>src/app/[locale]/(dashboard)/dashboard/invitations/[invitationId]/page.tsx<br>src/app/[locale]/(dashboard)/dashboard/invitations/[invitationId]/settings/page.tsx<br>src/app/[locale]/(dashboard)/dashboard/invitations/[invitationId]/templates/page.tsx<br>src/app/[locale]/(standalone)/editor/invitation/[invitationId]/uredi/page.tsx<br>src/features/invitations/actions/invitation/setInvitationPublishedAction.ts<br>src/features/invitations/components/InvitationManagement/InvitationManagementNavigation.tsx<br>src/features/invitations/repositories/photos/getInvitationProjectPhotos.ts<br>src/features/invitations/utils/redirectLegacyInvitation.ts |
| src/features/invitations/repositories/invitation/getProjectInvitations.ts | from "invitations" | src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/invitations/page.tsx |
| src/features/invitations/repositories/invitation/getPublicInvitation.ts | rpc "get_public_invitation" | src/app/[locale]/(fullscreen)/invitation/[publicId]/page.tsx |
| src/features/invitations/repositories/invitation/manageInvitation.ts | rpc "set_primary_rsvp_invitation"; rpc "delete_invitation" | src/features/invitations/actions/invitation/manageInvitationAction.ts |
| src/features/invitations/repositories/invitation/publishInvitation.ts | rpc "publish_invitation" | src/features/invitations/actions/invitation/setInvitationPublishedAction.ts |
| src/features/invitations/repositories/invitation/unpublishInvitation.ts | rpc "unpublish_invitation" | src/features/invitations/actions/invitation/setInvitationPublishedAction.ts |
| src/features/invitations/repositories/invitation/updateInvitation.ts | rpc "update_invitation" | src/features/invitations/actions/invitation/updateInvitationAction.ts |
| src/features/invitations/repositories/invitation/updateInvitationDocument.ts | rpc "update_invitation_document" | src/features/invitations/actions/invitation/updateInvitationDocumentAction.ts |
| src/features/invitations/repositories/photos/addInvitationPhotos.ts | rpc "add_invitation_photos" | src/features/invitations/actions/photos/invitationPhotoActions.ts |
| src/features/invitations/repositories/photos/getInvitationPhotos.ts | from "invitation_photos" | src/app/[locale]/(standalone)/editor/invitation/[invitationId]/uredi/page.tsx<br>src/features/invitations/actions/invitation/setInvitationPublishedAction.ts<br>src/features/invitations/actions/photos/invitationPhotoActions.ts |
| src/features/invitations/repositories/photos/getInvitationProjectPhotos.ts | from "project_photos" | src/features/invitations/actions/photos/invitationPhotoActions.ts |
| src/features/invitations/repositories/photos/removeInvitationPhoto.ts | from "project_photos"; rpc "remove_invitation_photo" | src/features/invitations/actions/photos/invitationPhotoActions.ts |
| src/features/invitations/repositories/photos/uploadInvitationPhoto.ts | rpc "create_invitation_photo"; from "project_photos" | src/features/invitations/actions/photos/invitationPhotoActions.ts |
| src/features/invitations/repositories/templates/getInvitationTemplates.ts | from "invitation_templates" | src/features/invitations/components/InvitationManagement/InvitationProjectTemplates.tsx |

### Actions

- `src/features/invitations/actions/invitation/createInvitationAction.ts` — consumeri: `src/features/invitations/components/InvitationProjectCard/CreateInvitationButton.tsx`
- `src/features/invitations/actions/invitation/manageInvitationAction.ts` — consumeri: `src/features/invitations/components/InvitationManagement/InvitationManagementActions.tsx`
- `src/features/invitations/actions/invitation/setInvitationPublishedAction.ts` — consumeri: `src/features/invitations/components/InvitationManagement/InvitationPublishAction.tsx`, `src/features/invitations/editor/components/InvitationEditorView/InvitationEditorView.tsx`
- `src/features/invitations/actions/invitation/updateInvitationAction.ts` — consumeri: `src/features/invitations/components/InvitationManagement/InvitationManagementNavigation.tsx`, `src/features/invitations/editor/components/InvitationEditorView/InvitationEditorView.tsx`
- `src/features/invitations/actions/invitation/updateInvitationDocumentAction.ts` — consumeri: `src/features/invitations/editor/hooks/useInvitationEditor.ts`
- `src/features/invitations/actions/photos/invitationPhotoActions.ts` — consumeri: `src/features/invitations/editor/components/InvitationEditorView/InvitationEditorView.tsx`, `src/features/invitations/editor/components/InvitationPhotosPanel/InvitationPhotosPanel.tsx`
- `src/features/invitations/actions/photos/updateInvitationPhotoDescriptionAction.ts` — consumeri: `src/features/invitations/editor/components/InvitationEditorView/InvitationEditorView.tsx`

### Services

Nema zasebnih datoteka u ovoj kategoriji.

### Types

- `src/features/invitations/types/invitation.types.ts` — consumeri: `src/features/invitations/actions/invitation/updateInvitationDocumentAction.ts`, `src/features/invitations/editor/components/InvitationEditorView/InvitationEditorView.tsx`, `src/features/invitations/editor/hooks/useInvitationEditor.ts`, `src/features/invitations/repositories/invitation/createInvitation.ts`, `src/features/invitations/repositories/invitation/updateInvitation.ts`, `src/features/invitations/repositories/invitation/updateInvitationDocument.ts`
- `src/features/invitations/types/invitationDocument.types.ts` — consumeri: `src/features/invitations/components/invitation-renderer/InvitationLayouts.tsx`, `src/features/invitations/components/invitation-renderer/InvitationPageContent.tsx`, `src/features/invitations/components/invitation-renderer/InvitationPhotos.tsx`, `src/features/invitations/components/invitation-renderer/InvitationRenderer.tsx`, `src/features/invitations/config/invitationInlineFields.ts`, `src/features/invitations/editor/components/InvitationContentPanel/InvitationContentPanel.tsx`, `src/features/invitations/editor/components/InvitationEditorView/InvitationEditorView.tsx`, `src/features/invitations/editor/components/InvitationPageNavigator/InvitationPageNavigator.tsx`, `src/features/invitations/editor/components/InvitationPagesPanel/InvitationPageRow.tsx`, `src/features/invitations/editor/components/InvitationPagesPanel/InvitationPagesPanel.tsx`, `src/features/invitations/editor/components/InvitationThumbnail/InvitationThumbnail.tsx`, `src/features/invitations/editor/state/InvitationSession.ts`, `src/features/invitations/pages/PublicInvitationPage/PublicInvitationPage.tsx`, `src/features/invitations/types/invitation.types.ts`, `src/features/invitations/types/invitationTemplate.types.ts`, `src/features/invitations/utils/invitationDocumentOperations.ts`, `src/features/invitations/utils/invitationPhotoUsage.ts`, `src/features/invitations/utils/invitationSharedDateTime.ts`, `src/features/invitations/utils/parseInvitationDocument.ts`
- `src/features/invitations/types/invitationPhoto.types.ts` — consumeri: `src/features/invitations/actions/photos/invitationPhotoActions.ts`, `src/features/invitations/components/invitation-renderer/InvitationLayouts.tsx`, `src/features/invitations/components/invitation-renderer/InvitationPhotos.tsx`, `src/features/invitations/components/invitation-renderer/InvitationRenderer.tsx`, `src/features/invitations/editor/components/InvitationEditorView/InvitationEditorView.tsx`, `src/features/invitations/editor/components/InvitationPageNavigator/InvitationPageNavigator.tsx`, `src/features/invitations/editor/components/InvitationPagesPanel/InvitationPageRow.tsx`, `src/features/invitations/editor/components/InvitationPagesPanel/InvitationPagesPanel.tsx`, `src/features/invitations/editor/components/InvitationPhotosPanel/InvitationPhotosPanel.tsx`, `src/features/invitations/editor/components/InvitationThumbnail/InvitationThumbnail.tsx`, `src/features/invitations/pages/PublicInvitationPage/PublicInvitationPage.tsx`, `src/features/invitations/repositories/photos/getInvitationPhotos.ts`
- `src/features/invitations/types/invitationTemplate.types.ts` — consumeri: `src/features/invitations/components/InvitationManagement/InvitationTemplateCatalog.tsx`, `src/features/invitations/repositories/templates/getInvitationTemplates.ts`

### Validation

Nema zasebnih datoteka u ovoj kategoriji.

### Utils

- `src/features/invitations/utils/invitationDocumentOperations.ts` — consumeri: `src/features/invitations/actions/invitation/setInvitationPublishedAction.ts`, `src/features/invitations/editor/components/InvitationContentPanel/InvitationContentPanel.tsx`, `src/features/invitations/editor/components/InvitationEditorView/InvitationEditorView.tsx`, `src/features/invitations/editor/state/InvitationSession.ts`, `src/features/invitations/repositories/invitation/updateInvitationDocument.ts`
- `src/features/invitations/utils/invitationPhotoUsage.ts` — consumeri: `src/features/invitations/editor/components/InvitationEditorView/InvitationEditorView.tsx`
- `src/features/invitations/utils/invitationRevision.ts` — consumeri: `src/features/invitations/actions/invitation/updateInvitationDocumentAction.ts`, `src/features/invitations/editor/hooks/useInvitationEditor.ts`, `src/features/invitations/editor/state/InvitationSession.ts`, `src/features/invitations/repositories/invitation/getInvitation.ts`, `src/features/invitations/repositories/invitation/updateInvitationDocument.ts`
- `src/features/invitations/utils/invitationSharedDateTime.ts` — consumeri: `src/features/invitations/components/invitation-renderer/InvitationRenderer.tsx`, `src/features/invitations/editor/components/InvitationEditorView/InvitationEditorView.tsx`, `src/features/invitations/utils/parseInvitationDocument.ts`
- `src/features/invitations/utils/invitationTemplateFilter.ts` — consumeri: `src/features/invitations/components/InvitationManagement/InvitationTemplateCatalog.tsx`
- `src/features/invitations/utils/parseInvitationDocument.ts` — consumeri: `src/features/invitations/actions/invitation/setInvitationPublishedAction.ts`, `src/features/invitations/editor/hooks/useInvitationEditor.ts`, `src/features/invitations/repositories/invitation/getInvitation.ts`, `src/features/invitations/repositories/invitation/getPublicInvitation.ts`, `src/features/invitations/repositories/invitation/updateInvitationDocument.ts`, `src/features/invitations/repositories/templates/getInvitationTemplates.ts`
- `src/features/invitations/utils/redirectLegacyInvitation.ts` — consumeri: `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/invitation/guests/page.tsx`, `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/invitation/page.tsx`, `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/invitation/settings/page.tsx`, `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/invitation/templates/page.tsx`

### Feature pages

- `src/features/invitations/pages/PublicInvitationPage/PublicInvitationPage.tsx` — consumeri: `src/app/[locale]/(fullscreen)/invitation/[publicId]/page.tsx`

### Client boundaries

- `src/features/invitations/components/InvitationManagement/InvitationManagementActions.tsx` — consumeri: `src/app/[locale]/(dashboard)/dashboard/invitations/[invitationId]/page.tsx`
- `src/features/invitations/components/InvitationManagement/InvitationManagementNavigation.tsx` — consumeri: `src/app/[locale]/(dashboard)/dashboard/invitations/[invitationId]/layout.tsx`
- `src/features/invitations/components/InvitationManagement/InvitationPublishAction.tsx` — consumeri: `src/app/[locale]/(dashboard)/dashboard/invitations/[invitationId]/settings/page.tsx`, `src/features/invitations/components/InvitationManagement/InvitationManagementActions.tsx`
- `src/features/invitations/components/InvitationManagement/InvitationTemplateCatalog.tsx` — consumeri: `src/features/invitations/components/InvitationManagement/InvitationProjectTemplates.tsx`
- `src/features/invitations/components/InvitationProjectCard/CreateInvitationButton.tsx` — consumeri: `src/features/invitations/components/InvitationManagement/InvitationTemplateCatalog.tsx`
- `src/features/invitations/components/InvitationPublicMotion/InvitationPublicMotion.tsx` — consumeri: `src/features/invitations/pages/PublicInvitationPage/PublicInvitationPage.tsx`
- `src/features/invitations/editor/components/InvitationContentPanel/InvitationContentPanel.tsx` — consumeri: `src/features/invitations/editor/components/InvitationEditorView/InvitationEditorView.tsx`
- `src/features/invitations/editor/components/InvitationEditor/InvitationEditor.tsx` — consumeri: `src/features/invitations/editor/components/InvitationEditorView/InvitationEditorView.tsx`
- `src/features/invitations/editor/components/InvitationEditorView/InvitationEditorView.tsx` — consumeri: `src/app/[locale]/(standalone)/editor/invitation/[invitationId]/uredi/page.tsx`
- `src/features/invitations/editor/components/InvitationPageNavigator/InvitationPageNavigator.tsx` — consumeri: `src/features/invitations/editor/components/InvitationEditorView/InvitationEditorView.tsx`
- `src/features/invitations/editor/components/InvitationPagesPanel/InvitationPageRow.tsx` — consumeri: `src/features/invitations/editor/components/InvitationPagesPanel/InvitationPagesPanel.tsx`
- `src/features/invitations/editor/components/InvitationPagesPanel/InvitationPagesPanel.tsx` — consumeri: `src/features/invitations/editor/components/InvitationEditorView/InvitationEditorView.tsx`
- `src/features/invitations/editor/components/InvitationPhotosPanel/InvitationPhotosPanel.tsx` — consumeri: `src/features/invitations/editor/components/InvitationEditorView/InvitationEditorView.tsx`
- `src/features/invitations/editor/components/InvitationPhotosPanel/InvitationPhotoUpload.tsx` — consumeri: `src/features/invitations/editor/components/InvitationPhotosPanel/InvitationPhotosPanel.tsx`
- `src/features/invitations/editor/hooks/useInvitationEditor.ts` — consumeri: `src/features/invitations/editor/components/InvitationEditorView/InvitationEditorView.tsx`
## management

### Repositories — sve datoteke

| Datoteka | Lokalna operacija | Direktni consumeri |
|---|---|---|

### Actions

Nema zasebnih datoteka u ovoj kategoriji.

### Services

Nema zasebnih datoteka u ovoj kategoriji.

### Types

Nema zasebnih datoteka u ovoj kategoriji.

### Validation

Nema zasebnih datoteka u ovoj kategoriji.

### Utils

Nema zasebnih datoteka u ovoj kategoriji.

### Feature pages

Nema zasebnih datoteka u ovoj kategoriji.

### Client boundaries

- `src/features/management/components/ManagementDeleteDangerZone/ManagementDeleteDangerZone.tsx` — consumeri: nema statičkih importa
- `src/features/management/components/ManagementNameEdit/ManagementNameEdit.tsx` — consumeri: `src/features/digital-albums/components/album-management/DigitalAlbumManagementHeader/DigitalAlbumNameEdit/DigitalAlbumNameEdit.tsx`, `src/features/invitations/components/InvitationManagement/InvitationManagementNavigation.tsx`, `src/features/photo-walls/components/wall-management/PhotoWallManagementHeader/PhotoWallNameEdit/PhotoWallNameEdit.tsx`
- `src/features/management/components/ManagementPublicLinkCard/ManagementPublicLinkCardMobileToggle.tsx` — consumeri: `src/features/management/components/ManagementPublicLinkCard/ManagementPublicLinkCard.tsx`
- `src/features/management/components/ManagementPublicLinkCopy/ManagementPublicLinkCopy.tsx` — consumeri: `src/features/management/components/ManagementPublicLinkCard/ManagementPublicLinkCard.tsx`
- `src/features/management/components/ManagementStatusCard/ManagementStatusCardMobileToggle.tsx` — consumeri: `src/features/management/components/ManagementStatusCard/ManagementStatusCard.tsx`
## photo-upload

### Repositories — sve datoteke

| Datoteka | Lokalna operacija | Direktni consumeri |
|---|---|---|

### Actions

Nema zasebnih datoteka u ovoj kategoriji.

### Services

Nema zasebnih datoteka u ovoj kategoriji.

### Types

Nema zasebnih datoteka u ovoj kategoriji.

### Validation

Nema zasebnih datoteka u ovoj kategoriji.

### Utils

- `src/features/photo-upload/utils/createPhotoPreview.ts` — consumeri: `src/features/digital-albums/editor/hooks/useDigitalAlbumUpload.ts`, `src/features/photo-walls/components/photo-wall-experience/PhotoWallUpload/hooks/usePhotoWallUpload.ts`

### Feature pages

Nema zasebnih datoteka u ovoj kategoriji.

### Client boundaries

- `src/features/photo-upload/components/PhotoUploadComposer/PhotoUploadComposer.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumUpload/DigitalAlbumUpload.tsx`, `src/features/invitations/editor/components/InvitationPhotosPanel/InvitationPhotoUpload.tsx`, `src/features/photo-walls/components/photo-wall-experience/PhotoWallUpload/PhotoWallPhotoComposer/PhotoWallPhotoComposer.tsx`
- `src/features/photo-upload/components/PhotoUploadControls/PhotoUploadControls.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumUpload/DigitalAlbumUpload.tsx`, `src/features/photo-walls/components/photo-wall-experience/PhotoWallUpload/PhotoWallUpload.tsx`
- `src/features/photo-upload/components/PhotoUploadDialog/PhotoUploadDialog.tsx` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumAddPhotosDialog/DigitalAlbumAddPhotosDialog.tsx`
- `src/features/photo-upload/components/PhotoUploadSource/PhotoUploadSource.tsx` — consumeri: `src/features/editor/components/EditorPhotoLibrary/EditorPhotoSource.tsx`, `src/features/photo-walls/components/photo-wall-experience/PhotoWallUpload/PhotoWallUploadSource/PhotoWallUploadSource.tsx`
## photo-walls

### Repositories — sve datoteke

| Datoteka | Lokalna operacija | Direktni consumeri |
|---|---|---|
| src/features/photo-walls/repositories/materials/createPhotoWallMaterial.ts | insert { photo_wall_id: wall.id, type: config.materialType, name: draft.name, template_id: draft.templateId, variant_id: draft.variantId, content: draft.content, presentati; from "photo_wall_materials" | src/features/photo-walls/actions/materials/createPhotoWallMaterialAction.ts |
| src/features/photo-walls/repositories/materials/getPhotoWallMaterial.ts | from "photo_wall_materials" | src/app/[locale]/(standalone)/editor/material/[materialId]/uredi/page.tsx<br>src/features/photo-walls/repositories/materials/updatePhotoWallMaterial.ts |
| src/features/photo-walls/repositories/materials/getPhotoWallMaterials.ts | from "photo_wall_materials" | src/features/photo-walls/components/PhotoWallMaterials/PhotoWallMaterials.tsx |
| src/features/photo-walls/repositories/materials/requirePhotoWallMaterialOwner.ts | from "photo_walls"; from "projects" | src/features/photo-walls/repositories/materials/createPhotoWallMaterial.ts<br>src/features/photo-walls/repositories/materials/updatePhotoWallMaterial.ts |
| src/features/photo-walls/repositories/materials/updatePhotoWallMaterial.ts | update { name: draft.name, template_id: draft.templateId, variant_id: draft.variantId, content: draft.content, presentation: draft.presentation, updated_at: updatedAt, }; from "photo_wall_materials" | src/features/photo-walls/actions/materials/updatePhotoWallMaterialAction.ts |
| src/features/photo-walls/repositories/photo-wall/getPhotoWall.ts | from "photo_walls" | src/app/[locale]/(dashboard)/dashboard/photo-walls/[photoWallId]/layout.tsx<br>src/app/[locale]/(dashboard)/dashboard/photo-walls/[photoWallId]/materials/page.tsx<br>src/app/[locale]/(dashboard)/dashboard/photo-walls/[photoWallId]/page.tsx<br>src/app/[locale]/(dashboard)/dashboard/photo-walls/[photoWallId]/photos/page.tsx<br>src/app/[locale]/(dashboard)/dashboard/photo-walls/[photoWallId]/settings/page.tsx<br>src/app/[locale]/(standalone)/editor/material/[materialId]/uredi/page.tsx<br>src/features/photo-walls/repositories/photo-wall/getPhotoWallManagementPageData.ts |
| src/features/photo-walls/repositories/photo-wall/getPhotoWallManagementPageData.ts | from "projects" | src/features/photo-walls/pages/PhotoWallMaterialsPage/PhotoWallMaterialsPage.tsx<br>src/features/photo-walls/pages/PhotoWallOverviewPage/PhotoWallOverviewPage.tsx<br>src/features/photo-walls/pages/PhotoWallPhotosPage/PhotoWallPhotosPage.tsx<br>src/features/photo-walls/pages/PhotoWallSettingsPage/PhotoWallSettingsPage.tsx |
| src/features/photo-walls/repositories/photo-wall/getProjectPhotoWall.ts | from "photo_walls" | src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/photo-wall/materials/page.tsx<br>src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/photo-wall/page.tsx<br>src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/photo-wall/photos/page.tsx<br>src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/photo-wall/settings/page.tsx<br>src/app/[locale]/(standalone)/editor/album/[albumId]/uredi/page.tsx |
| src/features/photo-walls/repositories/photo-wall/getPublicPhotoWall.ts | rpc "get_public_photo_wall" | src/app/[locale]/(fullscreen)/photo-wall/[publicId]/page.tsx |
| src/features/photo-walls/repositories/photo-wall/publishPhotoWall.ts | rpc "publish_photo_wall" | src/features/photo-walls/actions/photos-wall/publishPhotoWallAction.ts |
| src/features/photo-walls/repositories/photo-wall/unpublishPhotoWall.ts | rpc "unpublish_photo_wall" | src/features/photo-walls/actions/photos-wall/unpublishPhotoWallAction.ts |
| src/features/photo-walls/repositories/photo-wall/updatePhotoWall.ts | rpc "update_photo_wall" | src/features/photo-walls/actions/photos-wall/updatePhotoWallAction.ts |
| src/features/photo-walls/repositories/photos/createPhotoWallPhoto.ts | from "photo_walls"; insert { project_id: photoWall.project_id, image_path: imagePath, file_size: fileSize, source_type: "; from "project_photos"; insert { photo_wall_id: photoWall.id, photo_id: projectPhoto.id, description: description, is_favorite: ; from "photo_wall_photos"; delete ; from "project_photos" | src/features/photo-walls/repositories/photos/uploadPhotoWallPhoto.ts |
| src/features/photo-walls/repositories/photos/deletePhotoWallPhoto.ts | from "project_photos"; rpc "remove_photo_wall_photo" | src/features/photo-walls/actions/photos/deletePhotoWallPhotoAction.ts |
| src/features/photo-walls/repositories/photos/getPhotoWallPhotosPage.ts | from "photo_wall_photos"; from "photo_wall_photos"; from "photo_wall_photos" | src/features/photo-walls/actions/photos/getPhotoWallPhotosPageAction.ts<br>src/features/photo-walls/components/photo-wall-management/PhotoWallManagement.tsx |
| src/features/photo-walls/repositories/photos/getPublicPhotoWallPhotos.ts | rpc "get_public_photo_wall_photos" | src/app/[locale]/(fullscreen)/photo-wall/[publicId]/page.tsx<br>src/features/photo-walls/actions/photos/loadPublicPhotoWallPhotosAction.ts |
| src/features/photo-walls/repositories/photos/setPhotoWallPhotoFavorite.ts | rpc "set_photo_wall_photo_favorite" | src/features/photo-walls/actions/photos/setPhotoWallPhotoFavoriteAction.ts |
| src/features/photo-walls/repositories/photos/uploadPhotoWallPhoto.ts | from "photo_walls" | src/features/photo-walls/actions/photos/uploadPhotoWallPhotoAction.ts |

### Actions

- `src/features/photo-walls/actions/materials/createPhotoWallMaterialAction.ts` — consumeri: `src/features/photo-walls/components/template-picker/PhotoWallMaterialTemplatePicker/PhotoWallMaterialTemplatePicker.tsx`
- `src/features/photo-walls/actions/materials/updatePhotoWallMaterialAction.ts` — consumeri: `src/features/photo-walls/editor/hooks/usePhotoWallMaterialEditor.ts`
- `src/features/photo-walls/actions/photos/deletePhotoWallPhotoAction.ts` — consumeri: `src/features/photo-walls/components/photo-wall-management/hooks/usePhotoWallPhotosManagement.ts`
- `src/features/photo-walls/actions/photos/getPhotoWallPhotosPageAction.ts` — consumeri: `src/features/digital-albums/editor/hooks/useDigitalAlbumPhotoPicker.ts`, `src/features/photo-walls/components/photo-wall-management/hooks/usePhotoWallPhotosManagement.ts`
- `src/features/photo-walls/actions/photos/loadPublicPhotoWallPhotosAction.ts` — consumeri: `src/features/photo-walls/components/photo-wall-experience/hooks/usePublicPhotoWallPhotos.ts`
- `src/features/photo-walls/actions/photos/setPhotoWallPhotoFavoriteAction.ts` — consumeri: `src/features/photo-walls/components/photo-wall-management/hooks/usePhotoWallPhotosManagement.ts`
- `src/features/photo-walls/actions/photos/updatePhotoWallPhotoDescriptionAction.ts` — consumeri: `src/features/photo-walls/components/photo-wall-management/hooks/usePhotoWallPhotosManagement.ts`
- `src/features/photo-walls/actions/photos/uploadPhotoWallPhotoAction.ts` — consumeri: `src/features/photo-walls/components/photo-wall-experience/PhotoWallUpload/hooks/usePhotoWallUpload.ts`
- `src/features/photo-walls/actions/photos-wall/publishPhotoWallAction.ts` — consumeri: `src/features/photo-walls/components/wall-management/PhotoWallStatusCard/PhotoWallStatusAction.tsx`
- `src/features/photo-walls/actions/photos-wall/unpublishPhotoWallAction.ts` — consumeri: `src/features/photo-walls/components/wall-management/PhotoWallStatusCard/PhotoWallStatusAction.tsx`
- `src/features/photo-walls/actions/photos-wall/updatePhotoWallAction.ts` — consumeri: `src/features/photo-walls/components/settings/PhotoWallSettingsAppearance/PhotoWallSettingsAppearance.tsx`, `src/features/photo-walls/components/wall-management/PhotoWallManagementHeader/PhotoWallNameEdit/PhotoWallNameEdit.tsx`

### Services

Nema zasebnih datoteka u ovoj kategoriji.

### Types

- `src/features/photo-walls/editor/types/photoWallMaterialEditor.types.ts` — consumeri: `src/features/photo-walls/editor/components/PhotoWallMaterialEditor/PhotoWallMaterialEditor.tsx`, `src/features/photo-walls/editor/components/PhotoWallMaterialEditorSidebar/PhotoWallMaterialEditorSidebar.tsx`, `src/features/photo-walls/editor/components/PhotoWallMaterialEditorView/PhotoWallMaterialEditorView.tsx`
- `src/features/photo-walls/types/photoWall.types.ts` — consumeri: `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/DigitalAlbumEditorSidebar.tsx`, `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumPhotosPanel/DigitalAlbumPhotosPanel.tsx`, `src/features/digital-albums/editor/components/DigitalAlbumEditorView/DigitalAlbumEditorView.tsx`, `src/features/photo-walls/actions/photos-wall/publishPhotoWallAction.ts`, `src/features/photo-walls/actions/photos-wall/unpublishPhotoWallAction.ts`, `src/features/photo-walls/actions/photos-wall/updatePhotoWallAction.ts`, `src/features/photo-walls/components/photo-wall-management/PhotoWallManagement.tsx`, `src/features/photo-walls/components/PhotoWallMaterials/PhotoWallMaterials.tsx`, `src/features/photo-walls/components/settings/PhotoWallColorPicker/PhotoWallColorPicker.tsx`, `src/features/photo-walls/components/settings/PhotoWallSettingsAppearance/PhotoWallSettingsAppearance.tsx`, `src/features/photo-walls/components/wall-management/PhotoWallManagementHeader/PhotoWallManagementHeader.tsx`, `src/features/photo-walls/components/wall-management/PhotoWallManagementHeader/PhotoWallNameEdit/PhotoWallNameEdit.tsx`, `src/features/photo-walls/components/wall-management/PhotoWallPublicLinkCard/PhotoWallPublicLinkCard.tsx`, `src/features/photo-walls/components/wall-management/PhotoWallStatusCard/PhotoWallStatusCard.tsx`, `src/features/photo-walls/repositories/photo-wall/getPhotoWall.ts`, `src/features/photo-walls/repositories/photo-wall/getProjectPhotoWall.ts`, `src/features/photo-walls/repositories/photo-wall/getPublicPhotoWall.ts`, `src/features/photo-walls/repositories/photo-wall/publishPhotoWall.ts`, `src/features/photo-walls/repositories/photo-wall/unpublishPhotoWall.ts`, `src/features/photo-walls/repositories/photo-wall/updatePhotoWall.ts`
- `src/features/photo-walls/types/photoWallMaterial.types.ts` — consumeri: `src/features/photo-walls/renderer/data/buildPhotoWallMaterialRenderData.ts`, `src/features/photo-walls/repositories/materials/getPhotoWallMaterial.ts`, `src/features/photo-walls/repositories/materials/getPhotoWallMaterials.ts`, `src/features/photo-walls/types/photoWallMaterialRenderer.types.ts`, `src/features/photo-walls/types/photoWallMaterialTemplateConfig.types.ts`
- `src/features/photo-walls/types/photoWallMaterialContent.types.ts` — consumeri: `src/features/photo-walls/content/createDefaultPhotoWallMaterialContent.ts`, `src/features/photo-walls/content/createInitialPhotoWallMaterialContent.ts`, `src/features/photo-walls/content/photoWallMaterialFields.ts`, `src/features/photo-walls/renderer/data/buildPhotoWallMaterialDisplay.ts`, `src/features/photo-walls/renderer/display/buildPhotoWallMaterialDateDisplay.ts`, `src/features/photo-walls/renderer/display/buildPhotoWallMaterialLocationDisplay.ts`, `src/features/photo-walls/renderer/display/buildPhotoWallMaterialTimeDisplay.ts`, `src/features/photo-walls/renderer/parsers/parsePhotoWallMaterialContent.ts`, `src/features/photo-walls/types/photoWallMaterialRenderer.types.ts`
- `src/features/photo-walls/types/photoWallMaterialPresentation.types.ts` — consumeri: `src/features/photo-walls/renderer/components/MaterialText.tsx`, `src/features/photo-walls/renderer/parsers/parsePhotoWallMaterialPresentation.ts`, `src/features/photo-walls/types/photoWallMaterialRenderer.types.ts`
- `src/features/photo-walls/types/photoWallMaterialRenderer.types.ts` — consumeri: `src/features/photo-walls/editor/components/PhotoWallMaterialEditorView/PhotoWallMaterialEditorView.tsx`, `src/features/photo-walls/renderer/data/buildPhotoWallMaterialRenderData.ts`, `src/features/photo-walls/renderer/display/buildPhotoWallMaterialDateDisplay.ts`, `src/features/photo-walls/renderer/display/buildPhotoWallMaterialLocationDisplay.ts`, `src/features/photo-walls/renderer/display/buildPhotoWallMaterialTimeDisplay.ts`, `src/features/photo-walls/renderer/PhotoWallMaterialRenderer.tsx`, `src/features/photo-walls/types/photoWallMaterialTemplate.types.ts`
- `src/features/photo-walls/types/photoWallMaterialTemplate.types.ts` — consumeri: `src/features/photo-walls/cards/registry/photoWallMaterialTemplateRegistry.ts`, `src/features/photo-walls/cards/templates/minimal/MinimalMaterialCard.tsx`, `src/features/photo-walls/cards/templates/wedding/garden-grace/photo-wall/GardenGraceMaterialCard.tsx`
- `src/features/photo-walls/types/photoWallMaterialTemplateConfig.types.ts` — consumeri: `src/features/photo-walls/cards/registry/photoWallMaterialTemplateConfigs.ts`, `src/features/photo-walls/cards/registry/photoWallMaterialTemplateRegistry.utils.ts`, `src/features/photo-walls/cards/templates/minimal/MinimalMaterialTemplateConfig.ts`, `src/features/photo-walls/cards/templates/wedding/garden-grace/photo-wall/GardenGraceMaterialTemplateConfig.ts`, `src/features/photo-walls/components/template-picker/PhotoWallMaterialTemplateCard/PhotoWallMaterialTemplateCard.tsx`, `src/features/photo-walls/types/photoWallMaterialTemplate.types.ts`
- `src/features/photo-walls/types/photoWallPhoto.types.ts` — consumeri: `src/features/digital-albums/editor/hooks/useDigitalAlbumPhotoPicker.ts`, `src/features/photo-walls/actions/photos/deletePhotoWallPhotoAction.ts`, `src/features/photo-walls/actions/photos/getPhotoWallPhotosPageAction.ts`, `src/features/photo-walls/actions/photos/loadPublicPhotoWallPhotosAction.ts`, `src/features/photo-walls/actions/photos/uploadPhotoWallPhotoAction.ts`, `src/features/photo-walls/components/photo-wall-experience/hooks/usePublicPhotoWallPhotos.ts`, `src/features/photo-walls/components/photo-wall-experience/PhotoWallExperience.tsx`, `src/features/photo-walls/components/photo-wall-experience/PhotoWallGallery/PhotoWallGallery.tsx`, `src/features/photo-walls/components/photo-wall-experience/PhotoWallHeroSlideshow/PhotoWallHeroSlideshow.tsx`, `src/features/photo-walls/components/photo-wall-experience/PhotoWallLightbox/photoFileActions.ts`, `src/features/photo-walls/components/photo-wall-experience/PhotoWallLightbox/PhotoWallLightbox.tsx`, `src/features/photo-walls/components/photo-wall-experience/PhotoWallLightbox/PhotoWallLightboxActions.tsx`, `src/features/photo-walls/components/photo-wall-experience/PhotoWallUpload/hooks/usePhotoWallUpload.ts`, `src/features/photo-walls/components/photo-wall-experience/PhotoWallUpload/PhotoWallUpload.tsx`, `src/features/photo-walls/components/photo-wall-experience/preview/previewPhotoWallPhotos.ts`, `src/features/photo-walls/components/photo-wall-management/hooks/usePhotoWallPhotosManagement.ts`, `src/features/photo-walls/components/photo-wall-management/PhotoWallPhotosManagement/PhotoWallPhotosManagement.tsx`, `src/features/photo-walls/components/photo-wall-management/PhotoWallPhotosManagementGallery/PhotoWallPhotosManagementGallery.tsx`, `src/features/photo-walls/renderer/data/buildPhotoWallGalleryPhotos.ts`, `src/features/photo-walls/renderer/data/buildPhotoWallGalleryPhotos.ts`, `src/features/photo-walls/repositories/photos/createPhotoWallPhoto.ts`, `src/features/photo-walls/repositories/photos/deletePhotoWallPhoto.ts`, `src/features/photo-walls/repositories/photos/getPhotoWallPhotosPage.ts`, `src/features/photo-walls/repositories/photos/getPublicPhotoWallPhotos.ts`, `src/features/photo-walls/repositories/photos/uploadPhotoWallPhoto.ts`

### Validation

- `src/features/photo-walls/validation/photoWall.schema.ts` — consumeri: `src/features/photo-walls/repositories/photos/getPhotoWallPhotosPage.ts`
- `src/features/photo-walls/validation/photoWallMaterial.schema.ts` — consumeri: `src/features/photo-walls/actions/materials/updatePhotoWallMaterialAction.ts`, `src/features/photo-walls/editor/components/PhotoWallMaterialEditorSidebar/PhotoWallMaterialEditorSidebar.tsx`, `src/features/photo-walls/editor/hooks/usePhotoWallMaterialEditor.ts`, `src/features/photo-walls/repositories/materials/createPhotoWallMaterial.ts`, `src/features/photo-walls/repositories/materials/updatePhotoWallMaterial.ts`

### Utils

- `src/features/photo-walls/utils/buildPublicPhotoWallUrl.ts` — consumeri: `src/features/photo-walls/components/PhotoWallMaterials/PhotoWallMaterials.tsx`, `src/features/photo-walls/renderer/data/buildPhotoWallMaterialRenderData.ts`
- `src/features/photo-walls/utils/getPhotoWallPublicPath.ts` — consumeri: `src/features/photo-walls/components/wall-management/PhotoWallManagementHeader/PhotoWallManagementHeader.tsx`, `src/features/photo-walls/components/wall-management/PhotoWallPublicLinkCard/PhotoWallPublicLinkCard.tsx`, `src/features/photo-walls/utils/buildPublicPhotoWallUrl.ts`

### Feature pages

- `src/features/photo-walls/pages/PhotoWallMaterialsPage/PhotoWallMaterialsPage.tsx` — consumeri: `src/app/[locale]/(dashboard)/dashboard/photo-walls/[photoWallId]/materials/page.tsx`
- `src/features/photo-walls/pages/PhotoWallOverviewPage/PhotoWallOverviewPage.tsx` — consumeri: `src/app/[locale]/(dashboard)/dashboard/photo-walls/[photoWallId]/page.tsx`
- `src/features/photo-walls/pages/PhotoWallPhotosPage/PhotoWallPhotosPage.tsx` — consumeri: `src/app/[locale]/(dashboard)/dashboard/photo-walls/[photoWallId]/photos/page.tsx`
- `src/features/photo-walls/pages/PhotoWallSettingsPage/PhotoWallSettingsPage.tsx` — consumeri: `src/app/[locale]/(dashboard)/dashboard/photo-walls/[photoWallId]/settings/page.tsx`

### Client boundaries

- `src/features/photo-walls/cards/components/PhotoWallMaterialQrCode/PhotoWallMaterialQrCode.tsx` — consumeri: `src/features/photo-walls/cards/templates/minimal/MinimalMaterialCard.tsx`, `src/features/photo-walls/cards/templates/wedding/garden-grace/photo-wall/GardenGraceMaterialCard.tsx`
- `src/features/photo-walls/components/photo-wall-experience/hooks/usePublicPhotoWallPhotos.ts` — consumeri: `src/features/photo-walls/components/photo-wall-experience/PhotoWallExperience.tsx`
- `src/features/photo-walls/components/photo-wall-experience/PhotoWallDialog/PhotoWallDialog.tsx` — consumeri: `src/features/photo-walls/components/photo-wall-experience/PhotoWallUpload/PhotoWallUpload.tsx`
- `src/features/photo-walls/components/photo-wall-experience/PhotoWallExperience.tsx` — consumeri: `src/app/[locale]/(fullscreen)/photo-wall/[publicId]/page.tsx`
- `src/features/photo-walls/components/photo-wall-experience/PhotoWallGallery/PhotoWallGallery.tsx` — consumeri: `src/features/photo-walls/components/photo-wall-experience/PhotoWallExperience.tsx`
- `src/features/photo-walls/components/photo-wall-experience/PhotoWallHeroSlideshow/PhotoWallHeroSlideshow.tsx` — consumeri: `src/features/photo-walls/components/photo-wall-experience/PhotoWallExperience.tsx`
- `src/features/photo-walls/components/photo-wall-experience/PhotoWallLightbox/PhotoWallLightbox.tsx` — consumeri: `src/features/photo-walls/components/photo-wall-experience/PhotoWallExperience.tsx`, `src/features/photo-walls/components/photo-wall-management/PhotoWallPhotosManagementGallery/PhotoWallPhotosManagementGallery.tsx`
- `src/features/photo-walls/components/photo-wall-experience/PhotoWallLightbox/PhotoWallLightboxActions.tsx` — consumeri: `src/features/photo-walls/components/photo-wall-experience/PhotoWallLightbox/PhotoWallLightbox.tsx`
- `src/features/photo-walls/components/photo-wall-experience/PhotoWallUpload/hooks/usePhotoWallUpload.ts` — consumeri: `src/features/photo-walls/components/photo-wall-experience/PhotoWallUpload/PhotoWallUpload.tsx`
- `src/features/photo-walls/components/photo-wall-experience/PhotoWallUpload/PhotoWallPhotoComposer/PhotoWallPhotoComposer.tsx` — consumeri: `src/features/photo-walls/components/photo-wall-experience/PhotoWallUpload/PhotoWallUpload.tsx`
- `src/features/photo-walls/components/photo-wall-experience/PhotoWallUpload/PhotoWallUpload.tsx` — consumeri: `src/features/photo-walls/components/photo-wall-experience/PhotoWallExperience.tsx`
- `src/features/photo-walls/components/photo-wall-experience/PhotoWallUpload/PhotoWallUploadSource/PhotoWallUploadSource.tsx` — consumeri: `src/features/photo-walls/components/photo-wall-experience/PhotoWallUpload/PhotoWallUpload.tsx`
- `src/features/photo-walls/components/photo-wall-management/PhotoWallPhotoManagementActions/PhotoWallPhotoManagementActions.tsx` — consumeri: `src/features/photo-walls/components/photo-wall-management/PhotoWallPhotosManagementGallery/PhotoWallPhotosManagementGallery.tsx`
- `src/features/photo-walls/components/photo-wall-management/PhotoWallPhotosManagementGallery/PhotoWallPhotosManagementGallery.tsx` — consumeri: `src/features/photo-walls/components/photo-wall-management/PhotoWallPhotosManagement/PhotoWallPhotosManagement.tsx`
- `src/features/photo-walls/components/settings/PhotoWallColorPicker/PhotoWallColorPicker.tsx` — consumeri: `src/features/photo-walls/components/settings/PhotoWallSettingsAppearance/PhotoWallSettingsAppearance.tsx`
- `src/features/photo-walls/components/settings/PhotoWallSettingsAppearance/PhotoWallSettingsAppearance.tsx` — consumeri: `src/features/photo-walls/pages/PhotoWallSettingsPage/PhotoWallSettingsPage.tsx`
- `src/features/photo-walls/components/template-picker/PhotoWallMaterialTemplateCard/PhotoWallMaterialTemplateCard.tsx` — consumeri: `src/features/photo-walls/components/template-picker/PhotoWallMaterialTemplateGrid/PhotoWallMaterialTemplateGrid.tsx`
- `src/features/photo-walls/components/template-picker/PhotoWallMaterialTemplatePicker/PhotoWallMaterialTemplatePicker.tsx` — consumeri: `src/features/photo-walls/components/PhotoWallMaterials/PhotoWallMaterials.tsx`
- `src/features/photo-walls/components/template-picker/PhotoWallMaterialThumbnail/PhotoWallMaterialThumbnail.tsx` — consumeri: `src/features/photo-walls/components/PhotoWallMaterials/PhotoWallMaterials.tsx`, `src/features/photo-walls/components/template-picker/PhotoWallMaterialTemplateCard/PhotoWallMaterialTemplateCard.tsx`, `src/features/photo-walls/editor/components/PhotoWallMaterialEditorSidebar/PhotoWallMaterialEditorSidebar.tsx`
- `src/features/photo-walls/components/wall-management/PhotoWallManagementHeader/PhotoWallNameEdit/PhotoWallNameEdit.tsx` — consumeri: `src/features/photo-walls/components/wall-management/PhotoWallManagementHeader/PhotoWallManagementHeader.tsx`
- `src/features/photo-walls/components/wall-management/PhotoWallStatusCard/PhotoWallStatusAction.tsx` — consumeri: `src/features/photo-walls/components/wall-management/PhotoWallStatusCard/PhotoWallStatusCard.tsx`
- `src/features/photo-walls/editor/components/PhotoWallMaterialEditor/PhotoWallMaterialEditor.tsx` — consumeri: `src/features/photo-walls/editor/components/PhotoWallMaterialEditorView/PhotoWallMaterialEditorView.tsx`
- `src/features/photo-walls/editor/components/PhotoWallMaterialEditorHeader/PhotoWallMaterialEditorHeader.tsx` — consumeri: `src/features/photo-walls/editor/components/PhotoWallMaterialEditorView/PhotoWallMaterialEditorView.tsx`
- `src/features/photo-walls/editor/components/PhotoWallMaterialEditorSidebar/PhotoWallMaterialEditorSidebar.tsx` — consumeri: `src/features/photo-walls/editor/components/PhotoWallMaterialEditorView/PhotoWallMaterialEditorView.tsx`
- `src/features/photo-walls/editor/components/PhotoWallMaterialEditorView/PhotoWallMaterialEditorView.tsx` — consumeri: `src/app/[locale]/(standalone)/editor/material/[materialId]/uredi/page.tsx`
- `src/features/photo-walls/editor/hooks/usePhotoWallMaterialEditor.ts` — consumeri: `src/features/photo-walls/editor/components/PhotoWallMaterialEditorView/PhotoWallMaterialEditorView.tsx`
## profile

### Repositories — sve datoteke

| Datoteka | Lokalna operacija | Direktni consumeri |
|---|---|---|
| src/features/profile/repositories/getProfile.ts | from "profiles" | src/features/auth/context/AuthProvider.tsx |

### Actions

Nema zasebnih datoteka u ovoj kategoriji.

### Services

Nema zasebnih datoteka u ovoj kategoriji.

### Types

- `src/features/profile/types/profile.types.ts` — consumeri: `src/features/auth/context/AuthContext.tsx`, `src/features/auth/context/AuthProvider.tsx`, `src/features/profile/repositories/getProfile.ts`

### Validation

Nema zasebnih datoteka u ovoj kategoriji.

### Utils

Nema zasebnih datoteka u ovoj kategoriji.

### Feature pages

Nema zasebnih datoteka u ovoj kategoriji.

### Client boundaries

Nema zasebnih datoteka u ovoj kategoriji.
## project-collaboration

### Repositories — sve datoteke

| Datoteka | Lokalna operacija | Direktni consumeri |
|---|---|---|
| src/features/project-collaboration/repositories/acceptProjectCollaborationInvite.ts | rpc "accept_project_collaboration_invite" | src/features/project-collaboration/actions/acceptProjectCollaborationAction.ts<br>src/features/project-collaboration/actions/collaborationUiActions.ts |
| src/features/project-collaboration/repositories/cancelProjectCollaborationInvite.ts | rpc "cancel_project_collaboration_invite" | src/features/project-collaboration/actions/cancelProjectCollaborationAction.ts |
| src/features/project-collaboration/repositories/declineProjectCollaborationInvite.ts | rpc "decline_project_collaboration_invite" | src/features/project-collaboration/actions/collaborationUiActions.ts<br>src/features/project-collaboration/actions/declineProjectCollaborationAction.ts |
| src/features/project-collaboration/repositories/getProjectCollaborationInvites.ts | from "project_collaboration_invites" | src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/collaborators/page.tsx |
| src/features/project-collaboration/repositories/getProjectCollaborators.ts | rpc "get_project_collaborators" | src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/collaborators/page.tsx |
| src/features/project-collaboration/repositories/getReceivedCollaborationInvites.ts | from "project_collaboration_invites" | src/features/dashboard/components/DashboardInvites/DashboardInvites.tsx |
| src/features/project-collaboration/repositories/inviteProjectCollaborator.ts | rpc "invite_project_collaborator" | src/features/project-collaboration/actions/collaborationUiActions.ts<br>src/features/project-collaboration/actions/inviteProjectCollaboratorAction.ts |
| src/features/project-collaboration/repositories/removeProjectCollaborator.ts | rpc "remove_project_collaborator" | src/features/project-collaboration/actions/removeProjectCollaboratorAction.ts |

### Actions

- `src/features/project-collaboration/actions/acceptProjectCollaborationAction.ts` — consumeri: nema statičkih importa
- `src/features/project-collaboration/actions/cancelProjectCollaborationAction.ts` — consumeri: nema statičkih importa
- `src/features/project-collaboration/actions/collaborationUiActions.ts` — consumeri: `src/features/project-collaboration/components/CollaborationInviteResponse.tsx`, `src/features/project-collaboration/components/CollaborationLinkForm.tsx`
- `src/features/project-collaboration/actions/declineProjectCollaborationAction.ts` — consumeri: nema statičkih importa
- `src/features/project-collaboration/actions/inviteProjectCollaboratorAction.ts` — consumeri: nema statičkih importa
- `src/features/project-collaboration/actions/removeProjectCollaboratorAction.ts` — consumeri: nema statičkih importa

### Services

Nema zasebnih datoteka u ovoj kategoriji.

### Types

- `src/features/project-collaboration/types/projectCollaboration.types.ts` — consumeri: `src/features/project-collaboration/actions/acceptProjectCollaborationAction.ts`, `src/features/project-collaboration/actions/cancelProjectCollaborationAction.ts`, `src/features/project-collaboration/actions/declineProjectCollaborationAction.ts`, `src/features/project-collaboration/actions/inviteProjectCollaboratorAction.ts`, `src/features/project-collaboration/actions/removeProjectCollaboratorAction.ts`, `src/features/project-collaboration/repositories/acceptProjectCollaborationInvite.ts`, `src/features/project-collaboration/repositories/cancelProjectCollaborationInvite.ts`, `src/features/project-collaboration/repositories/declineProjectCollaborationInvite.ts`, `src/features/project-collaboration/repositories/getProjectCollaborationInvites.ts`, `src/features/project-collaboration/repositories/getProjectCollaborators.ts`, `src/features/project-collaboration/repositories/inviteProjectCollaborator.ts`, `src/features/project-collaboration/repositories/removeProjectCollaborator.ts`

### Validation

- `src/features/project-collaboration/validation/projectCollaboration.schema.ts` — consumeri: nema statičkih importa

### Utils

Nema zasebnih datoteka u ovoj kategoriji.

### Feature pages

Nema zasebnih datoteka u ovoj kategoriji.

### Client boundaries

- `src/features/project-collaboration/components/CollaborationInviteResponse.tsx` — consumeri: `src/app/[locale]/(dashboard)/dashboard/poziv/page.tsx`, `src/app/[locale]/(standalone)/suradnja/poziv/page.tsx`
- `src/features/project-collaboration/components/CollaborationLinkForm.tsx` — consumeri: `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/collaborators/page.tsx`
## project-photos

### Repositories — sve datoteke

| Datoteka | Lokalna operacija | Direktni consumeri |
|---|---|---|

### Actions

Nema zasebnih datoteka u ovoj kategoriji.

### Services

- `src/features/project-photos/services/deleteEmptyDigitalAlbumPhotoDirectory.ts` — consumeri: `src/features/digital-albums/repositories/photos/removeDigitalAlbumPhoto.ts`, `src/features/digital-albums/services/deleteDigitalAlbumWithStorage.ts`; server-only: true
- `src/features/project-photos/services/deleteEmptyInvitationPhotoDirectory.ts` — consumeri: `src/features/invitations/repositories/invitation/manageInvitation.ts`, `src/features/invitations/repositories/photos/removeInvitationPhoto.ts`; server-only: true
- `src/features/project-photos/services/deleteEmptyPhotoWallPhotoDirectory.ts` — consumeri: `src/features/photo-walls/repositories/photos/deletePhotoWallPhoto.ts`; server-only: true
- `src/features/project-photos/services/deleteOrphanProjectPhoto.ts` — consumeri: `src/features/digital-albums/repositories/photos/removeDigitalAlbumPhoto.ts`, `src/features/digital-albums/services/deleteDigitalAlbumWithStorage.ts`, `src/features/invitations/repositories/photos/removeInvitationPhoto.ts`, `src/features/photo-walls/repositories/photos/deletePhotoWallPhoto.ts`; server-only: true

### Types

- `src/features/project-photos/types/projectPhoto.types.ts` — consumeri: `src/features/digital-albums/actions/photos/getDigitalAlbumProjectPhotosAction.ts`, `src/features/digital-albums/types/digitalAlbumPhoto.types.ts`, `src/features/projects/services/deleteProjectWithStorage.ts`

### Validation

Nema zasebnih datoteka u ovoj kategoriji.

### Utils

- `src/features/project-photos/utils/getProjectPhotoUrl.ts` — consumeri: `src/features/digital-albums/components/album-renderer/utils/getDigitalAlbumPhotoUrl.ts`, `src/features/digital-albums/editor/components/DigitalAlbumAddPhotosDialog/DigitalAlbumAddPhotosDialog.tsx`, `src/features/digital-albums/editor/components/DigitalAlbumEditorSidebar/panels/DigitalAlbumPhotosPanel/DigitalAlbumPhotosPanel.tsx`, `src/features/digital-albums/editor/components/DigitalAlbumEditorView/DigitalAlbumEditorView.tsx`, `src/features/invitations/components/invitation-renderer/InvitationPhotos.tsx`, `src/features/invitations/editor/components/InvitationEditorView/InvitationEditorView.tsx`, `src/features/invitations/editor/components/InvitationPhotosPanel/InvitationPhotosPanel.tsx`, `src/features/photo-walls/renderer/data/buildPhotoWallGalleryPhotos.ts`

### Feature pages

Nema zasebnih datoteka u ovoj kategoriji.

### Client boundaries

Nema zasebnih datoteka u ovoj kategoriji.
## projects

### Repositories — sve datoteke

| Datoteka | Lokalna operacija | Direktni consumeri |
|---|---|---|
| src/features/projects/repositories/createProject.ts | rpc "create_project" | src/features/projects/actions/createProjectAction.ts |
| src/features/projects/repositories/deleteProject.ts | rpc "delete_project" | src/features/projects/services/deleteProjectWithStorage.ts |
| src/features/projects/repositories/getProject.ts | from "projects" | src/app/[locale]/(dashboard)/dashboard/invitations/[invitationId]/page.tsx<br>src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/albums/page.tsx<br>src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/collaborators/page.tsx<br>src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/event/page.tsx<br>src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/invitations/page.tsx<br>src/features/invitations/components/InvitationManagement/InvitationProjectTemplates.tsx<br>src/features/photo-walls/repositories/materials/createPhotoWallMaterial.ts<br>src/features/project-collaboration/actions/collaborationUiActions.ts<br>src/features/projects/components/ProjectProductContext/ProjectProductContext.tsx<br>src/features/projects/pages/ProjectWorkspacePage/ProjectWorkspacePage.tsx<br>src/features/projects/repositories/requireProjectOwner.ts |
| src/features/projects/repositories/getProjects.ts | from "projects" | src/app/[locale]/(dashboard)/dashboard/projects/page.tsx<br>src/features/dashboard/pages/DashboardOverviewPage/DashboardOverviewPage.tsx |
| src/features/projects/repositories/requireProjectOwner.ts | Delegacija / auth / mapiranje (vidi izvor) | src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/settings/page.tsx<br>src/features/digital-albums/actions/photos/getDigitalAlbumProjectPhotosAction.ts<br>src/features/digital-albums/services/createInitializedDigitalAlbum.ts<br>src/features/photo-walls/actions/photos/updatePhotoWallPhotoDescriptionAction.ts<br>src/features/projects/services/deleteProjectWithStorage.ts |
| src/features/projects/repositories/updateProject.ts | rpc "update_project" | src/features/projects/actions/updateProjectAction.ts |

### Actions

- `src/features/projects/actions/createAlbumEntryAction.ts` — consumeri: `src/features/projects/components/CreateAlbumForm/CreateAlbumForm.tsx`
- `src/features/projects/actions/createProjectAction.ts` — consumeri: `src/features/projects/pages/CreateProjectEventPage/CreateProjectEventPage.tsx`
- `src/features/projects/actions/deleteProjectAction.ts` — consumeri: `src/features/projects/components/ProjectSettings/ProjectSettings.tsx`
- `src/features/projects/actions/updateProjectAction.ts` — consumeri: `src/features/projects/pages/EditProjectEventPage/EditProjectEventPage.tsx`

### Services

- `src/features/projects/services/deleteProjectWithStorage.ts` — consumeri: `src/features/projects/actions/deleteProjectAction.ts`; server-only: true

### Types

- `src/features/projects/types/project.types.ts` — consumeri: `src/features/dashboard/components/DashboardProjects/DashboardProjects.tsx`, `src/features/photo-walls/content/createInitialPhotoWallMaterialContent.ts`, `src/features/projects/actions/createProjectAction.ts`, `src/features/projects/actions/deleteProjectAction.ts`, `src/features/projects/actions/updateProjectAction.ts`, `src/features/projects/components/ProjectEventForm/ProjectEventForm.tsx`, `src/features/projects/components/ProjectHeader/ProjectHeader.tsx`, `src/features/projects/hooks/useProjectEventForm.ts`, `src/features/projects/pages/EditProjectEventPage/EditProjectEventPage.tsx`, `src/features/projects/repositories/createProject.ts`, `src/features/projects/repositories/deleteProject.ts`, `src/features/projects/repositories/getProject.ts`, `src/features/projects/repositories/getProjects.ts`, `src/features/projects/repositories/requireProjectOwner.ts`, `src/features/projects/repositories/updateProject.ts`, `src/features/projects/utils/projectEventForm.utils.ts`
- `src/features/projects/types/projectEvent.types.ts` — consumeri: `src/features/invitations/components/InvitationManagement/InvitationProjectTemplates.tsx`, `src/features/invitations/components/InvitationManagement/InvitationTemplateCatalog.tsx`, `src/features/invitations/repositories/templates/getInvitationTemplates.ts`, `src/features/invitations/types/invitationTemplate.types.ts`, `src/features/invitations/utils/invitationTemplateFilter.ts`, `src/features/projects/components/ProjectEventForm/ProjectEventBasicInformationSection/ProjectEventBasicInformationSection.tsx`, `src/features/projects/types/project.types.ts`, `src/features/projects/utils/projectEventForm.utils.ts`, `src/features/projects/validation/projectEvent.schema.ts`

### Validation

- `src/features/projects/validation/projectEvent.schema.ts` — consumeri: `src/features/projects/components/ProjectEventForm/ProjectEventBasicInformationSection/ProjectEventBasicInformationSection.tsx`, `src/features/projects/components/ProjectEventForm/ProjectEventForm.tsx`, `src/features/projects/components/ProjectEventForm/ProjectEventScheduleSection/ProjectEventScheduleSection.tsx`, `src/features/projects/hooks/useProjectEventForm.ts`, `src/features/projects/pages/CreateProjectEventPage/CreateProjectEventPage.tsx`, `src/features/projects/pages/EditProjectEventPage/EditProjectEventPage.tsx`, `src/features/projects/utils/projectEventForm.utils.ts`

### Utils

- `src/features/projects/utils/projectEventDisplay.utils.ts` — consumeri: `src/app/[locale]/(fullscreen)/photo-wall/[publicId]/page.tsx`, `src/features/dashboard/components/DashboardProjects/DashboardProjects.tsx`, `src/features/projects/components/ProjectHeader/ProjectHeader.tsx`
- `src/features/projects/utils/projectEventForm.utils.ts` — consumeri: `src/features/projects/hooks/useProjectEventForm.ts`, `src/features/projects/pages/CreateProjectEventPage/CreateProjectEventPage.tsx`, `src/features/projects/pages/EditProjectEventPage/EditProjectEventPage.tsx`

### Feature pages

- `src/features/projects/pages/CreateProjectEventPage/CreateProjectEventPage.tsx` — consumeri: `src/app/[locale]/(dashboard)/dashboard/projects/new/event/page.tsx`
- `src/features/projects/pages/EditProjectEventPage/EditProjectEventPage.tsx` — consumeri: `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/event/page.tsx`
- `src/features/projects/pages/ProjectWorkspacePage/ProjectWorkspacePage.tsx` — consumeri: `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/albums/page.tsx`, `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/invitations/page.tsx`, `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/invitations/templates/page.tsx`, `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/photo-wall/page.tsx`, `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/seating/page.tsx`

### Client boundaries

- `src/features/projects/components/CreateAlbumDialog/CreateAlbumDialog.tsx` — consumeri: `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/albums/page.tsx`
- `src/features/projects/components/CreateAlbumForm/CreateAlbumForm.tsx` — consumeri: `src/features/projects/components/CreateAlbumDialog/CreateAlbumDialog.tsx`
- `src/features/projects/components/ProjectEventForm/ProjectEventBasicInformationSection/ProjectEventBasicInformationSection.tsx` — consumeri: `src/features/projects/components/ProjectEventForm/ProjectEventForm.tsx`
- `src/features/projects/components/ProjectEventForm/ProjectEventForm.tsx` — consumeri: `src/features/projects/pages/CreateProjectEventPage/CreateProjectEventPage.tsx`, `src/features/projects/pages/EditProjectEventPage/EditProjectEventPage.tsx`
- `src/features/projects/components/ProjectEventForm/ProjectEventScheduleSection/ProjectEventScheduleSection.tsx` — consumeri: `src/features/projects/components/ProjectEventForm/ProjectEventForm.tsx`
- `src/features/projects/components/ProjectSettings/ProjectSettings.tsx` — consumeri: `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/settings/page.tsx`
- `src/features/projects/hooks/useProjectEventForm.ts` — consumeri: `src/features/projects/components/ProjectEventForm/ProjectEventForm.tsx`
- `src/features/projects/pages/CreateProjectEventPage/CreateProjectEventPage.tsx` — consumeri: `src/app/[locale]/(dashboard)/dashboard/projects/new/event/page.tsx`
- `src/features/projects/pages/EditProjectEventPage/EditProjectEventPage.tsx` — consumeri: `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/event/page.tsx`

## App entrypoints i lokalni DB pozivi

- `src/app/api/digital-albums/[albumId]/pdf/route.ts` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/layout.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/loading.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/not-found.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(auth)/layout.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(auth)/prijava/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(auth)/registracija/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/albums/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/albums/[albumId]/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/invitations/[invitationId]/guests/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/invitations/[invitationId]/layout.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/invitations/[invitationId]/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/invitations/[invitationId]/settings/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/invitations/[invitationId]/templates/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/photo-walls/[photoWallId]/layout.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/photo-walls/[photoWallId]/materials/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/photo-walls/[photoWallId]/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/photo-walls/[photoWallId]/photos/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/photo-walls/[photoWallId]/settings/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/poziv/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/projects/new/event/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/projects/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/albums/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/albums/[albumId]/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/collaborators/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/event/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/invitation/guests/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/invitation/layout.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/invitation/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/invitation/settings/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/invitation/templates/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/invitations/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/invitations/templates/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/photo-wall/layout.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/photo-wall/materials/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/photo-wall/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/photo-wall/photos/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/photo-wall/settings/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/seating/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/dashboard/projects/[projectId]/settings/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(dashboard)/layout.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(fullscreen)/album/[publicId]/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(fullscreen)/invitation/[publicId]/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(fullscreen)/photo-wall/[publicId]/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(public)/layout.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(public)/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(standalone)/editor/album/[albumId]/uredi/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(standalone)/editor/invitation/[invitationId]/uredi/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(standalone)/editor/material/[materialId]/uredi/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(standalone)/internal/digital-albums/[albumId]/render/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(standalone)/suradnja/poziv/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(templates)/layout.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(templates)/templates/album/[theme]/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/(templates)/templates/material/[templateId]/[variantId]/page.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
- `src/app/[locale]/layout.tsx` — bez use client; nema lokalnih from/rpc/mutation poziva
