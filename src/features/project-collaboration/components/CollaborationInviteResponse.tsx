"use client";
import { useActionError } from "@/lib/actions/useActionError";
import type { ActionErrorCode } from "@/lib/actions/actionErrorCodes";

import { useEffect, useState, type FormEvent } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { respondToCollaborationInvite } from "../actions/collaborationUiActions";
import { respondToReceivedCollaborationAction } from "../actions/respondToReceivedCollaborationAction";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import styles from "./Collaboration.module.css";

export default function CollaborationInviteResponse({ email, isAuthenticated, inviteId, projectName, expiresAt }: {
  email: string | null; isAuthenticated: boolean; inviteId?: string; projectName?: string; expiresAt?: string;
}) {
  const actionError = useActionError();
  const t = useTranslations("Projects.collaboration.response");
  const locale = useLocale();
  const format = useFormatter();
  const router = useRouter();
  const [token, setToken] = useState("");
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<ActionErrorCode | null>(null);
  const [result, setResult] = useState<{ response: "accept" | "decline"; projectId: string } | null>(null);
  useEffect(() => {
    if (inviteId) return;
    const received = new URLSearchParams(window.location.hash.slice(1)).get("token");
    if (received) {
      // Keep the secret in component memory after reading the shared link.
      const timer = setTimeout(() => {
        setToken(received);
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [inviteId]);
  function loadLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(null);
    try {
      const url = new URL(input);
      const value = new URLSearchParams(url.hash.slice(1)).get("token");
      if (url.origin !== window.location.origin || !value || value.length > 2048) throw new Error();
      setToken(value); setInput("");
    } catch { setError("COLLABORATION_FAILED"); }
  }
  async function respond(response: "accept" | "decline") {
    if (pending) return;
    setPending(true); setError(null);
    try {
      const outcome = inviteId
        ? await respondToReceivedCollaborationAction(inviteId, response)
        : await respondToCollaborationInvite(token, response);
      if (!outcome.success) { setError(outcome.code); return; }
      if (inviteId) {
        toast.success(t(response === "accept" ? "accepted" : "declined"));
        router.replace(response === "accept" ? `/dashboard/projects/${outcome.data}` : "/dashboard");
        return;
      }
      setToken(""); setResult({ response, projectId: outcome.data });
    } catch { setError("COLLABORATION_FAILED"); } finally { setPending(false); }
  }
  return <Card className={styles.card}>
    <CardTitle>{t("title")}</CardTitle>
    {projectName && <h2 className={styles.eventName}>{projectName}</h2>}
    {result ? <>
      <p role="status">{t(result.response === "accept" ? "accepted" : "declined")}</p>
      <ButtonLink size="lg" href={result.response === "accept" ? `/dashboard/projects/${result.projectId}` : "/dashboard"}>{t("continue")}</ButtonLink>
    </> : <>
      <p className={styles.description}>{email ? t("account", { email }) : t(isAuthenticated ? "accountHelp" : "signInHelp")}</p>
      {expiresAt && <p className={styles.description}>{t("expires", { date: format.dateTime(new Date(expiresAt), { dateStyle: "medium", timeStyle: "short" }) })}</p>}
      {!token && !inviteId ? <form className={styles.form} onSubmit={loadLink}>
        <Field id="received-link" label={t("link")} description={t("linkHelp")}>
          <Input id="received-link" type="url" required value={input} onChange={event => setInput(event.target.value)} />
        </Field>
        <div className={styles.actions}><Button type="submit" size="lg">{t("load")}</Button></div>
      </form> : isAuthenticated ? <div className={styles.actions}>
        <Button size="lg" disabled={pending} loading={pending} onClick={() => respond("accept")}>{t("accept")}</Button>
        <Button size="lg" variant="outline" disabled={pending} onClick={() => respond("decline")}>{t("decline")}</Button>
      </div> : <div className={styles.actions}>
        <ButtonLink size="lg" href={{ pathname: "/prijava", query: { next: `/${locale}/suradnja/poziv#${new URLSearchParams({ token })}` } }}>{t("signIn")}</ButtonLink>
      </div>}
      {error && <p className={styles.error} role="alert">{actionError(error)}</p>}
    </>}
  </Card>;
}
