"use client";

import { useEffect, useState } from "react";
import { Copy, ExternalLink } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { getInvitationRecipientLinkAction } from "../../actions/recipients/getInvitationRecipientLinkAction";
import { recipientLink } from "./recipientLink";
import styles from "./InvitationRecipients.module.css";

export default function InvitationRecipientLink({ recipientId }: { recipientId: string }) {
  const t = useTranslations("Invitations.recipients");
  const locale = useLocale();
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [copying, setCopying] = useState(false);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const result = await getInvitationRecipientLinkAction({ p_recipient_id: recipientId });
        if (!active) return;
        if (result.success) setLink(recipientLink(window.location.origin, locale, result.data.token));
        else setError(result.code === "NOT_FOUND" ? "linkUnavailable" : result.code === "FORBIDDEN" ? "linkForbidden" : "linkFailed");
      } catch { if (active) setError("linkFailed"); }
    }
    void load();
    return () => { active = false; };
  }, [recipientId, locale, attempt]);
  async function copy() {
    if (!link || copying) return;
    setCopying(true);
    try { await navigator.clipboard.writeText(link); toast.success(t("copied")); }
    catch { toast.error(t("copyFailed")); }
    finally { setCopying(false); }
  }
  return <section className={styles.detailGroup}><h3>{t("linkLabel")}</h3>
    {error ? <><p role="status" className={styles.hint}>{t(error)}</p>{error === "linkFailed" && <Button variant="secondary" onClick={() => { setError(null); setAttempt(value => value + 1); }}>{t("linkRetry")}</Button>}</> : link ? <div className={styles.linkActions}>
      <Button variant="secondary" loading={copying} onClick={() => void copy()}><Copy aria-hidden="true" />{t("copyLink")}</Button>
      <ButtonLink variant="outline" href={link} target="_blank" rel="noopener noreferrer"><ExternalLink aria-hidden="true" />{t("openLink")}</ButtonLink>
    </div> : <p role="status" className={styles.hint}>{t("linkLoading")}</p>}
  </section>;
}
