/* ==========================================================================
   Invitation Themes
========================================================================== */

export const invitationThemes = [
  "classic",
  "modern",
  "editorial",
  "botanical",
  "celebration",
] as const;


/* ==========================================================================
   Types
========================================================================== */

export type InvitationTheme =
  typeof invitationThemes[number];


/* ==========================================================================
   Helpers
========================================================================== */

export function isInvitationTheme(
  value: string
): value is InvitationTheme {
  return invitationThemes.some(
    (theme) =>
      theme === value
  );
}