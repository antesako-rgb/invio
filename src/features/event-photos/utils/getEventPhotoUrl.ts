/* ==========================================================================
   Get Event Photo URL
========================================================================== */

export function getEventPhotoUrl(
  imagePath:
    string
): string {
  const cdnUrl =
    process.env
      .NEXT_PUBLIC_CDN_URL;

  if (
    !cdnUrl
  ) {
    throw new Error(
      "CDN URL nije konfiguriran."
    );
  }

  const normalizedCdnUrl =
    cdnUrl.replace(
      /\/+$/,
      ""
    );

  const normalizedImagePath =
    imagePath.replace(
      /^\/+/,
      ""
    );

  return `${normalizedCdnUrl}/${normalizedImagePath}`;
}