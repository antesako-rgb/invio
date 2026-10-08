/* ==========================================================================
   Accepted Image Types
========================================================================== */

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];


/* ==========================================================================
   Accepted Image Types Value
========================================================================== */

export const ACCEPTED_IMAGE_TYPES_VALUE =
  ACCEPTED_IMAGE_TYPES.join(
    ","
  );


/* ==========================================================================
   Limits
========================================================================== */

// Keep one-file server-action requests below Vercel's 4.5 MB payload cap.
// 4 MiB leaves room for multipart fields and headers.
export const MAX_FILE_SIZE = 4 * 1024 * 1024;

export const MAX_FILES =
  10;