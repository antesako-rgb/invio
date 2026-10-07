"use client";
import { useActionError } from "@/lib/actions/useActionError";
import type { ActionErrorCode } from "@/lib/actions/actionErrorCodes";

import { useRef, useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { isSupportedLocale } from "@/i18n/config";
import { createPhotoWallMaterialAction } from "../../../actions/materials/createPhotoWallMaterialAction";
import { getAllPhotoWallMaterialTemplates } from "../../../cards/registry/photoWallMaterialTemplateRegistry.utils";
import PhotoWallMaterialTemplateGrid from "../PhotoWallMaterialTemplateGrid/PhotoWallMaterialTemplateGrid";

export default function PhotoWallMaterialTemplatePicker({ photoWallId }: { photoWallId: string }) {
  const router = useRouter();
  const locale = useLocale();
  const actionError = useActionError();
  const [pending, startTransition] = useTransition();
  const [creating, setCreating] = useState<string | null>(null);
  const [error, setError] = useState<ActionErrorCode | null>(null);
  const locked = useRef(false);
  function create(templateId: string, variantId: string) {
    if (locked.current || !isSupportedLocale(locale)) return;
    locked.current = true;
    setCreating(templateId);
    setError(null);
    startTransition(async () => {
      try {
        const result = await createPhotoWallMaterialAction({ photoWallId, templateId, variantId, locale });
        if (!result.success) { setError(result.code); return; }
        router.push(`/editor/material/${result.data.materialId}/uredi`);
      } catch { setError("MATERIAL_CREATE_FAILED"); }
      finally { locked.current = false; setCreating(null); }
    });
  }
  return <>
    {error && <p role="alert">{actionError(error)}</p>}
    <PhotoWallMaterialTemplateGrid templates={getAllPhotoWallMaterialTemplates()} disabled={pending}
      creatingTemplateId={creating} onSelect={create} />
  </>;
}
