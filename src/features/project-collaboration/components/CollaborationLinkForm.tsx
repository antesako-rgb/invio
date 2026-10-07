"use client";
import { useActionError } from "@/lib/actions/useActionError";
import type { ActionErrorCode } from "@/lib/actions/actionErrorCodes";

import { useState, type FormEvent } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createCollaborationLink } from "../actions/collaborationUiActions";
import { renewProjectCollaborationAction } from "../actions/renewProjectCollaborationAction";
import styles from "./Collaboration.module.css";

export default function CollaborationLinkForm({ projectId, inviteId, initialEmail = "", onBusyChange }: {
  projectId: string; inviteId?: string; initialEmail?: string; onBusyChange?: (busy: boolean) => void;
}) {
  const actionError = useActionError();
  const t = useTranslations("Projects.collaboration");
  const locale = useLocale();
  const format = useFormatter();
  const [email, setEmail] = useState(initialEmail);
  const [link, setLink] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<ActionErrorCode | null>(null);
  const [copied, setCopied] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true); setError(null); setLink(""); setCopied(false);
    onBusyChange?.(true);
    try {
      const result = inviteId
        ? await renewProjectCollaborationAction(inviteId)
        : await createCollaborationLink(projectId, email);
      if (!result.success) { setError(result.code); return; }
      const url = new URL(`/${locale}/suradnja/poziv`, window.location.origin);
      url.hash = new URLSearchParams({ token: result.data.token }).toString();
      setLink(url.toString());
      setExpiresAt(result.data.expires_at);
    } catch { setError("COLLABORATION_FAILED"); } finally { setPending(false); onBusyChange?.(false); }
  }
  return <form onSubmit={submit} className={styles.form}>
    {!inviteId && <Field id="collaborator-email" label={t("email")} required>
      <Input id="collaborator-email" type="email" autoComplete="email" required maxLength={320}
        value={email} disabled={pending} onChange={event => { setEmail(event.target.value); setLink(""); }} />
    </Field>}
    <p className={styles.description}>{t(inviteId ? "renewHelp" : "linkHelp", { email })}</p>
    {!link && <div className={styles.actions}><Button type="submit" size="lg" loading={pending}>{t(inviteId ? "renewLink" : "createLink")}</Button></div>}
    {error && <p role="alert" className={styles.error}>{actionError(error)}</p>}
    {link && <div className={styles.result}>
      <Field id={`collaboration-link-${inviteId ?? "new"}`} label={t("link")}><Input id={`collaboration-link-${inviteId ?? "new"}`} readOnly value={link} onFocus={event => event.target.select()} /></Field>
      <div className={styles.actions}><Button type="button" size="lg" variant="outline" onClick={async () => {
        try { await navigator.clipboard.writeText(link); setCopied(true); } catch { setError("COLLABORATION_FAILED"); }
      }}>{t(copied ? "copied" : "copy")}</Button></div>
      <p className={styles.description} role="status">{t("shareHelp", { email })}</p>
      {expiresAt && <p className={styles.description}>{t("expires", { date: format.dateTime(new Date(expiresAt), { dateStyle: "medium", timeStyle: "short" }) })}</p>}
    </div>}
  </form>;
}
