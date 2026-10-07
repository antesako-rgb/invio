import type { Metadata } from "next";
import Container from "@/components/layout/Container/Container";
import Page from "@/components/layout/PageContainer/Page";
import { createServerClient } from "@/lib/supabase/server";
import CollaborationInviteResponse from "@/features/project-collaboration/components/CollaborationInviteResponse";

export const metadata: Metadata = { robots: { index: false, follow: false }, referrer: "no-referrer" };

export default async function CollaborationInvitePage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const profile = user ? await supabase.from("profiles").select("email").eq("id", user.id).maybeSingle() : null;
  if (profile?.error) throw profile.error;
  return <Container><Page><CollaborationInviteResponse email={profile?.data?.email ?? null} isAuthenticated={!!user} /></Page></Container>;
}
