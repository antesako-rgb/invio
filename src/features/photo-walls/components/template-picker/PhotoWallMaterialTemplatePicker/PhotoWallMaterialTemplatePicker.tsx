"use client";

import { useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { isSupportedLocale } from "@/i18n/config";
import { createPhotoWallMaterialAction } from "../../../actions/materials/createPhotoWallMaterialAction";
import { getAllPhotoWallMaterialTemplates } from "../../../cards/registry/photoWallMaterialTemplateRegistry.utils";
import PhotoWallMaterialTemplateGrid from "../PhotoWallMaterialTemplateGrid/PhotoWallMaterialTemplateGrid";

export default function PhotoWallMaterialTemplatePicker({ photoWallId }: { photoWallId: string }) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("PhotoWalls.editor");
  const [pending, startTransition] = useTransition();
  const [creating, setCreating] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const locked = useRef(false);
  function create(templateId: string, variantId: string) {
    if (locked.current || !isSupportedLocale(locale)) return;
    locked.current = true;
    setCreating(templateId);
    setError(false);
    startTransition(async () => {
      try {
        const result = await createPhotoWallMaterialAction({ photoWallId, templateId, variantId, locale });
        if (!result.success) { setError(true); return; }
        router.push(`/editor/material/${result.materialId}/uredi`);
      } catch { setError(true); }
      finally { locked.current = false; setCreating(null); }
    });
  }
  return <>
    {error && <p role="alert">{t("errors.CREATE_FAILED")}</p>}
    <PhotoWallMaterialTemplateGrid templates={getAllPhotoWallMaterialTemplates()} disabled={pending}
      creatingTemplateId={creating} onSelect={create} />
  </>;
}
