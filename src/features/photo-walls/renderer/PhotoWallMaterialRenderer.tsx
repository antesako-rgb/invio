import { photoWallMaterialFonts } from "../editor/fonts/photoWallMaterialFonts";
import type { CSSProperties } from "react";
import { getPhotoWallMaterialTemplate } from "../cards/registry/photoWallMaterialTemplateRegistry";
import type { PhotoWallMaterialRendererProps } from "../types/photoWallMaterialRenderer.types";
import styles from "./PhotoWallMaterialRenderer.module.css";

export default function PhotoWallMaterialRenderer({ templateId, variantId, mode, data }: PhotoWallMaterialRendererProps) {
  const definition = getPhotoWallMaterialTemplate(templateId);
  if (!definition || !definition.config.variants.some(variant => variant.id === variantId)) return null;
  const Card = definition.component;
  const style: CSSProperties & { "--material-ratio": string } = {
    "--material-ratio": definition.config.card.aspectRatio,
  };
  return (
    <div className={`${styles.paper} ${photoWallMaterialFonts}`} data-photo-wall-material data-template={templateId}
      data-variant={variantId} data-mode={mode} style={style}>
      <Card data={data} />
    </div>
  );
}
