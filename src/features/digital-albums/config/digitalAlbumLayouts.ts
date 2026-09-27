import type {
  DigitalAlbumPageContent,
  DigitalAlbumPageLayout,
} from "../types/digitalAlbumDocument.types";
export type LayoutCategory = "single" | "pairs" | "sequence" | "text";
interface SlotDefinition {
  role: "primary" | "supporting" | "detail";
  aspect: "portrait" | "landscape" | "square";
}
interface DigitalAlbumLayoutDefinition {
  id: DigitalAlbumPageLayout;
  labelKey: DigitalAlbumPageLayout;
  category: LayoutCategory;
  slots: readonly SlotDefinition[];
  textFields: readonly (keyof DigitalAlbumPageContent)[];
  preview: string;
  currentVersion: 2;
  legacy: boolean;
  supportsContain: boolean;
  photoSlotCount: number;
}
function layout(
  id: DigitalAlbumPageLayout,
  preview: string,
  category: LayoutCategory,
  aspects: SlotDefinition["aspect"][],
  textFields: (keyof DigitalAlbumPageContent)[] = [],
  legacy = false,
): DigitalAlbumLayoutDefinition {
  const slots = aspects.map(
    (aspect, index): SlotDefinition => ({
      aspect,
      role: index === 0 ? "primary" : index === 1 ? "supporting" : "detail",
    }),
  );
  return {
    id,
    preview,
    labelKey: id,
    category,
    slots,
    textFields,
    currentVersion: 2,
    legacy,
    supportsContain: id !== "cover" && id !== "full-photo",
    photoSlotCount: slots.length,
  };
}
const DIGITAL_ALBUM_LAYOUTS = {
  cover: layout(
    "cover",
    "/digital-albums/layout-previews/cover.webp",
    "single",
    ["portrait"],
    ["title", "subtitle", "date"],
    true,
  ),
  "full-photo": layout("full-photo","/digital-albums/layout-previews/full-photo.webp", "single", ["portrait"], [], true),
  "two-photos": layout(
    "two-photos",
    "/digital-albums/layout-previews/two-photos.webp",
    "pairs",
    ["landscape", "landscape"],
    [],
    true,
  ),
  editorial: layout(
    "editorial",
    "/digital-albums/layout-previews/editorial.webp",
    "single",
    ["landscape"],
    ["title", "text"],
    true,
  ),
  story: layout(
    "story",
    "/digital-albums/layout-previews/story.webp",
    "text",
    [],
    ["subtitle", "title", "date", "text"],
    true,
  ),
  collage: layout(
    "collage",
    "/digital-albums/layout-previews/collage.webp",
    "sequence",
    ["portrait", "portrait", "portrait"],
    ["subtitle", "title"],
    true,
  ),
  "portrait-plate": layout("portrait-plate","/digital-albums/layout-previews/portrait-plate.webp", "single", ["portrait"]),
  "landscape-plate": layout("landscape-plate","/digital-albums/layout-previews/landscape-plate.webp", "single", ["landscape"]),
  "portrait-diptych": layout("portrait-diptych","/digital-albums/layout-previews/portrait-diptych.webp", "pairs", [
    "portrait",
    "portrait",
  ]),
  "mixed-pair": layout("mixed-pair","/digital-albums/layout-previews/mixed-pair.webp", "pairs", ["portrait", "landscape"]),
  "hero-detail": layout("hero-detail","/digital-albums/layout-previews/hero-detail.webp", "pairs", ["portrait", "square"]),
  quote: layout("quote","/digital-albums/layout-previews/quote.webp", "text", [], ["text", "subtitle"]),
  closing: layout("closing","/digital-albums/layout-previews/closing.webp", "text", [], ["title", "text", "date"]),
  "split": layout("split", "/digital-albums/layout-previews/split.webp", "single", ["portrait"], ["title", "text"]),
  "three-grid": layout("three-grid", "/digital-albums/layout-previews/three-grid.webp", "sequence", ["landscape", "square", "square"], []),
  "four-grid": layout("four-grid", "/digital-albums/layout-previews/four-grid.webp", "sequence", ["portrait", "portrait", "portrait", "portrait"], []),
  "hero-text": layout("hero-text", "/digital-albums/layout-previews/hero-text.webp", "single", ["landscape"], ["title", "text"]),
  "portrait-pair-text": layout("portrait-pair-text", "/digital-albums/layout-previews/portrait-pair-text.webp", "pairs", ["portrait", "portrait"], ["title", "subtitle"]),
  "mosaic": layout("mosaic", "/digital-albums/layout-previews/mosaic.webp", "sequence", ["portrait", "square", "square", "landscape", "landscape"], []),
} satisfies Record<DigitalAlbumPageLayout, DigitalAlbumLayoutDefinition>;
export const DIGITAL_ALBUM_LAYOUT_IDS = Object.keys(
  DIGITAL_ALBUM_LAYOUTS,
) as DigitalAlbumPageLayout[];
export function getDigitalAlbumLayout(id: DigitalAlbumPageLayout) {
  return DIGITAL_ALBUM_LAYOUTS[id];
}
