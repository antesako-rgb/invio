import DigitalAlbumManagementPage
  from "@/features/digital-albums/pages/DigitalAlbumManagementPage/DigitalAlbumManagementPage";


/* ==========================================================================
   Types
========================================================================== */

interface PageProps {
  params:
    Promise<{
      albumId:
        string;
    }>;
}


/* ==========================================================================
   Page
========================================================================== */

export default async function Page({
  params,
}: PageProps) {
  const {
    albumId,
  } =
    await params;

  return (
    <DigitalAlbumManagementPage
      albumId={
        albumId
      }
    />
  );
}