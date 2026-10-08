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
    seating,
    invitationGuests,
    profile,
    common,
    footer,
    auth,
    navigation,
    dashboard,
    projects,
    invitations,
    digitalAlbums,
    digitalAlbumEditor,
    photoWalls,
    photoWallsManagement,
    photoWallMaterialContent,
    photoWallMaterialTemplates,
  ] =
    await Promise.all([
      import(`../messages/${locale}/seating.json`),
      import(`../messages/${locale}/invitation-guests.json`),
      import(`../messages/${locale}/profile.json`),
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

      import(`../messages/${locale}/projects.json`),
      import(`../messages/${locale}/invitations.json`),

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
    Seating: seating.default,
    InvitationGuests: invitationGuests.default,
    Profile: profile.default,
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

    Projects: projects.default,
    Invitations: invitations.default,

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
