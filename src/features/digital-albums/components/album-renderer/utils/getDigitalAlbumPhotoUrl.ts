import { getEventPhotoUrl } from "@/features/event-photos/utils/getEventPhotoUrl";
import type { DigitalAlbumRendererPhoto } from "../types/digitalAlbumRenderer.types";

export function getDigitalAlbumPhotoUrl(photo: DigitalAlbumRendererPhoto): string {
  if (photo.source === "local") {
    if (!photo.imagePath.startsWith("/") || photo.imagePath.startsWith("//")) {
      throw new Error("Local album photos require a public asset path.");
    }
    return photo.imagePath;
  }
  return getEventPhotoUrl(photo.imagePath);
}
