import "server-only";

import {
  createServerClient,
} from "@/lib/supabase/server";

import {
  getPhotoWall,
} from "@/features/photo-walls/repositories/photo-wall/getPhotoWall";


/* ==========================================================================
   Get Photo Wall Management Page Data
========================================================================== */

export async function getPhotoWallManagementPageData(
  photoWallId:
    string
) {
  const supabase =
    await createServerClient();

  const photoWall =
    await getPhotoWall(
      photoWallId
    );

  if (
    !photoWall
  ) {
    return null;
  }

  const [
    {
      data: {
        user,
      },
      error: authError,
    },
    {
      data: project,
      error: projectError,
    },
  ] =
    await Promise.all([
      supabase.auth.getUser(),

      supabase
        .from(
          "projects"
        )
        .select(
          "owner_id"
        )
        .eq(
          "id",
          photoWall.project_id
        )
        .maybeSingle(),
    ]);

  if (
    authError
  ) {
    throw new Error(
      authError.message
    );
  }

  if (
    projectError
  ) {
    throw new Error(
      projectError.message
    );
  }

  if (
    !user ||
    !project
  ) {
    return null;
  }

  return {
    photoWall,
    isOwner:
      user.id ===
      project.owner_id,
  };
}