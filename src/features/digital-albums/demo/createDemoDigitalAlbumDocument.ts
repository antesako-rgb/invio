import { getDigitalAlbumLayout } from "../config/digitalAlbumLayouts";
import type { DigitalAlbumDocument, DigitalAlbumTheme } from "../types/digitalAlbumDocument.types";
import { digitalAlbumDemoContent, digitalAlbumDemoPages } from "./digitalAlbumDemoContent";

export function createDemoDigitalAlbumDocument(theme: DigitalAlbumTheme): DigitalAlbumDocument {
  return {
    theme,
    pages: digitalAlbumDemoPages.map((page, index) => {
      const definition = getDigitalAlbumLayout(page.layout);
      const values = { ...digitalAlbumDemoContent, ...page.content };
      if (page.photos.length !== definition.photoSlotCount) {
        throw new Error(`Demo photo count does not match ${page.layout}`);
      }
      return {
        id: `demo-page-${index + 1}`,
        layout: page.layout,
        layoutVersion: definition.currentVersion,
        content: Object.fromEntries(definition.textFields.map((field) => [field, values[field]])),
        photos: Array.from({ length: definition.photoSlotCount }, (_, slot) => ({
          id: `demo-page-${index + 1}-slot-${slot + 1}`,
          photoId: page.photos[slot],
          caption: "",
        })),
        unplacedPhotos: [],
      };
    }),
  };
}
