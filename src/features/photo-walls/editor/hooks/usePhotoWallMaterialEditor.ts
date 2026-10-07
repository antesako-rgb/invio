"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { updatePhotoWallMaterialAction } from "../../actions/materials/updatePhotoWallMaterialAction";
import { photoWallMaterialDraftSchema, type PhotoWallMaterialDraft } from "../../validation/photoWallMaterial.schema";

export function usePhotoWallMaterialEditor(materialId: string, initial: PhotoWallMaterialDraft, updatedAt: string) {
  const [draft, setDraft] = useState(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const revision = useRef(updatedAt);
  const lock = useRef(false);
  const [isSaving, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const dirty = JSON.stringify(draft) !== saved;

  const save = useCallback(() => {
    if (lock.current || !dirty) return;
    const parsed = photoWallMaterialDraftSchema.safeParse(draft);
    if (!parsed.success) { setError("VALIDATION"); return; }
    const snapshot = JSON.stringify(draft);
    lock.current = true;
    setError(null);
    startTransition(async () => {
      try {
        const result = await updatePhotoWallMaterialAction({
          materialId, expectedUpdatedAt: revision.current, draft: parsed.data,
        });
        if (result.success) {
          revision.current = result.data.updatedAt;
          setSaved(JSON.stringify(parsed.data));
          setDraft(current => JSON.stringify(current) === snapshot ? parsed.data : current);
        } else {
          setError(result.code);
        }
      } catch {
        setError("SAVE_FAILED");
      } finally {
        lock.current = false;
      }
    });
  }, [dirty, draft, materialId]);

  useEffect(() => {
    if (!dirty && !isSaving) return;
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty, isSaving]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

  return { draft, setDraft, dirty, isSaving, error, save };
}
