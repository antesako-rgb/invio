import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getDigitalAlbum } from "@/features/digital-albums/repositories/album/getDigitalAlbum";
import { DigitalAlbumPdfError, generateDigitalAlbumPdf } from "@/features/digital-albums/server/pdf/generateDigitalAlbumPdf";
import { getDigitalAlbumPrintUrl } from "@/features/digital-albums/server/pdf/getDigitalAlbumPrintUrl";
import { createServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 300;

interface DigitalAlbumPdfRouteProps {
  params: Promise<{ albumId: string }>;
}

export async function POST(request: Request, { params }: DigitalAlbumPdfRouteProps) {
  const { albumId } = await params;
  let stage = "authorization";
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return NextResponse.json({ error: "Unauthorized." }, {
        status: 401, headers: { "Cache-Control": "private, no-store" },
      });
    }
    // Preserve the existing user-scoped RLS access check; no service role.
    const album = await getDigitalAlbum(albumId);
    if (!album) {
      return NextResponse.json({ error: "Digital album not found." }, {
        status: 404, headers: { "Cache-Control": "private, no-store" },
      });
    }

    stage = "configuration";
    const printUrl = getDigitalAlbumPrintUrl(request.url, album.id);
    const cookieStore = await cookies();
    const browserCookies = cookieStore.getAll()
      // Includes chunked Supabase session cookies; omit unrelated app cookies.
      .filter((cookie) => /^sb-.*-auth-token(?:\.\d+)?$/.test(cookie.name))
      .map((cookie) => ({
        name: cookie.name,
        value: cookie.value,
        domain: printUrl.hostname,
        path: "/",
        secure: printUrl.protocol === "https:",
        httpOnly: true,
        sameSite: "Lax" as const,
      }));

    const pdf = await generateDigitalAlbumPdf({
      printUrl: printUrl.href,
      cookies: browserCookies,
    });

    // Stream the finished PDF in bounded chunks rather than a buffered Response:
    // Vercel's buffered response payload limit is too small for photo albums.
    let offset = 0;
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (offset >= pdf.length) {
          controller.close();
          return;
        }
        const end = Math.min(offset + 64 * 1024, pdf.length);
        controller.enqueue(new Uint8Array(pdf.subarray(offset, end)));
        offset = end;
      },
    });
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="digital-album-${album.id}.pdf"`,
        "Cache-Control": "private, no-store, no-transform",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const status = error instanceof DigitalAlbumPdfError ? error.status : 500;
    console.error("Digital album PDF export failed.", {
      stage: error instanceof DigitalAlbumPdfError ? error.stage : stage,
      status,
    });
    return NextResponse.json({ error: "Digital album PDF export failed." }, {
      status,
      headers: {
        "Cache-Control": "private, no-store",
        ...(status === 503 ? { "Retry-After": "10" } : {}),
      },
    });
  }
}
