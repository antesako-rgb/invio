"use client";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog/dialog";
import PhotoUploadComposer from "@/features/project-photos/upload/components/PhotoUploadComposer/PhotoUploadComposer";
export default function InvitationPhotoUpload({ file, preview, disabled, onUpload, onBack, onSuccess }: {
  file: File; preview: string; disabled: boolean; onUpload: (file: File, description: string) => Promise<void>;
  onBack: () => void; onSuccess: () => void;
}) {
  const t = useTranslations("Invitations");
  const [description, setDescription] = useState("");
  const [failed, setFailed] = useState(false);
  const lock = useRef(false);
  async function submit() {
    if (disabled || lock.current) return;
    lock.current = true; setFailed(false);
    try { await onUpload(file, description); onSuccess(); }
    catch { setFailed(true); }
    finally { lock.current = false; }
  }
  return <>
    <DialogHeader><DialogTitle>{t("uploadReview.title")}</DialogTitle><DialogDescription>{t("uploadReview.hint")}</DialogDescription></DialogHeader>
    {preview && <PhotoUploadComposer previewUrl={preview} description={description}
      descriptionLabel={t("uploadReview.description")} descriptionPlaceholder={t("uploadReview.placeholder")}
      removeLabel={t("cancel")} disabled={disabled} onDescriptionChange={setDescription} onRemove={onBack} />}
    {failed && <p role="alert">{t("error")}</p>}
    <Button variant="outline" disabled={disabled} onClick={onBack}>{t("cancel")}</Button>
    <Button disabled={disabled || !preview} loading={disabled} onClick={() => void submit()}>{t("uploadReview.submit")}</Button>
  </>;
}
