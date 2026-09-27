/* ==========================================================================
   Photo Wall Photo File Name
========================================================================== */

export function buildPhotoWallPhotoFileName(
  photoWallId: string,
  photoId: string,
  extension = "webp"
) {
  return `photo-wall/${photoWallId}/${photoId}.${extension}`;
}

/* ==========================================================================
   Digital Album Photo File Name
========================================================================== */

export function buildDigitalAlbumPhotoFileName(
  albumId: string,
  photoId: string,
  extension = "webp"
) {
  return `digital-albums/${albumId}/${photoId}.${extension}`;
}