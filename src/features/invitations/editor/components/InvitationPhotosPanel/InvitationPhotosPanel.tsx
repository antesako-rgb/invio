"use client";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog/dialog";
import { Button } from "@/components/ui/button";
import { getProjectPhotoUrl } from "@/features/project-photos/utils/getProjectPhotoUrl";
import { getInvitationProjectPhotosAction } from "../../../actions/photos/invitationPhotoActions";
import type { InvitationPhotoWithPhoto } from "../../../types/invitationPhoto.types";
import type { ProjectPhoto } from "@/features/project-photos/types/projectPhoto.types";
import styles from "./InvitationPhotosPanel.module.css";
interface InvitationPhotosPanelProps {
  invitationId: string;
  photos: InvitationPhotoWithPhoto[];
  disabled: boolean;
  picking: boolean;
  selectionLabel?: string;
  selectedPhotoId?: string | null;
  onUpload: (file: File) => Promise<void>;
  onImport: (id: string) => Promise<void>;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
}

export default function InvitationPhotosPanel({ invitationId, photos, disabled, picking, selectionLabel, selectedPhotoId, onUpload, onImport, onSelect, onDelete, onCancel }: InvitationPhotosPanelProps) {
  const t = useTranslations("Invitations");
  const [library, setLibrary] = useState<ProjectPhoto[]>([]);
  const [nextOffset, setNextOffset] = useState<number | null>(0);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const lock = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const [projectPicker, setProjectPicker] = useState(false);

  async function load() {
    if (lock.current || nextOffset === null) return;

    lock.current = true;
    setLoading(true);
    setFailed(false);

    try {
      const result = await getInvitationProjectPhotosAction(invitationId, nextOffset);

      if (!result.success) {
        setFailed(true);
        return;
      }
      setLibrary(current => [
        ...new Map(
          [...current, ...result.data.photos].map(photo => [photo.id, photo]),
        ).values(),
      ]);
      setNextOffset(result.data.nextOffset);
    } catch {
      setFailed(true);
    }
    finally {
      lock.current = false;
      setLoading(false);
    }
  }
  const used = new Set(photos.map(photo => photo.photo_id));

  return <section className={styles.panel}>
    <h2>
      {t(picking ? "photoUx.choose" : "photoUx.library")}
    </h2>

    <div className={styles.context}>
      {picking && <strong>{selectionLabel}</strong>}
      <p className={styles.hint}>{t(picking ? "photoUx.chooseHint" : "photoUx.libraryHint")}</p>
      <Button variant="ghost" disabled={disabled} onClick={onCancel}>
        {t("photoUx.backToPage")}
      </Button>
    </div>
    <input
      ref={fileInput}
      className={styles.srOnly}
      tabIndex={-1}
      aria-label={t("editor.upload")}
      type="file"
      accept="image/jpeg,image/png,image/webp"
      disabled={disabled}
      onChange={event => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (file) void onUpload(file);
      }} />
    <button
      type="button"
      className={styles.uploadCard}
      disabled={disabled}
      onClick={() => fileInput.current?.click()}>
      <Plus aria-hidden="true" />
      <strong>
        {t("photoUx.upload")}
      </strong>
      <span>
        {t("editor.uploadHint")}
      </span>
    </button>
    <h3>
      {t("photoUx.available", { count: photos.length })}
    </h3>
    {!photos.length && <p className={styles.hint}>{t("photoUx.empty")}</p>}
    <div className={styles.photos}>
      {photos.map((photo, index) => <div key={photo.photo_id} className={styles.photoItem}>
        {picking ? <button
          type="button"
          disabled={disabled}
          aria-pressed={selectedPhotoId === photo.photo_id}
          onClick={() => onSelect(photo.photo_id)}
          aria-label={t("editor.selectPhoto", { number: index + 1 })}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getProjectPhotoUrl(photo.photo.image_path)}
            alt={photo.description ?? ""}
            loading="lazy" />
          <span className={styles.selectLabel}>{t(selectedPhotoId === photo.photo_id ? "photoUx.current" : "photoUx.use")}</span>
        </button> : <div className={styles.libraryPhoto}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={getProjectPhotoUrl(photo.photo.image_path)} alt={photo.description ?? t("photoUx.photoNumber", { number: index + 1 })} loading="lazy" />
        </div>}
        {!picking && <Button
          className={styles.photoRemove}
          size="icon"
          variant="secondary"
          disabled={disabled}
          aria-label={t("editor.deletePhoto")}
          title={t("editor.deletePhoto")}
          onClick={() => onDelete(photo.photo_id)}>
          <Trash2 aria-hidden="true" />
        </Button>}
      </div>)}
    </div>
    <Button
      variant="outline"
      disabled={disabled}
      onClick={() => {
        setProjectPicker(true);
        if (!library.length) void load();
      }}>
      {t("editor.projectPhotos")}
    </Button>
    <Dialog open={projectPicker} onOpenChange={setProjectPicker}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("editor.projectPhotos")}
          </DialogTitle>
          <DialogDescription>
            {t("editor.importHint")}
          </DialogDescription>
        </DialogHeader>
        <div className={styles.photos}>
          {library.filter(photo => !used.has(photo.id)).map((photo, index) => <button
            type="button"
            className={styles.importPhoto}
            key={photo.id}
            disabled={disabled}
            onClick={() => void onImport(photo.id)}
            aria-label={t("editor.importPhoto", { number: index + 1 })}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getProjectPhotoUrl(photo.image_path)} alt="" loading="lazy" />
          </button>)}
        </div>

        {nextOffset !== null && <Button
          variant="outline"
          disabled={disabled || loading}
          loading={loading}
          onClick={() => void load()}>
          {t(nextOffset === 0 ? "editor.loadProjectPhotos" : "editor.loadMore")}
        </Button>}

        {failed && <p role="alert">
          {t("error")}
        </p>}
        <Button variant="outline" onClick={() => setProjectPicker(false)}>{t("photoUx.backToPhotos")}</Button>
      </DialogContent>
    </Dialog>
  </section>;
}
