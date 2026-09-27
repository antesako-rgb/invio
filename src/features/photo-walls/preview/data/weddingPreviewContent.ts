import { createDefaultPhotoWallMaterialContent } from "../../content/createDefaultPhotoWallMaterialContent";

export const weddingMaterialPreviewContent = {
  ...createDefaultPhotoWallMaterialContent(),
  hero: {
    primary_name: "Matilda", secondary_name: "Daniel",
    title: "Podijelite trenutke", subtitle: null,
    first_initial: "M", second_initial: "D",
  },
  description: "Skenirajte QR kod i dodajte svoje fotografije.",
  date: { start_date: "2027-06-15" },
};
