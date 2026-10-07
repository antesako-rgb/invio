"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog/dialog";
import PhotoWallMaterialEditor from "../PhotoWallMaterialEditor/PhotoWallMaterialEditor";
import PhotoWallMaterialEditorHeader from "../PhotoWallMaterialEditorHeader/PhotoWallMaterialEditorHeader";
import PhotoWallMaterialEditorSidebar from "../PhotoWallMaterialEditorSidebar/PhotoWallMaterialEditorSidebar";
import PhotoWallMaterialRenderer from "../../../renderer/PhotoWallMaterialRenderer";
import { buildPhotoWallMaterialDisplay } from "../../../renderer/data/buildPhotoWallMaterialDisplay";
import { getPhotoWallMaterialTemplateConfig } from "../../../cards/registry/photoWallMaterialTemplateRegistry.utils";
import { usePhotoWallMaterialEditor } from "../../hooks/usePhotoWallMaterialEditor";
import type { PhotoWallMaterialEditorStep } from "../../types/photoWallMaterialEditor.types";
import type { PhotoWallMaterialRenderData } from "../../../types/photoWallMaterialRenderer.types";
import styles from "./PhotoWallMaterialEditorView.module.css";

export interface PhotoWallMaterialEditorViewProps {
  materialId: string; materialName: string; templateId: string; variantId: string;
  updatedAt: string; photoWallId: string; isPublic: boolean; locale: string;
  data: PhotoWallMaterialRenderData;
}

export default function PhotoWallMaterialEditorView(props: PhotoWallMaterialEditorViewProps) {
  const t = useTranslations("PhotoWalls.editor");
  const router = useRouter();
  const editor = usePhotoWallMaterialEditor(props.materialId, {
    name: props.materialName, templateId: props.templateId, variantId: props.variantId,
    content: props.data.content, presentation: props.data.presentation,
  }, props.updatedAt);
  const { draft, setDraft } = editor;
  const [step, setStep] = useState<PhotoWallMaterialEditorStep>("content");
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [overflow, setOverflow] = useState(false);
  const paper = useRef<HTMLDivElement>(null);
  const config = getPhotoWallMaterialTemplateConfig(draft.templateId);
  const data = { ...props.data, content: draft.content, presentation: draft.presentation,
    display: buildPhotoWallMaterialDisplay(draft.content, props.locale) };
  const leave = () => router.push(`/dashboard/photo-walls/${props.photoWallId}/materials`);

  useEffect(() => {
    const root = paper.current;
    if (!root) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const regions = [...root.querySelectorAll<HTMLElement>("[data-material-region]")];
        setOverflow(regions.some(region => {
          const bounds = region.getBoundingClientRect();
          return region.scrollHeight > region.clientHeight + 2 ||
            [...region.querySelectorAll<HTMLElement>("[data-material-text]")].some(text => {
              const rect = text.getBoundingClientRect();
              return rect.top < bounds.top - 2 || rect.bottom > bounds.bottom + 2 ||
                rect.left < bounds.left - 2 || rect.right > bounds.right + 2;
            });
        }));
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    document.fonts.addEventListener("loadingdone", measure);
    measure();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); document.fonts.removeEventListener("loadingdone", measure); };
  }, [draft]);

  return <>
    <PhotoWallMaterialEditor activeStep={step} onStepChange={setStep}
      header={<PhotoWallMaterialEditorHeader name={draft.name} dirty={editor.dirty} isSaving={editor.isSaving}
        error={editor.error} onSave={editor.save} onBack={() => editor.dirty || editor.isSaving ? setConfirmLeave(true) : leave()} />}
      sidebar={<PhotoWallMaterialEditorSidebar draft={draft} step={step} onChange={setDraft}
        photoWallUrl={props.data.photoWallUrl} isPublic={props.isPublic} />}>
      <div className={styles.workspace}>
        <div className={styles.caption}><span>{t("preview.title")}</span>
          <span>{config?.card.widthMm} × {config?.card.heightMm} mm</span></div>
        {editor.error && <p className={styles.message} role="alert">{t(`errors.${editor.error}`)}</p>}
        {overflow && <p className={styles.message} role="status">{t("overflow")}</p>}
        <div className={styles.paper} ref={paper}>
          <PhotoWallMaterialRenderer templateId={draft.templateId} variantId={draft.variantId} mode="edit" data={data} />
        </div>
        <p className={styles.note} role="status">{t(editor.isSaving ? "status.saving" : editor.dirty ? "status.unsaved" : "status.saved")}</p>
      </div>
    </PhotoWallMaterialEditor>
    <Dialog open={confirmLeave} onOpenChange={setConfirmLeave}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t("leave.title")}</DialogTitle><DialogDescription>{t("leave.description")}</DialogDescription></DialogHeader>
        <div className={styles.dialogActions}>
          <Button variant="outline" onClick={() => setConfirmLeave(false)}>{t("leave.stay")}</Button>
          <Button variant="destructive" disabled={editor.isSaving} onClick={leave}>{t("leave.discard")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  </>;
}
