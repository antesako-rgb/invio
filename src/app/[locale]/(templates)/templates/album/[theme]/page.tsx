import { notFound } from "next/navigation";
import DigitalAlbumViewer from "@/features/digital-albums/components/album-renderer/DigitalAlbumViewer/DigitalAlbumViewer";
import { createDemoDigitalAlbumDocument } from "@/features/digital-albums/demo/createDemoDigitalAlbumDocument";
import { digitalAlbumDemoPhotos } from "@/features/digital-albums/demo/digitalAlbumDemoPhotos";

import { isDigitalAlbumTheme } from "@/features/digital-albums/config/digitalAlbumThemes";

interface AlbumTemplatePageProps {
  params: Promise<{ locale: string; theme: string }>;
}

// Public theme foundation. No user album, membership or public_id is involved.
export default async function AlbumTemplatePage({ params }: AlbumTemplatePageProps) {
  const { theme } = await params;

  if (!isDigitalAlbumTheme(theme)) notFound();

  return (
    <DigitalAlbumViewer
      document={createDemoDigitalAlbumDocument(theme)}
      photos={digitalAlbumDemoPhotos}
    />
  );
}
