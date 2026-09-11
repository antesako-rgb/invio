/* ==========================================================================
   Event Experience Font Style
========================================================================== */

export type EventExperienceFontStyle =
  | "normal"
  | "italic";


/* ==========================================================================
   Event Experience Text Align
========================================================================== */

export type EventExperienceTextAlign =
  | "left"
  | "center"
  | "right";


/* ==========================================================================
   Event Experience Element Presentation
========================================================================== */

export interface EventExperienceElementPresentation {
  font_family?:
    string;

  font_scale?:
    number;

  color?:
    string;

  font_style?:
    EventExperienceFontStyle;

  font_weight?:
    number;

  text_align?:
    EventExperienceTextAlign;
}


/* ==========================================================================
   Event Experience Background Presentation
========================================================================== */

export interface EventExperienceBackgroundPresentation {
  color?:
    string;

  image_url?:
    string | null;

  opacity?:
    number;
}


/* ==========================================================================
   Event Experience Layout Presentation
========================================================================== */

export interface EventExperienceLayoutPresentation {
  background?:
    EventExperienceBackgroundPresentation;
}


/* ==========================================================================
   Event Experience Presentation
========================================================================== */

export interface EventExperiencePresentation {
  layout?:
    EventExperienceLayoutPresentation;

  elements?:
    Record<
      string,
      EventExperienceElementPresentation
    >;
}