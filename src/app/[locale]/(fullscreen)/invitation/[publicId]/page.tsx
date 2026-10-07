import { notFound } from "next/navigation";
import { getPublicInvitation } from "@/features/invitations/repositories/invitation/getPublicInvitation";
import PublicInvitationPage from "@/features/invitations/pages/PublicInvitationPage/PublicInvitationPage";
export default async function PublicInvitationRoute({ params }: { params: Promise<{ publicId: string; locale: string }> }) {
  const { publicId, locale } = await params;
  const data = await getPublicInvitation(publicId);
  if (!data) notFound();
  return <PublicInvitationPage name={data.invitation.name} document={data.invitation.document} photos={data.photos} locale={locale} publicId={data.invitation.public_id} genericEnabled={data.invitation.generic_rsvp_enabled} genericMaxGuests={data.invitation.generic_rsvp_max_guests} />;
}
