import DigitalAlbumPremiumLayouts
  from "../layouts/DigitalAlbumLayouts/DigitalAlbumLayouts";

import type {
  DigitalAlbumRendererPhoto,
} from "@/features/digital-albums/components/album-renderer/types/digitalAlbumRenderer.types";

import type {
  DigitalAlbumDocumentPage,
  DigitalAlbumPageContent,
} from "@/features/digital-albums/types/digitalAlbumDocument.types";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumPageRendererProps {
  page:
    DigitalAlbumDocumentPage;

  photos:
    DigitalAlbumRendererPhoto[];

  activePhotoSlotId?:
    string | null;

  onSelectPhotoSlot?:
    (photoSlotId: string) => void;

  onPageContentChange?:
    (content: Partial<DigitalAlbumPageContent>) => void;
}


/* ==========================================================================
   Digital Album Page Renderer
========================================================================== */

export default function DigitalAlbumPageRenderer(
  props: DigitalAlbumPageRendererProps,
) {
  return (
    <DigitalAlbumPremiumLayouts
      {...props}
    />
  );
}