import { useTranslations } from "next-intl";
import PhotoWallMaterialRenderer from "../renderer/PhotoWallMaterialRenderer";
import { weddingMaterialPreviewContent } from "./data/weddingPreviewContent";
import { buildPhotoWallMaterialDisplay } from "../renderer/data/buildPhotoWallMaterialDisplay";
import styles from "./PhotoWallMaterialPreview.module.css";

export default function PhotoWallMaterialPreview({ templateId, variantId, locale }: {
  templateId: string; variantId: string; locale: string;
}) {
  const t = useTranslations("PhotoWallMaterialContent.wedding");
  const labels = useTranslations("PhotoWalls.editor");
  const content = { ...weddingMaterialPreviewContent, hero: {
    ...weddingMaterialPreviewContent.hero, title: t("heroTitle"), subtitle: t("heroSubtitle") || null,
  }, description: t("description") };
  return <div className={styles.page}><div className={styles.paper}>
    <PhotoWallMaterialRenderer templateId={templateId} variantId={variantId} mode="export"
      data={{ type: "", content, presentation: {}, photoWallUrl: null, display: buildPhotoWallMaterialDisplay(content, locale) }} />
    <p className={styles.note}>{labels("qr.catalog")}</p>
  </div></div>;
}
