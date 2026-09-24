export type DigitalAlbumPageLayout =
  | "cover"
  | "full-photo"
  | "two-photos"
  | "editorial"
  | "story"
  | "collage"
  | "portrait-plate"
  | "landscape-plate"
  | "portrait-diptych"
  | "mixed-pair"
  | "hero-detail"
  | "quote"
  | "closing";


export type DigitalAlbumTheme =
  "classic";


export interface DigitalAlbumPhotoSlot {
  id:
    string;

  photoId:
    string | null;

  /**
   * Normalized CSS object-position,
   * not a source crop rectangle.
   */
  position?: {
    x:
      number;

    y:
      number;
  };

  fit?:
    | "cover"
    | "contain";

  /**
   * Undefined inherits description;
   * empty string explicitly hides it.
   */
  caption?:
    string;
}


export interface DigitalAlbumPageContent {
  title?:
    string;

  subtitle?:
    string;

  text?:
    string;

  date?:
    string;
}


export interface DigitalAlbumDocumentPage {
  id:
    string;

  layout:
    DigitalAlbumPageLayout;

  /**
   * Missing means legacy.
   * Upgrades are explicit.
   */
  layoutVersion?:
    1 | 2;

  photos:
    DigitalAlbumPhotoSlot[];

  unplacedPhotos?:
    DigitalAlbumPhotoSlot[];

  content:
    DigitalAlbumPageContent;
}


export interface DigitalAlbumDocument {
  theme:
    DigitalAlbumTheme;

  pages:
    DigitalAlbumDocumentPage[];
}