import type {
  Tables,
} from "@/lib/supabase/database.types";


/* ==========================================================================
   Photo Wall Material
========================================================================== */

export type PhotoWallMaterial =
  Tables<"photo_wall_materials">;
export type PhotoWallMaterialType = PhotoWallMaterial["type"];
