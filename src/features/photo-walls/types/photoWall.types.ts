import type {
  Database,
  Tables,
} from "@/lib/supabase/database.types";


/* ==========================================================================
   Photo Wall
========================================================================== */

export type PhotoWall =
  Tables<"photo_walls">;


/* ==========================================================================
   Photo Wall Appearance
========================================================================== */

export type PhotoWallColor =
  | "memiva"
  | "warm"
  | "sage"
  | "rose"
  | "blue"
  | "lavender"
  | "charcoal";


/* ==========================================================================
   Public Photo Wall
========================================================================== */

export type PublicPhotoWall =
  Database["public"]["Functions"]["get_public_photo_wall"]["Returns"][number];


/* ==========================================================================
   Update Photo Wall
========================================================================== */

export type UpdatePhotoWallArgs =
  Database["public"]["Functions"]["update_photo_wall"]["Args"];


/* ==========================================================================
   Publish Photo Wall
========================================================================== */

export type PublishPhotoWallArgs =
  Database["public"]["Functions"]["publish_photo_wall"]["Args"];


/* ==========================================================================
   Unpublish Photo Wall
========================================================================== */

export type UnpublishPhotoWallArgs =
  Database["public"]["Functions"]["unpublish_photo_wall"]["Args"];