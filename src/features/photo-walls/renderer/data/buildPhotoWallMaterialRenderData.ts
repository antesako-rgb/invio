import type { PhotoWallMaterial } from "../../types/photoWallMaterial.types";
import type { Locale } from "@/i18n/config";
import type { PhotoWallMaterialRenderData } from "../../types/photoWallMaterialRenderer.types";
import { parsePhotoWallMaterialContent } from "../parsers/parsePhotoWallMaterialContent";
import { parsePhotoWallMaterialPresentation } from "../parsers/parsePhotoWallMaterialPresentation";
import { buildPhotoWallMaterialDisplay } from "./buildPhotoWallMaterialDisplay";
import { buildPublicPhotoWallUrl } from "../../utils/buildPublicPhotoWallUrl";

export function buildPhotoWallMaterialRenderData({ material, locale, photoWallPublicId }: {
  material: Pick<PhotoWallMaterial, "content" | "presentation" | "type">;
  locale: Locale;
  photoWallPublicId: string;
}): PhotoWallMaterialRenderData {
  const content = parsePhotoWallMaterialContent(material.content);
  return {
    type: material.type,
    photoWallUrl: buildPublicPhotoWallUrl(locale, photoWallPublicId),
    content,
    presentation: parsePhotoWallMaterialPresentation(material.presentation),
    display: buildPhotoWallMaterialDisplay(content, locale),
  };
}
