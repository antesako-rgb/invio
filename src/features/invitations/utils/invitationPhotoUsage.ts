import type { InvitationDocumentPage } from "../types/invitationDocument.types";
export function getInvitationPhotoUsage(pages: InvitationDocumentPage[]) {
  const usage: Record<string, number> = {};
  const retained = new Set<string>();
  for (const page of pages) {
    for (const slot of page.photos) if (slot.photoId) usage[slot.photoId] = (usage[slot.photoId] ?? 0) + 1;
    for (const slot of page.unplacedPhotos ?? []) if (slot.photoId) retained.add(slot.photoId);
  }
  return { usage, retained };
}

export function getInvitationPhotoReferences(pages: InvitationDocumentPage[], photoId: string) {
  return pages.flatMap((page, index) => [
    ...page.photos.filter(slot => slot.photoId === photoId).map(slot => ({ pageId: page.id, pageNumber: index + 1, slotId: slot.id, retained: false })),
    ...(page.unplacedPhotos ?? []).filter(slot => slot.photoId === photoId).map(slot => ({ pageId: page.id, pageNumber: index + 1, slotId: slot.id, retained: true })),
  ]);
}
