/* ==========================================================================
   Constants
========================================================================== */

const MAX_PREVIEW_SIZE =
  1200;

const PREVIEW_QUALITY =
  0.82;


/* ==========================================================================
   Create Photo Preview
========================================================================== */

export async function createPhotoPreview(
  file:
    File
): Promise<string> {
  const bitmap =
    await createImageBitmap(
      file
    );

  try {
    const scale =
      Math.min(
        1,
        MAX_PREVIEW_SIZE /
          Math.max(
            bitmap.width,
            bitmap.height
          )
      );

    const width =
      Math.max(
        1,
        Math.round(
          bitmap.width *
            scale
        )
      );

    const height =
      Math.max(
        1,
        Math.round(
          bitmap.height *
            scale
        )
      );

    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width =
      width;

    canvas.height =
      height;

    const context =
      canvas.getContext(
        "2d"
      );

    if (
      !context
    ) {
      throw new Error(
        "Canvas context nije dostupan."
      );
    }

    context.drawImage(
      bitmap,
      0,
      0,
      width,
      height
    );

    const blob =
      await new Promise<Blob>(
        (
          resolve,
          reject
        ) => {
          canvas.toBlob(
            (result) => {
              if (
                !result
              ) {
                reject(
                  new Error(
                    "Preview nije moguće generirati."
                  )
                );

                return;
              }

              resolve(
                result
              );
            },
            "image/webp",
            PREVIEW_QUALITY
          );
        }
      );

    return URL.createObjectURL(
      blob
    );
  } finally {
    bitmap.close();
  }
}