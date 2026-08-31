const MAX_FILE_SIZE_MB =
  10;

const MAX_FILE_SIZE =
  MAX_FILE_SIZE_MB *
  1024 *
  1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];


/* ==========================================================================
   Validate Image
========================================================================== */

export function validateImage(
  file: File
) {
  if (
    !ALLOWED_TYPES.includes(
      file.type
    )
  ) {
    throw new Error(
      "Podržani su JPG, PNG i WEBP formati."
    );
  }

  if (
    file.size >
    MAX_FILE_SIZE
  ) {
    throw new Error(
      `Slika ne smije biti veća od ${MAX_FILE_SIZE_MB} MB.`
    );
  }
}