/* ==========================================================================
   Get Bunny Path
========================================================================== */

export function getBunnyPath(
  url: string
) {
  return url
    .replace(
      process.env.NEXT_PUBLIC_CDN_URL!,
      ""
    )
    .replace(
      /^\/+/,
      ""
    )
    .split("?")[0];
}