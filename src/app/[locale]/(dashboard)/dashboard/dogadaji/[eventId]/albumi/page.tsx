import {
  notFound,
} from "next/navigation";

import DigitalAlbumManagementPage
  from "@/features/digital-albums/pages/DigitalAlbumManagementPage/DigitalAlbumManagementPage";

import {
  getEventDigitalAlbum,
} from "@/features/digital-albums/repositories/album/getEventDigitalAlbum";


/* ==========================================================================
   Types
========================================================================== */

interface EventAlbumPageProps {
  params:
    Promise<{
      eventId:
        string;
    }>;
}


/* ==========================================================================
   Event Album Page
========================================================================== */

export default async function EventAlbumPage({
  params,
}: EventAlbumPageProps) {

  const {
    eventId,
  } =
    await params;


  const album =
    await getEventDigitalAlbum(
      eventId
    );


  if (
    !album
  ) {
    notFound();
  }


  return (
    <DigitalAlbumManagementPage
      album={
        album
      }
    />
  );

}