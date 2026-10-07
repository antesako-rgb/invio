import type { Metadata } from "next";
import PublicRsvpNotice from "@/features/invitations/components/PublicPersonalizedRsvp/PublicRsvpNotice";
import { getPublicRsvp } from "@/features/invitations/repositories/rsvp/personalizedRsvp";
import { publicRsvpError } from "@/features/invitations/actions/rsvp/publicRsvpError";
import PublicPersonalizedRsvp from "@/features/invitations/components/PublicPersonalizedRsvp/PublicPersonalizedRsvp";
import PublicInvitationPage from "@/features/invitations/pages/PublicInvitationPage/PublicInvitationPage";
import styles from "@/features/invitations/components/PublicPersonalizedRsvp/PublicPersonalizedRsvp.module.css";

export const metadata: Metadata = { referrer: "no-referrer", robots: { index: false, follow: false } };

export default async function PersonalizedRsvpPage({ params }: { params: Promise<{ token: string; locale: string }> }) {
  const { token, locale } = await params;
  let context;
  try { context = await getPublicRsvp(token); }
  catch (error) {
    const unavailable = publicRsvpError(error) === "RSVP_UNAVAILABLE";
    return <main className={styles.page}><PublicRsvpNotice unavailable={unavailable} /></main>;
  }
  return <PublicInvitationPage name={context.invitation.name} document={context.invitation.document} photos={context.photos} locale={locale}
    rsvpContent={<PublicPersonalizedRsvp token={token} context={context} />} />;
}
