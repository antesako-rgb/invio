import type { PhotoWallMaterialContent } from "./photoWallMaterialContent.types";
import type { PhotoWallMaterialPresentation } from "./photoWallMaterialPresentation.types";
import type { PhotoWallMaterialType } from "./photoWallMaterial.types";

export type PhotoWallMaterialRenderMode = "edit" | "export";
export interface PhotoWallMaterialDateDisplay {
  hasDate: boolean; value: string | null; formatted: string;
  day: string; dayName: string; month: string; year: string;
}
export interface PhotoWallMaterialTimeDisplay { hasTime: boolean; text: string }
export interface PhotoWallMaterialLocationDisplay { hasLocation: boolean; venueName: string; address: string }
export interface PhotoWallMaterialDisplayData {
  date: PhotoWallMaterialDateDisplay;
  time: PhotoWallMaterialTimeDisplay;
  location: PhotoWallMaterialLocationDisplay;
}
export interface PhotoWallMaterialRenderData {
  type: PhotoWallMaterialType;
  // Parent Photo Wall destination. Null only in the unbound template catalog.
  photoWallUrl: string | null;
  content: PhotoWallMaterialContent;
  presentation: PhotoWallMaterialPresentation;
  display: PhotoWallMaterialDisplayData;
}
export interface PhotoWallMaterialRendererProps {
  templateId: string; variantId: string; mode: PhotoWallMaterialRenderMode;
  data: PhotoWallMaterialRenderData;
}
