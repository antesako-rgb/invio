/* ==========================================================================
   Photo Wall Material Hero Content
========================================================================== */

export interface PhotoWallMaterialHeroContent {
  primary_name:
    string | null;

  secondary_name:
    string | null;

  title:
    string | null;

  subtitle:
    string | null;

  first_initial:
    string | null;

  second_initial:
    string | null;
}


/* ==========================================================================
   Photo Wall Material Date Content
========================================================================== */

export interface PhotoWallMaterialDateContent {
  start_date:
    string | null;
}


/* ==========================================================================
   Photo Wall Material Time Content
========================================================================== */

export interface PhotoWallMaterialTimeContent {
  start_time:
    string | null;
}


/* ==========================================================================
   Photo Wall Material Location Content
========================================================================== */

export interface PhotoWallMaterialLocationContent {
  name:
    string | null;

  address:
    string | null;
}


/* ==========================================================================
   Photo Wall Material Content
========================================================================== */

export interface PhotoWallMaterialContent {
  hero:
    PhotoWallMaterialHeroContent;

  description:
    string | null;

  date:
    PhotoWallMaterialDateContent;

  time:
    PhotoWallMaterialTimeContent;

  location:
    PhotoWallMaterialLocationContent;
}