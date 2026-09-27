import type { ComponentType } from "react";
import type { PhotoWallMaterialRenderData } from "./photoWallMaterialRenderer.types";
import type { PhotoWallMaterialTemplateConfig } from "./photoWallMaterialTemplateConfig.types";

export interface PhotoWallMaterialTemplateProps { data: PhotoWallMaterialRenderData }
export interface PhotoWallMaterialTemplateDefinition {
  config: PhotoWallMaterialTemplateConfig;
  component: ComponentType<PhotoWallMaterialTemplateProps>;
}
