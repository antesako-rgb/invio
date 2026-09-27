"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createCollaborationLink } from "../actions/collaborationUiActions";
import styles from "./Collaboration.module.css";

export default function CollaborationLinkForm({ eventId }: { eventId: string }) {
  const t = useTranslations("Events.collaboration");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [link, setLink] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true); setError(false); setLink(""); setCopied(false);
    try {
      const result = await createCollaborationLink(eventId, email);
      if (!result.success) { setError(true); return; }
      const url = new URL(`/${locale}/suradnja/poziv`, window.location.origin);
      url.hash = new URLSearchParams({ token: result.token }).toString();
      setLink(url.toString());
    } catch { setError(true); } finally { setPending(false); }
  }
  return <form onSubmit={submit} className={styles.form}>
    <Field id="collaborator-email" label={t("email")} required>
      <Input id="collaborator-email" type="email" autoComplete="email" required maxLength={320}
        value={email} disabled={pending} onChange={event => { setEmail(event.target.value); setLink(""); }} />
    </Field>
    <p className={styles.description}>{t("linkHelp")}</p>
    <div className={styles.actions}><Button type="submit" size="lg" loading={pending}>{t("createLink")}</Button></div>
    {error && <p role="alert" className={styles.error}>{t("createError")}</p>}
    {link && <div className={styles.result}>
      <Field id="collaboration-link" label={t("link")}><Input id="collaboration-link" readOnly value={link} onFocus={event => event.target.select()} /></Field>
      <div className={styles.actions}><Button type="button" size="lg" variant="outline" onClick={async () => {
        try { await navigator.clipboard.writeText(link); setCopied(true); } catch { setError(true); }
      }}>{t(copied ? "copied" : "copy")}</Button></div>
      <p className={styles.description} role="status">{t("shareHelp", { email })}</p>
    </div>}
  </form>;
}
