/* ==========================================================================
   Photo Wall Material Font Style
========================================================================== */

export type PhotoWallMaterialFontStyle =
  | "normal"
  | "italic";


/* ==========================================================================
   Photo Wall Material Text Align
========================================================================== */

export type PhotoWallMaterialTextAlign =
  | "left"
  | "center"
  | "right";


/* ==========================================================================
   Photo Wall Material Element Presentation
========================================================================== */

export interface PhotoWallMaterialElementPresentation {
  font_family?:
    string;

  font_scale?:
    number;

  color?:
    string;

  font_style?:
    PhotoWallMaterialFontStyle;

  font_weight?:
    number;

  text_align?:
    PhotoWallMaterialTextAlign;
}


/* ==========================================================================
   Photo Wall Material Background Presentation
========================================================================== */

export interface PhotoWallMaterialBackgroundPresentation {
  color?:
    string;

  image_url?:
    string | null;

  opacity?:
    number;
}


/* ==========================================================================
   Photo Wall Material Layout Presentation
========================================================================== */

export interface PhotoWallMaterialLayoutPresentation {
  background?:
    PhotoWallMaterialBackgroundPresentation;
}


/* ==========================================================================
   Photo Wall Material Presentation
========================================================================== */

export interface PhotoWallMaterialPresentation {
  layout?:
    PhotoWallMaterialLayoutPresentation;

  elements?:
    Record<
      string,
      PhotoWallMaterialElementPresentation
    >;
}