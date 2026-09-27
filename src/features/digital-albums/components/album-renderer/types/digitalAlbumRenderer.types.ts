/* ==========================================================================
   Digital Album Renderer Photo
========================================================================== */

export interface DigitalAlbumRendererPhoto {
  /** Local public assets bypass the event-photo CDN. Omitted for event photos. */
  source?: "local";
  id:
    string;

  imagePath:
    string;

  description:
    string | null;
}
