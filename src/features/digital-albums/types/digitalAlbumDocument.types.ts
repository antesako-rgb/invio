import type { EditorPhotoFramingValue } from "@/features/editor/types/editorPhotoFraming.types";
import type { AlbumThemeId } from "../config/digitalAlbumThemes";

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
  | "closing"
  | "split"
  | "three-grid"
  | "four-grid"
  | "hero-text"
  | "portrait-pair-text"
  | "mosaic";


export type DigitalAlbumTheme = AlbumThemeId;


export interface DigitalAlbumPhotoSlot extends EditorPhotoFramingValue {
  id:
    string;

  photoId:
    string | null;

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