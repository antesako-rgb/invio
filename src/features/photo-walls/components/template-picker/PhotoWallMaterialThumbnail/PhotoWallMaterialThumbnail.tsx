"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Json } from "@/lib/supabase/database.types";
import { weddingMaterialPreviewContent } from "../../../preview/data/weddingPreviewContent";
import { parsePhotoWallMaterialContent } from "../../../renderer/parsers/parsePhotoWallMaterialContent";
import { parsePhotoWallMaterialPresentation } from "../../../renderer/parsers/parsePhotoWallMaterialPresentation";
import { buildPhotoWallMaterialDisplay } from "../../../renderer/data/buildPhotoWallMaterialDisplay";
import PhotoWallMaterialRenderer from "../../../renderer/PhotoWallMaterialRenderer";
import styles from "./PhotoWallMaterialThumbnail.module.css";

export default function PhotoWallMaterialThumbnail({ templateId, variantId, content: savedContent, presentation: savedPresentation, photoWallUrl = null }: {
  templateId: string; variantId: string; content?: Json; presentation?: Json; photoWallUrl?: string | null;
}) {
  const locale = useLocale();
  const t = useTranslations("PhotoWallMaterialContent.wedding");
  const content = savedContent === undefined ? {
    ...weddingMaterialPreviewContent,
    hero: { ...weddingMaterialPreviewContent.hero, title: t("heroTitle"), subtitle: t("heroSubtitle") || null },
    description: t("description"),
  } : parsePhotoWallMaterialContent(savedContent);
  return <div className={styles.thumbnail} aria-hidden="true">
    <PhotoWallMaterialRenderer templateId={templateId} variantId={variantId} mode="export" data={{
      type: "", content, presentation: parsePhotoWallMaterialPresentation(savedPresentation ?? {}),
      photoWallUrl, display: buildPhotoWallMaterialDisplay(content, locale),
    }} />
  </div>;
}
