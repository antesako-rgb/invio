import {
  notFound,
} from "next/navigation";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { getDigitalAlbumPrintUrl } from "@/features/digital-albums/server/pdf/getDigitalAlbumPrintUrl";
import { PDF_RENDER_HEADER, verifyPdfRenderToken } from "@/features/digital-albums/server/pdf/pdfRenderAuthorization";

export const dynamic = "force-dynamic";

import DigitalAlbumPrintRenderer
  from "@/features/digital-albums/components/album-renderer/DigitalAlbumPrintRenderer/DigitalAlbumPrintRenderer";

import type {
  DigitalAlbumRendererPhoto,
} from "@/features/digital-albums/components/album-renderer/types/digitalAlbumRenderer.types";

import {
  getDigitalAlbum,
} from "@/features/digital-albums/repositories/album/getDigitalAlbum";

import {
  getDigitalAlbumPhotos,
} from "@/features/digital-albums/repositories/photos/getDigitalAlbumPhotos";

import {
  parseDigitalAlbumDocument,
} from "@/features/digital-albums/utils/parseDigitalAlbumDocument";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumPrintPageProps {
  params:
    Promise<{
      albumId:
        string;
    }>;
}


/* ==========================================================================
   Digital Album Print Page
========================================================================== */

export default async function DigitalAlbumPrintPage({
  params,
}: DigitalAlbumPrintPageProps) {
  const {
    albumId,
  } =
    await params;

  if (!z.string().uuid().safeParse(albumId).success) notFound();
  const requestHeaders = await headers();
  const token = requestHeaders.get(PDF_RENDER_HEADER);
  if (!token) notFound();
  // Production uses trusted deployment configuration. Host is only used for
  // the existing loopback-only development origin resolution.
  let origin: string;
  try {
    origin = getDigitalAlbumPrintUrl(`http://${requestHeaders.get("host") ?? "invalid"}`, albumId).origin;
  } catch { notFound(); }
  const claims = verifyPdfRenderToken(token, { albumId, origin });
  if (!claims) notFound();
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || data.user.id !== claims.userId) notFound();


  /* ==========================================================================
     Album
  ========================================================================== */

  const album =
    await getDigitalAlbum(
      albumId
    );

  if (
    !album
  ) {
    notFound();
  }


  /* ==========================================================================
     Document
  ========================================================================== */

  const document =
    parseDigitalAlbumDocument(
      album.document
    );


  /* ==========================================================================
     Photos
  ========================================================================== */

  const photos =
    await getDigitalAlbumPhotos(
      album.id
    );


  /* ==========================================================================
     Renderer Photos
  ========================================================================== */

  const rendererPhotos:
    DigitalAlbumRendererPhoto[] =
      photos.map(
        (albumPhoto) => ({
          id:
            albumPhoto.photo_id,

          imagePath:
            albumPhoto.photo.image_path,

          description:
            albumPhoto.description,
        })
      );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <DigitalAlbumPrintRenderer
      document={
        document
      }
      photos={
        rendererPhotos
      }
    />
  );
}
