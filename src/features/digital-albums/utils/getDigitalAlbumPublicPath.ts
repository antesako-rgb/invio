/* ==========================================================================
   Get Digital Album Public Path
========================================================================== */

export function getDigitalAlbumPublicPath(
  publicId:
    string
) {
  return `/album/${publicId}`;
}