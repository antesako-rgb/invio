import Container from "@/components/layout/Container/Container";
import Page from "@/components/layout/PageContainer/Page";
import BackLink from "@/components/ui/back-link/BackLink";
import { Card } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { CollaborationProfileMissingError, getReceivedCollaborationInvites } from "@/features/project-collaboration/repositories/getReceivedCollaborationInvites";
import CollaborationInviteResponse from "@/features/project-collaboration/components/CollaborationInviteResponse";
import styles from "@/features/project-collaboration/components/Collaboration.module.css";

export default async function ReceivedInvitePage({ searchParams }: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const supabase = await createServerClient();
  const [auth, query, t] = await Promise.all([
    supabase.auth.getUser(), searchParams,
    getTranslations("Projects.collaboration.response"),
  ]);
  let invites: Awaited<ReturnType<typeof getReceivedCollaborationInvites>> = [];
  let profileMissing = false;
  try {
    invites = await getReceivedCollaborationInvites();
  } catch (error) {
    if (!(error instanceof CollaborationProfileMissingError)) throw error;
    profileMissing = true;
  }
  const selected = query.invite ? invites.filter(invite => invite.id === query.invite) : invites;
  const user = auth.data.user;
  const profile = user ? await supabase.from("profiles").select("email").eq("id", user.id).maybeSingle() : null;
  if (profile?.error) throw profile.error;
  const email = profile?.data?.email ?? null;
  return <Container><Page>
    <BackLink href="/dashboard" label={t("backToDashboard")} />
    {profileMissing ? <Card className={styles.card}>
      <p role="status">{t("profileMissing")}</p>
    </Card> : query.invite && !selected.length ? <Card className={styles.card}>
      <p role="status">{t("unavailable")}</p>
    </Card> : selected.map(invite => <CollaborationInviteResponse key={invite.id}
      email={email} isAuthenticated={!!user} inviteId={invite.id}
      projectName={invite.project_name} expiresAt={invite.expires_at}
    />)}
    {!query.invite && <CollaborationInviteResponse email={email} isAuthenticated={!!user} />}
  </Page></Container>;
}
