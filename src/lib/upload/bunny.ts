const STORAGE_ZONE =
  process.env.BUNNY_STORAGE_ZONE!;

const STORAGE_PASSWORD =
  process.env.BUNNY_STORAGE_PASSWORD!;

const REGION =
  process.env.BUNNY_STORAGE_REGION!;


/* ==========================================================================
   Storage Host
========================================================================== */

function getStorageHost() {
  return REGION === "de"
    ? "storage.bunnycdn.com"
    : `${REGION}.storage.bunnycdn.com`;
}


/* ==========================================================================
   Storage Endpoint
========================================================================== */

function getStorageEndpoint(
  path:
    string
) {
  const normalizedPath =
    path
      .replace(
        /^\/+/,
        ""
      )
      .replace(
        /\/+$/,
        ""
      );

  return `https://${getStorageHost()}/${STORAGE_ZONE}/${normalizedPath}`;
}


/* ==========================================================================
   Upload To Bunny
========================================================================== */

export async function uploadToBunny(
  file:
    ArrayBuffer,

  path:
    string,

  contentType:
    string
) {
  const endpoint =
    getStorageEndpoint(
      path
    );

  const response =
    await fetch(
      endpoint,
      {
        method:
          "PUT",

        headers: {
          AccessKey:
            STORAGE_PASSWORD,

          "Content-Type":
            contentType,
        },

        body:
          file,
      }
    );

  if (
    !response.ok
  ) {
    const error =
      await response.text();

    throw new Error(
      `Greška prilikom uploada na Bunny: ${error}`
    );
  }

  return path;
}


/* ==========================================================================
   Delete From Bunny
========================================================================== */

export async function deleteFromBunny(
  path:
    string
) {
  const endpoint =
    getStorageEndpoint(
      path
    );

  const response =
    await fetch(
      endpoint,
      {
        method:
          "DELETE",

        headers: {
          AccessKey:
            STORAGE_PASSWORD,
        },
      }
    );

  if (
    !response.ok
  ) {
    const error =
      await response.text();

    throw new Error(
      `Greška prilikom brisanja s Bunny: ${error}`
    );
  }
}


/* ==========================================================================
   Delete Directory From Bunny
========================================================================== */

export async function deleteDirectoryFromBunny(
  path:
    string
) {
  const normalizedPath =
    `${path.replace(
      /\/+$/,
      ""
    )}/`;

  const endpoint =
    `https://${getStorageHost()}/${STORAGE_ZONE}/${normalizedPath.replace(
      /^\/+/,
      ""
    )}`;

  const response =
    await fetch(
      endpoint,
      {
        method:
          "DELETE",

        headers: {
          AccessKey:
            STORAGE_PASSWORD,
        },
      }
    );

  if (
    !response.ok
  ) {
    const error =
      await response.text();

    throw new Error(
      `Greška prilikom brisanja Bunny direktorija: ${error}`
    );
  }
}