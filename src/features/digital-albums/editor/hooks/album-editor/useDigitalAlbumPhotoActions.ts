import type {
  DigitalAlbumDocument,
  DigitalAlbumPhotoSlot,
} from "../../../types/digitalAlbumDocument.types";
interface Options {
  activePageId: string | null;
  commit: (
    update: (document: DigitalAlbumDocument) => DigitalAlbumDocument,
  ) => void;
}
export default function useDigitalAlbumPhotoActions({
  activePageId,
  commit,
}: Options) {
  function updateSlot(
    slotId: string,
    update: (slot: DigitalAlbumPhotoSlot) => DigitalAlbumPhotoSlot,
    pageId = activePageId,
  ) {
    commit((document) => ({
      ...document,
      pages: document.pages.map((p) =>
        p.id !== pageId
          ? p
          : {
              ...p,
              photos: p.photos.map((s) => (s.id === slotId ? update(s) : s)),
            },
      ),
    }));
  }
  // Framing and caption describe this photo placement, not a future replacement.
  function selectPhoto(slotId: string, photoId: string) {
    updateSlot(slotId, (slot) =>
      slot.photoId === photoId ? slot : { id: slot.id, photoId },
    );
  }
  function removePhotoFromPage(slotId: string) {
    updateSlot(slotId, (s) => ({ id: s.id, photoId: null }));
  }
  return { selectPhoto, removePhotoFromPage, updateSlot };
}
