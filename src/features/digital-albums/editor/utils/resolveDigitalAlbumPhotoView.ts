import type { DigitalAlbumPhotoSlot } from "../../types/digitalAlbumDocument.types";

export type DigitalAlbumPhotoView = {
  slotId: string;
  mode: "context" | "pick";
} | null;

// A stale target must never act on the editor's fallback slot after navigation
// or a layout change. Empty placements always use the existing library picker.
export function resolveDigitalAlbumPhotoView(
  view: DigitalAlbumPhotoView,
  slot: DigitalAlbumPhotoSlot | undefined,
  visible: boolean,
): "library" | "context" | "pick" {
  if (!view || !slot || view.slotId !== slot.id || !visible) return "library";
  return view.mode === "pick" || !slot.photoId ? "pick" : "context";
}
