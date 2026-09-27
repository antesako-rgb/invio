import { getLocale, getTranslations } from "next-intl/server";
import { isSupportedLocale, defaultLocale } from "@/i18n/config";
import { ButtonLink } from "@/components/ui/button-link";
import PageHeader from "@/components/ui/page-header/PageHeader";
import { getPhotoWallMaterialTemplateConfig, getPhotoWallMaterialVariantConfig } from "../../cards/registry/photoWallMaterialTemplateRegistry.utils";
import PhotoWallMaterialTemplatePicker from "../template-picker/PhotoWallMaterialTemplatePicker/PhotoWallMaterialTemplatePicker";
import PhotoWallMaterialThumbnail from "../template-picker/PhotoWallMaterialThumbnail/PhotoWallMaterialThumbnail";
import { getPhotoWallMaterials } from "../../repositories/materials/getPhotoWallMaterials";
import { buildPublicPhotoWallUrl } from "../../utils/buildPublicPhotoWallUrl";
import type { PhotoWall } from "../../types/photoWall.types";
import styles from "./PhotoWallMaterials.module.css";

export default async function PhotoWallMaterials({ photoWall }: { photoWall: PhotoWall }) {
  const [t, materials, locale] = await Promise.all([
    getTranslations("PhotoWalls.materials"), getPhotoWallMaterials(photoWall.id), getLocale(),
  ]);
  const photoWallUrl = buildPublicPhotoWallUrl(isSupportedLocale(locale) ? locale : defaultLocale, photoWall.public_id);
  return <>
    <PageHeader title={t("title")} description={t("description")} />
    {materials.length > 0 && <div className={styles.grid}>
      {materials.map(material => {
        const config = getPhotoWallMaterialTemplateConfig(material.template_id);
        const supported = getPhotoWallMaterialVariantConfig(material.template_id, material.variant_id);
        return <article className={styles.card} key={material.id}>
          {supported && <div className={styles.preview}><div className={styles.paper}>
            <PhotoWallMaterialThumbnail templateId={material.template_id} variantId={material.variant_id}
              content={material.content} presentation={material.presentation} photoWallUrl={photoWallUrl} />
          </div></div>}
          <div className={styles.body}>
            <h2>{material.name}</h2>
            <p>{config && supported ? `${config.card.widthMm} × ${config.card.heightMm} mm` : t("unsupported")}</p>
            {supported && <ButtonLink variant="outline" href={`/editor/material/${material.id}/uredi`}>{t("preview")}</ButtonLink>}
          </div>
        </article>;
      })}
    </div>}
    <h2 className={styles.sectionTitle}>{t("templates")}</h2>
    <PhotoWallMaterialTemplatePicker photoWallId={photoWall.id} />
  </>;
}
