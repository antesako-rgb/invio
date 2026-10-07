"use client";
import { useActionError } from "@/lib/actions/useActionError";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { updateDigitalAlbumPhotoDescriptionAction } from "../../actions/photos/updateDigitalAlbumPhotoDescriptionAction";
import { removeDigitalAlbumPhotoAction } from "../../actions/photos/removeDigitalAlbumPhotoAction";
import { getDigitalAlbumPhotoReferences } from "../../utils/digitalAlbumPhotoReferences";
import type { DigitalAlbumPhotoWithPhoto } from "../../types/digitalAlbumPhoto.types";
import { deleteDigitalAlbumLibraryPhoto } from "../utils/deleteDigitalAlbumLibraryPhoto";
import type useDigitalAlbumEditor from "./album-editor/useDigitalAlbumEditor";

type Editor = Pick<ReturnType<typeof useDigitalAlbumEditor>,
  "document" | "getDocument" | "removePhotoEverywhere" | "flush" | "clearHistory">;

export default function useDigitalAlbumPhotoLibrary({ albumId, suppliedPhotos, editor, exportBusy, onDeleted }: {
  albumId: string;
  suppliedPhotos: DigitalAlbumPhotoWithPhoto[];
  editor: Editor;
  exportBusy: boolean;
  onDeleted: () => void;
}) {
  const router = useRouter();
  const actionError = useActionError();
  const t = useTranslations("DigitalAlbumEditor.photos");
  const upgrade = useTranslations("DigitalAlbumEditor.upgrade");
  const [removedMembershipIds, setRemovedMembershipIds] = useState<Set<string>>(() => new Set());
  const [descriptions, setDescriptions] = useState<Record<string, string | null>>({});
  const photos = useMemo(() => suppliedPhotos.filter((photo) =>
    !removedMembershipIds.has(`${photo.photo_id}:${photo.created_at}`)).map(photo => Object.hasOwn(descriptions, `${photo.photo_id}:${photo.created_at}`) ? { ...photo, description: descriptions[`${photo.photo_id}:${photo.created_at}`] } : photo), [suppliedPhotos, removedMembershipIds, descriptions]);
  const [photoDialog, setPhotoDialog] = useState<{ photoId: string; used: boolean } | null>(null);
  const [assetBusy, setAssetBusy] = useState(false);
  const assetLock = useRef(false);
  const usagePhotoId = photoDialog?.photoId ?? null;
  const usagePhoto = photos.find((photo) => photo.photo_id === usagePhotoId);
  const usageReferences = useMemo(() => usagePhotoId
    ? getDigitalAlbumPhotoReferences(editor.document.pages, usagePhotoId) : [], [editor.document.pages, usagePhotoId]);

  async function updateDescription(photoId: string, value: string) {
    if (assetLock.current || exportBusy) throw new Error("Busy");
    const membership = photos.find(photo => photo.photo_id === photoId);
    if (!membership) throw new Error("Missing photo");
    assetLock.current = true; setAssetBusy(true);
    try {
      const result = await updateDigitalAlbumPhotoDescriptionAction(albumId, photoId, value);
      if (!result.success) throw new Error(actionError(result.code));
      setDescriptions(current => ({ ...current, [`${photoId}:${membership.created_at}`]: result.data.description }));
    } finally { assetLock.current = false; setAssetBusy(false); }
  }

  function requestPhotoDelete(photoId: string) {
    if (assetLock.current || exportBusy) return;
    // Keep the original destructive confirmation even if a failed save has
    // already removed the local references. A retry must still finish deletion.
    setPhotoDialog({ photoId, used: getDigitalAlbumPhotoReferences(editor.getDocument().pages, photoId).length > 0 });
  }

  function closePhotoDialog() {
    if (!assetLock.current) setPhotoDialog(null);
  }

  async function deleteLibraryPhoto() {
    if (!photoDialog || assetLock.current || exportBusy) return false;
    const photoId = photoDialog.photoId;
    const membership = photos.find((photo) => photo.photo_id === photoId);
    assetLock.current = true;
    setAssetBusy(true);
    try {
      const result = await deleteDigitalAlbumLibraryPhoto(photoId, editor,
        async () => (await removeDigitalAlbumPhotoAction({ albumId, photoId })).success);
      if (result !== "deleted") {
        toast.error(result === "save-failed" ? upgrade("saveError") : t("removeError"));
        router.refresh();
        return false;
      }
      if (membership) setRemovedMembershipIds((ids) => new Set(ids).add(`${membership.photo_id}:${membership.created_at}`));
      setPhotoDialog(null);
      onDeleted();
      toast.success(t("removeSuccess"));
      router.refresh();
      return true;
    } finally {
      assetLock.current = false;
      setAssetBusy(false);
    }
  }

  return { updateDescription, photos, photoDialog, usagePhotoId, usagePhoto, usageReferences,
    assetBusy, assetLock, requestPhotoDelete, closePhotoDialog, deleteLibraryPhoto };
}
