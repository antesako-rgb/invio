import "server-only";
import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  deleteFromBunny,
} from "@/lib/upload/bunny";


/* ==========================================================================
   Types
========================================================================== */

interface DeleteOrphanProjectPhotoInput {
  photoId:
    string;

  imagePath:
    string;
}


/* ==========================================================================
   Delete Orphan Project Photo
========================================================================== */

export async function deleteOrphanProjectPhoto({
  photoId,
  imagePath,
}: DeleteOrphanProjectPhotoInput): Promise<void> {
  const admin =
    createAdminClient();


  /* ==========================================================================
     Check Photo Wall Usage
  ========================================================================== */

  const {
    count: photoWallUsageCount,
    error: photoWallUsageError,
  } =
    await admin
      .from(
        "photo_wall_photos"
      )
      .select(
        "photo_id",
        {
          count:
            "exact",

          head:
            true,
        }
      )
      .eq(
        "photo_id",
        photoId
      );

  if (
    photoWallUsageError || photoWallUsageCount === null
  ) {
    console.error(
      "deleteOrphanProjectPhoto photo wall usage error:",
      photoWallUsageError ?? "Missing usage count"
    );

    throw new Error(
      "Korištenje fotografije nije moguće provjeriti."
    );
  }


  /* ==========================================================================
     Check Digital Album Usage
  ========================================================================== */

  const {
    count: albumUsageCount,
    error: albumUsageError,
  } =
    await admin
      .from(
        "digital_album_photos"
      )
      .select(
        "photo_id",
        {
          count:
            "exact",

          head:
            true,
        }
      )
      .eq(
        "photo_id",
        photoId
      );

  if (
    albumUsageError || albumUsageCount === null
  ) {
    console.error(
      "deleteOrphanProjectPhoto album usage error:",
      albumUsageError ?? "Missing usage count"
    );

    throw new Error(
      "Korištenje fotografije nije moguće provjeriti."
    );
  }


  /* ==========================================================================
     Keep Shared Photo
  ========================================================================== */

  const { count: invitationUsageCount, error: invitationUsageError } = await admin
    .from("invitation_photos").select("photo_id", { count: "exact", head: true }).eq("photo_id", photoId);
  if (invitationUsageError || invitationUsageCount === null) throw new Error("Invitation photo usage could not be checked.");

  const isStillUsed =
    (photoWallUsageCount ?? 0) >
      0 ||
    (albumUsageCount ?? 0) >
      0 || invitationUsageCount > 0;

  if (
    isStillUsed
  ) {
    return;
  }


  /* ==========================================================================
     Delete From Bunny
  ========================================================================== */

  await deleteFromBunny(
    imagePath
  );


  /* ==========================================================================
     Delete Project Photo
  ========================================================================== */

  const {
    error: deletePhotoError,
  } =
    await admin
      .from(
        "project_photos"
      )
      .delete()
      .eq(
        "id",
        photoId
      );

  if (
    deletePhotoError
  ) {
    console.error(
      "deleteOrphanProjectPhoto project photo delete error:",
      deletePhotoError
    );

    throw new Error(
      "Fotografiju nije moguće obrisati."
    );
  }
}