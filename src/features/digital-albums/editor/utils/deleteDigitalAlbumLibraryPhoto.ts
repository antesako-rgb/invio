interface DeleteEditor {
  removePhotoEverywhere: (photoId: string) => void;
  flush: () => Promise<boolean>;
  clearHistory: () => void;
}

// The caller locks editing until this sequence finishes. Membership must never
// be removed before the revisioned document save has acknowledged the removal.
export async function deleteDigitalAlbumLibraryPhoto(
  photoId: string,
  editor: DeleteEditor,
  removeMembership: () => Promise<boolean>,
): Promise<"deleted" | "save-failed" | "membership-failed"> {
  editor.removePhotoEverywhere(photoId);
  if (!(await editor.flush())) return "save-failed";

  // A failed response can be ambiguous (membership removed, cleanup/network
  // failed). Do not allow undo to restore references after attempting deletion.
  editor.clearHistory();
  try {
    return await removeMembership() ? "deleted" : "membership-failed";
  } catch {
    return "membership-failed";
  }
}
