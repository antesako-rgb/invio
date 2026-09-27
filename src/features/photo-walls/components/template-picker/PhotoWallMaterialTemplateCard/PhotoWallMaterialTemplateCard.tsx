"use client";

import { useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import PhotoWallMaterialThumbnail from "../PhotoWallMaterialThumbnail/PhotoWallMaterialThumbnail";
import { photoWallMaterialVariants } from "../../../config/photoWallMaterialVariants";
import type { PhotoWallMaterialTemplateConfig } from "../../../types/photoWallMaterialTemplateConfig.types";
import styles from "./PhotoWallMaterialTemplateCard.module.css";

export default function PhotoWallMaterialTemplateCard({ templateId, template, disabled = false, isCreating = false, onSelect }: {
  templateId: string; template: PhotoWallMaterialTemplateConfig; disabled?: boolean; isCreating?: boolean;
  onSelect: (templateId: string, variantId: string) => void;
}) {
  const t = useTranslations("PhotoWallMaterialTemplates");
  const [variantId, setVariantId] = useState(template.defaultVariantId);
  return <article className={styles.card}>
    <div className={styles.preview}><div className={styles.paper}>
      <PhotoWallMaterialThumbnail templateId={templateId} variantId={variantId} />
    </div></div>
    <div className={styles.body}>
      <h3>{t(`templates.${templateId}.name`)}</h3>
      <p>{t(`templates.${templateId}.description`)}</p>
      <small>{template.card.widthMm} × {template.card.heightMm} mm</small>
      <div className={styles.variants} role="group" aria-label={t("variantSelector")}>
        {template.variants.map(variant => {
          const value = photoWallMaterialVariants[variant.id];
          const style: CSSProperties & { "--swatch": string } = { "--swatch": value.swatch };
          return <button key={variant.id} type="button" className={styles.swatch} style={style}
            disabled={disabled} aria-label={value.label} title={value.label} aria-pressed={variantId === variant.id}
            onClick={() => setVariantId(variant.id)} />;
        })}
      </div>
      <Button disabled={disabled} onClick={() => onSelect(templateId, variantId)}>{t(isCreating ? "creating" : "useTemplate")}</Button>
    </div>
  </article>;
}
