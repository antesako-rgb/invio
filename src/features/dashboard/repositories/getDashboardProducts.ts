import {
  createServerClient,
} from "@/lib/supabase/server";


/* ==========================================================================
   Types
========================================================================== */

export interface DashboardProduct {
  id:
    string;

  event_id:
    string;

  name:
    string;

  is_public:
    boolean;
}

export interface DashboardProducts {
  walls:
    DashboardProduct[];

  albums:
    DashboardProduct[];
}


/* ==========================================================================
   Get Dashboard Products
========================================================================== */

export async function getDashboardProducts(
  eventIds:
    string[]
): Promise<DashboardProducts> {
  if (eventIds.length === 0) {
    return {
      walls: [],
      albums: [],
    };
  }

  const supabase =
    await createServerClient();

  const [
    walls,
    albums,
  ] =
    await Promise.all([
      supabase
        .from(
          "photo_walls"
        )
        .select(
          "id,event_id,name,is_public"
        )
        .in(
          "event_id",
          eventIds
        ),

      supabase
        .from(
          "digital_albums"
        )
        .select(
          "id,event_id,name,is_public"
        )
        .in(
          "event_id",
          eventIds
        ),
    ]);

  if (walls.error) {
    throw walls.error;
  }

  if (albums.error) {
    throw albums.error;
  }

  return {
    walls:
      walls.data,

    albums:
      albums.data,
  };
}