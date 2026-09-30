"use client";
import { DialogTitle } from "@/components/ui/dialog/dialog";
import styles from "./EditorPhotoLibrary.module.css";
import { Images, Upload } from "lucide-react";
import PhotoUploadSource from "@/features/photo-upload/components/PhotoUploadSource/PhotoUploadSource";
export default function EditorPhotoSource({ labels, disabled, onUpload, onExisting }: {
  labels: { title: string; description: string; upload: string; uploadHint: string; existing: string; existingHint: string };
  disabled?: boolean; onUpload: () => void; onExisting: () => void;
}) {
  return <><DialogTitle className={styles.srOnly}>{labels.title}</DialogTitle><PhotoUploadSource title={labels.title} description={labels.description} disabled={disabled} actions={[
    { id: "upload", icon: <Upload aria-hidden="true" />, title: labels.upload, description: labels.uploadHint, onClick: onUpload },
    { id: "existing", icon: <Images aria-hidden="true" />, title: labels.existing, description: labels.existingHint, onClick: onExisting },
  ]} /></>;
}
