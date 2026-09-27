# Layout picker previews

Add 440 × 640 px (11:16) WebP exports here:

- cover.webp
- full-photo.webp
- two-photos.webp
- editorial.webp
- story.webp
- collage.webp
- portrait-plate.webp
- landscape-plate.webp
- portrait-diptych.webp
- mixed-pair.webp
- hero-detail.webp
- quote.webp
- closing.webp

No final images are supplied yet. Missing images display a neutral UI placeholder.
These assets are only used by the Design layout picker, never by album rendering.
Paths are configured in src/features/digital-albums/config/digitalAlbumLayouts.ts.
Replace the file at the same path to update a preview; deploy the updated public files.
The picker requests the original WebP directly, without Next image optimization caching.
Normal browser/CDN caching still applies when replacing an existing file.

New beta layouts (same 440 x 640 WebP format):

- split.webp
- three-grid.webp
- four-grid.webp
- hero-text.webp
- portrait-pair-text.webp
- mosaic.webp
