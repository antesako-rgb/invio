"use client";
import { useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { createAlbumEntryAction } from "../../actions/createAlbumEntryAction";
import styles from "./CreateAlbumForm.module.css";

export default function CreateAlbumForm({ projectId }: { projectId?: string }) {
  const t = useTranslations("Projects.create");
  const router = useRouter();
  const [name, setName] = useState("");
  const [savedProjectId, setSavedProjectId] = useState(projectId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const lock = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || !name.trim()) return;
    lock.current = true; setBusy(true); setError(false);
    try {
      const result = await createAlbumEntryAction({ name: name.trim(), ...(savedProjectId ? { projectId: savedProjectId } : {}) });
      if (!result.success) { setSavedProjectId(result.projectId ?? savedProjectId); setError(true); return; }
      router.push(`/editor/album/${result.albumId}/uredi`); router.refresh();
    } catch { setError(true); }
    finally { lock.current = false; setBusy(false); }
  }
  return <form className={styles.form} onSubmit={submit} aria-busy={busy}>
    <Field id="album-name" label={t("albumName")}><Input id="album-name" required maxLength={150} value={name} disabled={busy} onChange={event => setName(event.target.value)} placeholder={t("albumPlaceholder")} /></Field>
    {error && <p role="alert" className={styles.error}>{t(!projectId && savedProjectId ? "partialError" : "error")}</p>}
    <div className={styles.actions}>
      <Button type="submit" disabled={busy || !name.trim()} loading={busy}>{t("createAlbum")}</Button>
      <ButtonLink href={savedProjectId ? `/dashboard/projects/${savedProjectId}` : "/dashboard/projects/new"} variant="ghost">{t(savedProjectId && error ? "openSaved" : "cancel")}</ButtonLink>
    </div>
  </form>;
}
