import type {
  Locale,
} from "./config";


/* ==========================================================================
   Load Messages
========================================================================== */

export async function loadMessages(
  locale: Locale
) {
  const [
    common,
    footer,
    auth,
    navigation,
    dashboard,
    events,
    digitalAlbums,
    digitalAlbumEditor,
    photoWalls,
    photoWallsManagement,
    photoWallMaterialContent,
    photoWallMaterialTemplates,
  ] =
    await Promise.all([
      import(
        `../messages/${locale}/common.json`
      ),

      import(
        `../messages/${locale}/footer.json`
      ),

      import(
        `../messages/${locale}/auth.json`
      ),

      import(
        `../messages/${locale}/navigation.json`
      ),

      import(
        `../messages/${locale}/dashboard.json`
      ),

      import(
        `../messages/${locale}/events.json`
      ),

      import(
        `../messages/${locale}/digital-albums.json`
      ),

      import(
        `../messages/${locale}/digital-album-editor.json`
      ),

      import(
        `../messages/${locale}/photo-wall-materials.json`
      ),

      import(
        `../messages/${locale}/photo-wall-materials-management.json`
      ),

      import(
        `../messages/${locale}/photo-wall-material-content.json`
      ),

      import(
        `../messages/${locale}/photo-wall-material-templates.json`
      ),
    ]);

  return {
    Common:
      common.default,

    Footer:
      footer.default,

    Auth:
      auth.default,

    Navigation:
      navigation.default,

    Dashboard:
      dashboard.default,

    Events:
      events.default,

    DigitalAlbums:
      digitalAlbums.default,

    DigitalAlbumEditor:
      digitalAlbumEditor.default,

    PhotoWalls: {
      ...photoWalls.default,

      ...photoWallsManagement.default
        .PhotoWalls,
    },

    PhotoWallMaterialContent:
      photoWallMaterialContent.default,

    PhotoWallMaterialTemplates:
      photoWallMaterialTemplates.default
        .PhotoWallMaterialTemplates,
  };
}