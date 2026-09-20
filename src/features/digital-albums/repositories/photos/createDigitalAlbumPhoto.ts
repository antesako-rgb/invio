import {
  createServerClient,
} from "@/lib/supabase/server";

import type {
  DigitalAlbumPhoto,
} from "@/features/digital-albums/types/digitalAlbumPhoto.types";


/* ==========================================================================
   Types
========================================================================== */

interface CreateDigitalAlbumPhotoInput {
  albumId:
    string;

  imagePath:
    string;

  fileSize:
    number;

  description?:
    string;
}


/* ==========================================================================
   Create Digital Album Photo
========================================================================== */

export async function createDigitalAlbumPhoto({
  albumId,
  imagePath,
  fileSize,
  description,
}: CreateDigitalAlbumPhotoInput): Promise<DigitalAlbumPhoto> {
  const supabase =
    await createServerClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "create_digital_album_photo",
      {
        p_album_id:
          albumId,

        p_image_path:
          imagePath,

        p_file_size:
          fileSize,

        p_description:
          description,
      }
    );

  if (error) {
    console.error(
      "createDigitalAlbumPhoto error:",
      error
    );

    throw new Error(
      error.message
    );
  }

  if (!data) {
    throw new Error(
      "Fotografiju nije moguće dodati u digitalni album."
    );
  }

  return data;
}