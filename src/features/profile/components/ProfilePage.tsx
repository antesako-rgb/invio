"use client";
import { useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import Container from "@/components/layout/Container/Container";
import Page from "@/components/layout/PageContainer/Page";
import PageHeader from "@/components/ui/page-header/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { updateProfileAction } from "../actions/profileActions";
import styles from "./ProfilePage.module.css";

export default function ProfilePage() {
  const t = useTranslations("Profile");
  const { profile, updateProfile, refresh } = useAuth();
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    const form = new FormData(event.currentTarget);
    lock.current = true; setBusy(true);
    try {
      const result = await updateProfileAction({ first_name: form.get("first_name"), last_name: form.get("last_name") });
      if (!result.success) { toast.error(t(result.code === "INVALID_INPUT" ? "invalidNames" : "error")); return; }
      updateProfile(result.data); toast.success(t("saved"));
    } catch { toast.error(t("error")); }
    finally { lock.current = false; setBusy(false); }
  }
  return <Container><Page className={styles.page}>
    <PageHeader title={t("title")} description={t("description")} />
    {!profile ? <Card className={styles.card}><p role="status">{t("unavailable")}</p><Button variant="secondary" onClick={() => void refresh()}>{t("retry")}</Button></Card> :
      <Card className={styles.card}>
        <form onSubmit={save}>
          <fieldset disabled={busy} className={styles.fields}>
            <div className={styles.names} key={JSON.stringify([profile.id, profile.first_name, profile.last_name])}>
              <Field id="profile-first" label={t("firstName")}><Input id="profile-first" name="first_name" autoComplete="given-name" maxLength={100} defaultValue={profile.first_name ?? ""} /></Field>
              <Field id="profile-last" label={t("lastName")}><Input id="profile-last" name="last_name" autoComplete="family-name" maxLength={100} defaultValue={profile.last_name ?? ""} /></Field>
            </div>
            <Field id="profile-email" label={t("email")} description={t("emailHelp")}><Input id="profile-email" type="email" readOnly value={profile.email} autoComplete="email" /></Field>
            <div><Button type="submit" loading={busy}>{t("save")}</Button></div>
          </fieldset>
        </form>
      </Card>}
  </Page></Container>;
}
