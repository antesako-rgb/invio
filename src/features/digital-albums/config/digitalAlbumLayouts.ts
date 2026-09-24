import type {
  DigitalAlbumPageContent,
  DigitalAlbumPageLayout,
} from "../types/digitalAlbumDocument.types";
export type LayoutCategory = "single" | "pairs" | "sequence" | "text";
interface SlotDefinition {
  role: "primary" | "supporting" | "detail";
  aspect: "portrait" | "landscape" | "square";
}
export interface DigitalAlbumLayoutDefinition {
  id: DigitalAlbumPageLayout;
  labelKey: DigitalAlbumPageLayout;
  category: LayoutCategory;
  slots: readonly SlotDefinition[];
  textFields: readonly (keyof DigitalAlbumPageContent)[];
  previewKey: DigitalAlbumPageLayout;
  currentVersion: 2;
  legacy: boolean;
  supportsContain: boolean;
  photoSlotCount: number;
}
function layout(
  id: DigitalAlbumPageLayout,
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
    previewKey: id,
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
export const DIGITAL_ALBUM_LAYOUTS = {
  cover: layout(
    "cover",
    "single",
    ["portrait"],
    ["title", "subtitle", "date"],
    true,
  ),
  "full-photo": layout("full-photo", "single", ["portrait"], [], true),
  "two-photos": layout(
    "two-photos",
    "pairs",
    ["landscape", "landscape"],
    [],
    true,
  ),
  editorial: layout(
    "editorial",
    "single",
    ["landscape"],
    ["title", "text"],
    true,
  ),
  story: layout(
    "story",
    "text",
    [],
    ["subtitle", "title", "date", "text"],
    true,
  ),
  collage: layout(
    "collage",
    "sequence",
    ["portrait", "portrait", "portrait"],
    ["subtitle", "title"],
    true,
  ),
  "portrait-plate": layout("portrait-plate", "single", ["portrait"]),
  "landscape-plate": layout("landscape-plate", "single", ["landscape"]),
  "portrait-diptych": layout("portrait-diptych", "pairs", [
    "portrait",
    "portrait",
  ]),
  "mixed-pair": layout("mixed-pair", "pairs", ["portrait", "landscape"]),
  "hero-detail": layout("hero-detail", "pairs", ["portrait", "square"]),
  quote: layout("quote", "text", [], ["text", "subtitle"]),
  closing: layout("closing", "text", [], ["title", "text", "date"]),
} satisfies Record<DigitalAlbumPageLayout, DigitalAlbumLayoutDefinition>;
export const DIGITAL_ALBUM_LAYOUT_IDS = Object.keys(
  DIGITAL_ALBUM_LAYOUTS,
) as DigitalAlbumPageLayout[];
export function getDigitalAlbumLayout(id: DigitalAlbumPageLayout) {
  return DIGITAL_ALBUM_LAYOUTS[id];
}
