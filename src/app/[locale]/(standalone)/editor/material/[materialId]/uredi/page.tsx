import { notFound } from "next/navigation";
import { getPhotoWallMaterial } from "@/features/photo-walls/repositories/materials/getPhotoWallMaterial";
import { getPhotoWall } from "@/features/photo-walls/repositories/photo-wall/getPhotoWall";
import { getPhotoWallMaterialVariantConfig } from "@/features/photo-walls/cards/registry/photoWallMaterialTemplateRegistry.utils";
import { buildPhotoWallMaterialRenderData } from "@/features/photo-walls/renderer/data/buildPhotoWallMaterialRenderData";
import PhotoWallMaterialEditorView from "@/features/photo-walls/editor/components/PhotoWallMaterialEditorView/PhotoWallMaterialEditorView";
import type { Locale } from "@/i18n/config";

export default async function MaterialEditorPage({ params }: { params: Promise<{ materialId: string; locale: Locale }> }) {
  const { materialId, locale } = await params;
  const material = await getPhotoWallMaterial(materialId);
  if (!material || !getPhotoWallMaterialVariantConfig(material.template_id, material.variant_id)) notFound();
  const wall = await getPhotoWall(material.photo_wall_id);
  if (!wall) notFound();
  const data = buildPhotoWallMaterialRenderData({ material, locale, photoWallPublicId: wall.public_id });
  return <PhotoWallMaterialEditorView key={material.id} materialId={material.id} materialName={material.name}
    updatedAt={material.updated_at} eventId={wall.event_id} isPublic={wall.is_public}
    templateId={material.template_id} variantId={material.variant_id} locale={locale} data={data} />;
}
