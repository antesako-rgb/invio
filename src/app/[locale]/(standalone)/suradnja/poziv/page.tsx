import type { Metadata } from "next";
import Container from "@/components/layout/Container/Container";
import Page from "@/components/layout/PageContainer/Page";
import { createServerClient } from "@/lib/supabase/server";
import CollaborationInviteResponse from "@/features/event-collaboration/components/CollaborationInviteResponse";

export const metadata: Metadata = { robots: { index: false, follow: false }, referrer: "no-referrer" };

export default async function CollaborationInvitePage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <Container><Page><CollaborationInviteResponse email={user?.email ?? null} /></Page></Container>;
}
