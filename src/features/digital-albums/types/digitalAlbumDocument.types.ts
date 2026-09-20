/* ==========================================================================
   Page Layout
========================================================================== */

export type DigitalAlbumPageLayout =
  | "full-photo";


/* ==========================================================================
   Theme
========================================================================== */

export type DigitalAlbumTheme =
  | "classic";


/* ==========================================================================
   Photo Slot
========================================================================== */

export interface DigitalAlbumPhotoSlot {
  id:
    string;

  photoId:
    string | null;
}


/* ==========================================================================
   Page Content
========================================================================== */

export interface DigitalAlbumPageContent {
  title?:
    string;

  subtitle?:
    string;

  text?:
    string;
}


/* ==========================================================================
   Page
========================================================================== */

export interface DigitalAlbumDocumentPage {
  id:
    string;

  layout:
    DigitalAlbumPageLayout;

  photos:
    DigitalAlbumPhotoSlot[];

  content:
    DigitalAlbumPageContent;
}


/* ==========================================================================
   Document
========================================================================== */

export interface DigitalAlbumDocument {
  theme:
    DigitalAlbumTheme;

  pages:
    DigitalAlbumDocumentPage[];
}