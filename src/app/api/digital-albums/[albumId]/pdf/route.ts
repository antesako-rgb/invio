import {
  cookies,
} from "next/headers";

import {
  NextResponse,
} from "next/server";

import {
  getDigitalAlbum,
} from "@/features/digital-albums/repositories/album/getDigitalAlbum";

import {
  generateDigitalAlbumPdf,
} from "@/features/digital-albums/server/pdf/generateDigitalAlbumPdf";


/* ==========================================================================
   Runtime
========================================================================== */

export const runtime =
  "nodejs";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumPdfRouteProps {
  params:
    Promise<{
      albumId:
        string;
    }>;
}


/* ==========================================================================
   POST
========================================================================== */

export async function POST(
  request:
    Request,
  {
    params,
  }:
    DigitalAlbumPdfRouteProps
) {
  const {
    albumId,
  } =
    await params;


  /* ==========================================================================
     Album Access
  ========================================================================== */

  const album =
    await getDigitalAlbum(
      albumId
    );

  if (
    !album
  ) {
    return NextResponse.json(
      {
        error:
          "Digital album not found.",
      },
      {
        status:
          404,
      }
    );
  }


  /* ==========================================================================
     Origin
  ========================================================================== */

  const requestUrl =
    new URL(
      request.url
    );

  const origin =
    requestUrl.origin;

  const printUrl =
    new URL(
      `/editor/album/${album.id}/print`,
      origin
    ).toString();


  /* ==========================================================================
     Authentication Cookies
  ========================================================================== */

  const cookieStore =
    await cookies();

  const browserCookies =
    cookieStore
      .getAll()
      .map(
        (cookie) => ({
          name:
            cookie.name,

          value:
            cookie.value,

          domain:
            requestUrl.hostname,

          path:
            "/",
        })
      );


  /* ==========================================================================
     PDF
  ========================================================================== */

  const pdf =
    await generateDigitalAlbumPdf({
      printUrl,
      cookies:
        browserCookies,
    });


  /* ==========================================================================
     Response
  ========================================================================== */

  return new Response(
    new Uint8Array(
      pdf
    ),
    {
      status:
        200,

      headers: {
        "Content-Type":
          "application/pdf",

        "Content-Disposition":
          `attachment; filename="digital-album-${album.id}.pdf"`,

        "Cache-Control":
          "private, no-store",
      },
    }
  );
}