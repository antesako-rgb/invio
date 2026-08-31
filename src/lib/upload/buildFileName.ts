/* ==========================================================================
   Invitation Image File Name
========================================================================== */

export function buildInvitationImageFileName(
  invitationId: string,
  imageId: string,
  extension = "webp"
) {
  return `invitations/${invitationId}/images/${imageId}.${extension}`;
}