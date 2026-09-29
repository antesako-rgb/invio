import {
  createServerClient,
} from "@/lib/supabase/server";


/* ==========================================================================
   Types
========================================================================== */

export interface DashboardProduct {
  id:
    string;

  project_id:
    string;

  name:
    string;

  is_public:
    boolean;
}

export interface DashboardProducts {
  invitations: DashboardProduct[];
  walls:
    DashboardProduct[];

  albums:
    DashboardProduct[];
}


/* ==========================================================================
   Get Dashboard Products
========================================================================== */

export async function getDashboardProducts(
  projectIds:
    string[]
): Promise<DashboardProducts> {
  if (projectIds.length === 0) {
    return {
      invitations: [],
      walls: [],
      albums: [],
    };
  }

  const supabase =
    await createServerClient();

  const [
    walls,
    albums,
    invitations,
  ] =
    await Promise.all([
      supabase
        .from(
          "photo_walls"
        )
        .select(
          "id,project_id,name,is_public"
        )
        .in(
          "project_id",
          projectIds
        ),

      supabase
        .from(
          "digital_albums"
        )
        .select(
          "id,project_id,name,is_public"
        )
        .in(
          "project_id",
          projectIds
        ),
      supabase.from("invitations").select("id,project_id,name,is_public").in("project_id", projectIds),
    ]);

  if (walls.error) {
    throw walls.error;
  }

  if (albums.error) {
    throw albums.error;
  }

  if (invitations.error) throw invitations.error;

  return {
    invitations: invitations.data,
    walls:
      walls.data,

    albums:
      albums.data,
  };
}