"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import EditorSidebar from "@/features/editor/components/EditorSidebar/EditorSidebar";
import { photoWallMaterialFields } from "../../../content/photoWallMaterialFields";
import { getAllPhotoWallMaterialTemplates, getPhotoWallMaterialTemplateConfig } from "../../../cards/registry/photoWallMaterialTemplateRegistry.utils";
import { photoWallMaterialVariants } from "../../../config/photoWallMaterialVariants";
import PhotoWallMaterialThumbnail from "../../../components/template-picker/PhotoWallMaterialThumbnail/PhotoWallMaterialThumbnail";
import type { PhotoWallMaterialDraft } from "../../../validation/photoWallMaterial.schema";
import type { PhotoWallMaterialEditorStep } from "../../types/photoWallMaterialEditor.types";
import styles from "./PhotoWallMaterialEditorSidebar.module.css";

export default function PhotoWallMaterialEditorSidebar({ draft, step, photoWallUrl, isPublic, onChange }: {
  draft: PhotoWallMaterialDraft; step: PhotoWallMaterialEditorStep;
  photoWallUrl: string | null; isPublic: boolean;
  onChange: (draft: PhotoWallMaterialDraft) => void;
}) {
  const t = useTranslations("PhotoWalls.editor");
  const templates = useTranslations("PhotoWallMaterialTemplates");
  const id = useId();
  const config = getPhotoWallMaterialTemplateConfig(draft.templateId);
  if (!config) return null;
  const titlePresentation = draft.presentation.elements?.["hero.title"];
  return <EditorSidebar title={t(`navigation.${step}`)}>
    <div className={styles.panel}>
      {step === "content" && <>
        <label className={styles.field}>
          <span>{t("fields.materialName")}</span>
          <input value={draft.name} maxLength={100} onChange={event => onChange({ ...draft, name: event.target.value })} />
        </label>
        <p className={styles.hint}>{t("contentHint")}</p>
        {config.fields.map(key => {
          const field = photoWallMaterialFields[key];
          const props = {
            id: `${id}-${key}`, value: field.get(draft.content) ?? "", maxLength: field.maxLength,
            onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              onChange({ ...draft, content: field.set(draft.content, event.target.value || null) }),
          };
          return <label className={styles.field} key={key} htmlFor={props.id}>
            <span>{t(`fields.${field.label}`)}</span>
            {field.type === "textarea" ? <textarea {...props} rows={4} /> : <input {...props} type={field.type} />}
          </label>;
        })}
      </>}
      {step === "design" && <>
        <p className={styles.hint}>{t("designHint")}</p>
        <div className={styles.templates} role="group" aria-label={t("template")}>
          {getAllPhotoWallMaterialTemplates().map(({ id: templateId, config: template }) =>
            <button key={templateId} type="button" className={styles.template} aria-pressed={draft.templateId === templateId}
              onClick={() => onChange({ ...draft, templateId, variantId:
                template.variants.some(v => v.id === draft.variantId) ? draft.variantId : template.defaultVariantId })}>
              <div className={styles.thumbnail}><PhotoWallMaterialThumbnail templateId={templateId} variantId={
                template.variants.some(v => v.id === draft.variantId) ? draft.variantId : template.defaultVariantId
              } /></div>
              <span>{templates(`templates.${templateId}.name`)}</span>
              <small>{template.card.widthMm} × {template.card.heightMm} mm</small>
            </button>)}
        </div>
        <label className={styles.field}><span>{t("variant")}</span>
          <select value={draft.variantId} onChange={event => onChange({ ...draft, variantId: event.target.value })}>
            {config.variants.map(variant => <option key={variant.id} value={variant.id}>{photoWallMaterialVariants[variant.id].label}</option>)}
          </select>
        </label>
        {config.titleStyle && <>
          <label className={styles.field}><span>{t("titleScale")}</span>
            <input type="range" min={0.85} max={1.15} step={0.05} value={titlePresentation?.font_scale ?? 1}
              onChange={event => onChange({ ...draft, presentation: { ...draft.presentation, elements: {
                ...draft.presentation.elements, "hero.title": { ...titlePresentation, font_scale: Number(event.target.value) },
              } } })} />
          </label>
          <button type="button" className={styles.reset} onClick={() => {
            const elements = { ...draft.presentation.elements };
            delete elements["hero.title"];
            onChange({ ...draft, presentation: { ...draft.presentation, elements } });
          }}>{t("resetTitle")}</button>
        </>}
      </>}
      {step === "qr" && <>
        <p className={styles.hint}>{t("qr.description")}</p>
        <div className={styles.destination}><span>{t("qr.destination")}</span><code>{photoWallUrl}</code></div>
        <p className={styles.availability} data-public={isPublic}>{t(isPublic ? "qr.public" : "qr.private")}</p>
        <p className={styles.hint}>{t("qr.fixed")}</p>
      </>}
    </div>
  </EditorSidebar>;
}
