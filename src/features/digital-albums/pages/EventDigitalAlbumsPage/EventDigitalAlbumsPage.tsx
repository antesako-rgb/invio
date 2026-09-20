import {
  Images,
} from "lucide-react";

import {
  getTranslations,
} from "next-intl/server";

import Page
  from "@/components/layout/PageContainer/Page";

import {
  EmptyState,
} from "@/components/ui/empty-state/EmptyState";

import PageHeader
  from "@/components/ui/page-header/PageHeader";

import DigitalAlbumCreateAction
  from "@/features/digital-albums/components/album-create/DigitalAlbumCreateAction/DigitalAlbumCreateAction";


/* ==========================================================================
   Types
========================================================================== */

interface EventDigitalAlbumsPageProps {
  eventId:
    string;
}


/* ==========================================================================
   Event Digital Albums Page
========================================================================== */

export default async function EventDigitalAlbumsPage({
  eventId,
}: EventDigitalAlbumsPageProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    await getTranslations(
      "DigitalAlbums.page"
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Page>
      <PageHeader
        title={
          t(
            "title"
          )
        }
        description={
          t(
            "description"
          )
        }
        actions={
          <DigitalAlbumCreateAction
            eventId={
              eventId
            }
          />
        }
      />

      <EmptyState
        variant="card"
        icon={
          Images
        }
        title={
          t(
            "empty.title"
          )
        }
        description={
          t(
            "empty.description"
          )
        }
        action={
          <DigitalAlbumCreateAction
            eventId={
              eventId
            }
          />
        }
      />
    </Page>
  );
}