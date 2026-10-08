"use client";
import { useActionError } from "@/lib/actions/useActionError";
import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog/dialog";
import FilePicker from "@/components/ui/file-picker/FilePicker";
import EditorExistingPhotosPicker from "@/features/editor/components/EditorExistingPhotosPicker/EditorExistingPhotosPicker";
import EditorPhotoSource from "@/features/editor/components/EditorPhotoLibrary/EditorPhotoSource";
import DigitalAlbumUpload from "../DigitalAlbumUpload/DigitalAlbumUpload";
import PhotoUploadDialog from "@/features/project-photos/upload/components/PhotoUploadDialog/PhotoUploadDialog";
import { ACCEPTED_IMAGE_TYPES_VALUE } from "@/features/project-photos/upload/constants/photoUpload.constants";
import { getDigitalAlbumProjectPhotosAction } from "../../../actions/photos/getDigitalAlbumProjectPhotosAction";
import { getProjectPhotoUrl } from "@/features/project-photos/utils/getProjectPhotoUrl";
import type { DigitalAlbumPhoto } from "../../../types/digitalAlbumPhoto.types";
interface Props {
  open: boolean; albumId: string; excludedPhotoIds?: string[]; onOpenChange: (open: boolean) => void;
  onAddExisting: (ids: string[]) => Promise<void>; onUploadSuccess: (photos: DigitalAlbumPhoto[]) => void;
}
export default function DigitalAlbumAddPhotosDialog({ open, albumId, excludedPhotoIds = [], onOpenChange, onAddExisting, onUploadSuccess }: Props) {
  const actionError = useActionError();
  const t = useTranslations("DigitalAlbumEditor.photoLibrary");
  const [step, setStep] = useState<"source" | "upload" | "existing">("source");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const loadPage = useCallback(async (offset: number) => {
    const result = await getDigitalAlbumProjectPhotosAction(albumId, offset);
    if (!result.success) throw new Error(actionError(result.code));
    return { photos: result.data.photos.map(photo => ({ id: photo.id, imageUrl: getProjectPhotoUrl(photo.image_path) })), nextOffset: result.data.nextOffset };
  }, [albumId, actionError]);
  function close() { setStep("source"); setFiles([]); onOpenChange(false); }
  return <PhotoUploadDialog open={open} disabled={busy} closeLabel={t("back")} onOpenChange={value => { if (!busy && !lock.current) { if (!value) close(); else onOpenChange(true); } }}>
    {step === "source" && <FilePicker accept={ACCEPTED_IMAGE_TYPES_VALUE} multiple onSelect={next => { if (next.length) { setFiles(next); setStep("upload"); } }}>
      {openGallery => <EditorPhotoSource disabled={busy} labels={{ title: t("add"), description: t("description"), upload: t("upload"), uploadHint: t("uploadHint"), existing: t("existing"), existingHint: t("existingHint") }} onUpload={openGallery} onExisting={() => setStep("existing")} />}
    </FilePicker>}
    {step === "upload" && <DigitalAlbumUpload albumId={albumId} initialFiles={files} onBusyChange={setBusy}
      onProgress={onUploadSuccess} onSuccess={photos => { onUploadSuccess(photos); close(); }} onBack={() => { if (!busy) setStep("source"); }} />}
    {step === "existing" && <>
      <DialogHeader><DialogTitle>{t("existing")}</DialogTitle><DialogDescription>{t("existingHint")}</DialogDescription></DialogHeader>
      <EditorExistingPhotosPicker loadPage={loadPage} excludedIds={excludedPhotoIds} disabled={busy}
        labels={{ back: t("back"), add: t("addSelected"), more: t("more"), loading: t("loading"), empty: t("empty"), error: t("error"), retry: t("retry"), select: number => t("select", { number }) }}
        onBack={() => setStep("source")} onAdd={async ids => {
          if (lock.current) return;
          lock.current = true; setBusy(true);
          try { await onAddExisting(ids); close(); } finally { lock.current = false; setBusy(false); }
        }} />
    </>}
  </PhotoUploadDialog>;
}
