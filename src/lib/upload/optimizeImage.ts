import sharp
  from "sharp";


/* ==========================================================================
   Types
========================================================================== */

interface OptimizeImageOptions {
  buffer:
    ArrayBuffer;

  width:
    number;

  quality?:
    number;
}


/* ==========================================================================
   Optimize Image
========================================================================== */

export async function optimizeImage({
  buffer,
  width,
  quality = 82,
}: OptimizeImageOptions) {
  try {
    return await sharp(
      Buffer.from(
        buffer
      )
    )
      .resize({
        width,
        withoutEnlargement:
          true,
      })
      .webp({
        quality,
      })
      .toBuffer();
  } catch {
    throw new Error(
      "Fotografiju nije moguće obraditi. Pokušajte odabrati drugu fotografiju."
    );
  }
}