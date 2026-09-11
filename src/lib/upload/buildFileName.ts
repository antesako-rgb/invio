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


/* ==========================================================================
   Photo Wall Photo File Name
========================================================================== */

export function buildPhotoWallPhotoFileName(
  invitationId: string,
  photoId: string,
  extension = "webp"
) {
  return `photo-wall/${invitationId}/${photoId}.${extension}`;
}