/* ==========================================================================
   Get Invitation Public Path
========================================================================== */

export function getInvitationPublicPath(
  publicId: string
) {
  return `/pozivnice/${publicId}`;
}