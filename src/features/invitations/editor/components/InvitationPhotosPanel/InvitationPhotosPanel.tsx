"use client";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog/dialog";
import { Button } from "@/components/ui/button";
import FilePicker from "@/components/ui/file-picker/FilePicker";
import EditorPhotoSource from "@/features/editor/components/EditorPhotoLibrary/EditorPhotoSource";
import EditorPhotoLibrary from "@/features/editor/components/EditorPhotoLibrary/EditorPhotoLibrary";
import EditorLibraryPhoto from "@/features/editor/components/EditorPhotoLibrary/EditorLibraryPhoto";
import EditorExistingPhotosPicker from "@/features/editor/components/EditorExistingPhotosPicker/EditorExistingPhotosPicker";
import { getProjectPhotoUrl } from "@/features/project-photos/utils/getProjectPhotoUrl";
import { getInvitationProjectPhotosAction } from "../../../actions/photos/invitationPhotoActions";
import type { InvitationPhotoWithPhoto } from "../../../types/invitationPhoto.types";
import EditorPhotoDescription from "@/features/editor/components/EditorPhotoDescription/EditorPhotoDescription";
import InvitationPhotoUpload from "./InvitationPhotoUpload";
import styles from "./InvitationPhotosPanel.module.css";
interface InvitationPhotosPanelProps {
  onDescriptionSave: (id: string, value: string) => Promise<void>;
  invitationId: string; photos: InvitationPhotoWithPhoto[]; disabled: boolean; picking: boolean;
  photoUsage: Record<string, number>; retainedPhotoIds: ReadonlySet<string>;
  selectionLabel?: string; selectedPhotoId?: string | null;
  onUpload: (file: File, description: string) => Promise<void>; onImport: (ids: string[]) => Promise<void>;
  onSelect: (id: string) => void; onDelete: (id: string) => void; onCancel: () => void;
}
export default function InvitationPhotosPanel({ onDescriptionSave, invitationId, photos, disabled, picking, photoUsage, retainedPhotoIds, selectionLabel, selectedPhotoId, onUpload, onImport, onSelect, onDelete, onCancel }: InvitationPhotosPanelProps) {
  const t = useTranslations("Invitations");
  const l = useTranslations("Invitations.photoLibrary");
  const [step, setStep] = useState<"source" | "existing" | "upload" | null>(null);
  const [uploadFile, setUploadFile] = useState<{ file: File; preview: string } | null>(null);
  useEffect(() => () => { if (uploadFile) URL.revokeObjectURL(uploadFile.preview); }, [uploadFile]);
  const loadPage = useCallback(async (offset: number) => {
    const result = await getInvitationProjectPhotosAction(invitationId, offset);
    if (!result.success) throw new Error(result.message);
    return { photos: result.data.photos.map(photo => ({ id: photo.id, imageUrl: getProjectPhotoUrl(photo.image_path) })), nextOffset: result.data.nextOffset };
  }, [invitationId]);
  return <>
    <EditorPhotoLibrary picking={picking} addLabel={l("add")} empty={photos.length === 0} emptyLabel={t("photoUx.empty")} disabled={disabled} onAdd={() => setStep("source")}
      header={<>
        {picking && <Button variant="ghost" disabled={disabled} onClick={onCancel}><ArrowLeft aria-hidden="true" />{t(selectedPhotoId ? "photoInspector.back" : "photoInspector.library")}</Button>}
        {picking && <p className={styles.hint}>{selectionLabel}</p>}
        <p className={styles.hint}>{picking ? t("photoUx.chooseHint") : l("count", { count: photos.length, used: photos.filter(photo => photoUsage[photo.photo_id]).length })}</p>
      </>}>
      {photos.map((photo, index) => {
        const uses = photoUsage[photo.photo_id] ?? 0;
        const retained = retainedPhotoIds.has(photo.photo_id);
        return <EditorLibraryPhoto key={photo.photo_id}
          descriptionControl={!picking && <EditorPhotoDescription compact value={photo.description} disabled={disabled} onSave={value => onDescriptionSave(photo.photo_id, value)} />} selectable={picking} selected={selectedPhotoId === photo.photo_id} disabled={disabled}
          isUsed={uses > 0 || retained} imageUrl={getProjectPhotoUrl(photo.photo.image_path)}
          selectLabel={t("editor.selectPhoto", { number: index + 1 }) + (uses ? ". " + l("used", { count: uses }) : "")}
          deleteLabel={t("editor.deletePhoto")}
          usageBadge={uses ? (uses === 1 ? "\u2713" : `${uses}\u00d7`) : l("retained")}
          onSelect={() => onSelect(photo.photo_id)} onDelete={picking ? undefined : () => onDelete(photo.photo_id)} />;
      })}
    </EditorPhotoLibrary>
    <Dialog open={step !== null} onOpenChange={open => { if (!open && !disabled) { setStep(null); setUploadFile(null); } }}>
      <DialogContent>
        {step === "source" && <FilePicker accept="image/jpeg,image/png,image/webp" onSelect={files => {
          if (!files[0] || disabled) return;
          setUploadFile({ file: files[0], preview: URL.createObjectURL(files[0]) }); setStep("upload");
        }}>
          {openGallery => <EditorPhotoSource disabled={disabled} onUpload={openGallery} onExisting={() => setStep("existing")}
            labels={{ title: l("add"), description: l("description"), upload: l("upload"), uploadHint: t("editor.uploadHint"), existing: l("existing"), existingHint: l("existingHint") }} />}
        </FilePicker>}
        {step === "upload" && uploadFile && <InvitationPhotoUpload file={uploadFile.file} preview={uploadFile.preview} disabled={disabled} onUpload={onUpload}
          onBack={() => { setUploadFile(null); setStep("source"); }}
          onSuccess={() => { setUploadFile(null); setStep(null); }} />}
        {step === "existing" && <>
          <DialogHeader><DialogTitle>{l("existing")}</DialogTitle><DialogDescription>{l("existingHint")}</DialogDescription></DialogHeader>
          <EditorExistingPhotosPicker loadPage={loadPage} excludedIds={photos.map(photo => photo.photo_id)} disabled={disabled}
            labels={{ back: l("back"), add: l("addSelected"), more: l("more"), loading: l("loading"), empty: l("empty"), error: l("error"), retry: l("retry"), select: number => l("select", { number }) }}
            onBack={() => setStep("source")} onAdd={async ids => { await onImport(ids); setStep(null); }} />
        </>}
      </DialogContent>
    </Dialog>
  </>;
}
