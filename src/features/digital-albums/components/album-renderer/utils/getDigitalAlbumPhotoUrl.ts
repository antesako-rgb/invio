import { getProjectPhotoUrl } from "@/features/project-photos/utils/getProjectPhotoUrl";
import type { DigitalAlbumRendererPhoto } from "../types/digitalAlbumRenderer.types";

export function getDigitalAlbumPhotoUrl(photo: DigitalAlbumRendererPhoto): string {
  if (photo.source === "local") {
    if (!photo.imagePath.startsWith("/") || photo.imagePath.startsWith("//")) {
      throw new Error("Local album photos require a public asset path.");
    }
    return photo.imagePath;
  }
  return getProjectPhotoUrl(photo.imagePath);
}
