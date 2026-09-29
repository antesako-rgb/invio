"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { respondToCollaborationInvite } from "../actions/collaborationUiActions";
import styles from "./Collaboration.module.css";

export default function CollaborationInviteResponse({ email }: { email: string | null }) {
  const t = useTranslations("Projects.collaboration.response");
  const locale = useLocale();
  const [token, setToken] = useState("");
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const [result, setResult] = useState<{ response: "accept" | "decline"; projectId: string } | null>(null);
  useEffect(() => {
    const received = new URLSearchParams(window.location.hash.slice(1)).get("token");
    if (received) {
      // Keep the secret in component memory after reading the shared link.
      const timer = setTimeout(() => {
        setToken(received);
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);
  function loadLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(false);
    try {
      const url = new URL(input);
      const value = new URLSearchParams(url.hash.slice(1)).get("token");
      if (url.origin !== window.location.origin || !value || value.length > 2048) throw new Error();
      setToken(value); setInput("");
    } catch { setError(true); }
  }
  async function respond(response: "accept" | "decline") {
    if (pending) return;
    setPending(true); setError(false);
    try {
      const outcome = await respondToCollaborationInvite(token, response);
      if (!outcome.success) { setError(true); return; }
      setToken(""); setResult({ response, projectId: outcome.projectId });
    } catch { setError(true); } finally { setPending(false); }
  }
  return <Card className={styles.card}>
    <CardTitle>{t("title")}</CardTitle>
    {result ? <>
      <p role="status">{t(result.response === "accept" ? "accepted" : "declined")}</p>
      <ButtonLink size="lg" href={result.response === "accept" ? `/dashboard/projects/${result.projectId}` : "/dashboard"}>{t("continue")}</ButtonLink>
    </> : <>
      <p className={styles.description}>{email ? t("account", { email }) : t("signInHelp")}</p>
      {!token ? <form className={styles.form} onSubmit={loadLink}>
        <Field id="received-link" label={t("link")} description={t("linkHelp")}>
          <Input id="received-link" type="url" required value={input} onChange={event => setInput(event.target.value)} />
        </Field>
        <div className={styles.actions}><Button type="submit" size="lg">{t("load")}</Button></div>
      </form> : email ? <div className={styles.actions}>
        <Button size="lg" disabled={pending} loading={pending} onClick={() => respond("accept")}>{t("accept")}</Button>
        <Button size="lg" variant="outline" disabled={pending} onClick={() => respond("decline")}>{t("decline")}</Button>
      </div> : <div className={styles.actions}>
        <ButtonLink size="lg" href={{ pathname: "/prijava", query: { next: `/${locale}/suradnja/poziv#${new URLSearchParams({ token })}` } }}>{t("signIn")}</ButtonLink>
      </div>}
      {error && <p className={styles.error} role="alert">{t("error")}</p>}
    </>}
  </Card>;
}
