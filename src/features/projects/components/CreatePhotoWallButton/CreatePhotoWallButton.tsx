"use client";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createPhotoWallEntryAction } from "../../actions/createPhotoWallEntryAction";

export default function CreatePhotoWallButton({ projectId }: { projectId: string }) {
  const t = useTranslations("Projects.products");
  const router = useRouter();
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  async function create() {
    if (lock.current) return;
    lock.current = true; setBusy(true);
    try {
      const result = await createPhotoWallEntryAction(projectId);
      if (!result.success) { toast.error(t("createError")); return; }
      router.push(`/dashboard/projects/${projectId}/photo-wall`); router.refresh();
    } catch { toast.error(t("createError")); }
    finally { lock.current = false; setBusy(false); }
  }
  return <Button disabled={busy} loading={busy} onClick={() => void create()}>{t("createWall")}</Button>;
}
