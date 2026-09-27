import {
  notFound,
} from "next/navigation";

import Container
  from "@/components/layout/Container/Container";

import Page
  from "@/components/layout/PageContainer/Page";

import EventHeader
  from "../../components/EventWorkspace/EventHeader/EventHeader";

import EventProducts
  from "../../components/EventProducts/EventProducts";

import {
  getEventProductsPageData,
} from "../../repositories/getEventProductsPageData";


/* ==========================================================================
   Types
========================================================================== */

interface EventProductsPageProps {
  eventId:
    string;
}


/* ==========================================================================
   Event Products Page
========================================================================== */

export default async function EventProductsPage({
  eventId,
}: EventProductsPageProps) {
  const pageData =
    await getEventProductsPageData(
      eventId
    );

  if (!pageData) {
    notFound();
  }

  const {
    event,
    photoWall,
    digitalAlbum,
  } =
    pageData;


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Container>
      <Page>
        <EventHeader
          event={
            event
          }
          backHref="/dashboard/dogadaji"
        />

        <EventProducts
          eventId={
            eventId
          }
          photoWall={
            photoWall
          }
          digitalAlbum={
            digitalAlbum
          }
        />
      </Page>
    </Container>
  );
}