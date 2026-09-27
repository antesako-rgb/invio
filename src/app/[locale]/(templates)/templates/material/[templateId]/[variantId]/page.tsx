import { notFound } from "next/navigation";
import PhotoWallMaterialPreview from "@/features/photo-walls/preview/PhotoWallMaterialPreview";
import { getPhotoWallMaterialVariantConfig } from "@/features/photo-walls/cards/registry/photoWallMaterialTemplateRegistry.utils";
export default async function MaterialPreviewPage({ params }: { params: Promise<{ locale: string; templateId: string; variantId: string }> }) {
 const { locale, templateId, variantId } = await params;
 if (!getPhotoWallMaterialVariantConfig(templateId, variantId)) notFound();
 return <PhotoWallMaterialPreview locale={locale} templateId={templateId} variantId={variantId} />;
}