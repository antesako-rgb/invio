import EventDigitalAlbumsPage
  from "@/features/digital-albums/pages/EventDigitalAlbumsPage/EventDigitalAlbumsPage";


/* ==========================================================================
   Types
========================================================================== */

interface AlbumsPageProps {
  params:
    Promise<{
      eventId:
        string;
    }>;
}


/* ==========================================================================
   Albums Page
========================================================================== */

export default async function AlbumsPage({
  params,
}: AlbumsPageProps) {
  const {
    eventId,
  } =
    await params;

  return (
    <EventDigitalAlbumsPage
      eventId={
        eventId
      }
    />
  );
}