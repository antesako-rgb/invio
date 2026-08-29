/* ==========================================================================
   Invitation Font Style
========================================================================== */

export type InvitationFontStyle =
  | "normal"
  | "italic";


/* ==========================================================================
   Invitation Text Align
========================================================================== */

export type InvitationTextAlign =
  | "left"
  | "center"
  | "right";


/* ==========================================================================
   Invitation Element Presentation
========================================================================== */

export interface InvitationElementPresentation {
  font_family?:
    string;

  font_scale?:
    number;

  color?:
    string;

  font_style?:
    InvitationFontStyle;

  font_weight?:
    number;

  text_align?:
    InvitationTextAlign;
}


/* ==========================================================================
   Invitation Background Presentation
========================================================================== */

export interface InvitationBackgroundPresentation {
  color?:
    string;

  image_url?:
    string | null;

  opacity?:
    number;
}


/* ==========================================================================
   Invitation Layout Presentation
========================================================================== */

export interface InvitationLayoutPresentation {
  background?:
    InvitationBackgroundPresentation;
}


/* ==========================================================================
   Invitation Presentation
========================================================================== */

export interface InvitationPresentation {
  layout?:
    InvitationLayoutPresentation;

  elements?:
    Record<
      string,
      InvitationElementPresentation
    >;
}