import type { ReactNode } from "react";
import type { InvitationDocument } from "../../types/invitationDocument.types";
import type { InvitationRenderPhoto } from "../../types/invitationPhoto.types";
import InvitationRenderer from "../../components/invitation-renderer/InvitationRenderer";
import InvitationPublicMotion from "../../components/InvitationPublicMotion/InvitationPublicMotion";
import styles from "./PublicInvitationPage.module.css";
import PublicGenericRsvp from "../../components/PublicGenericRsvp/PublicGenericRsvp";
export default function PublicInvitationPage({ name, document, photos, locale, publicId, genericEnabled, genericMaxGuests = 1, rsvpContent }: { name: string; document: InvitationDocument; photos: InvitationRenderPhoto[]; locale: string; publicId?: string; genericEnabled?: boolean; genericMaxGuests?: number; rsvpContent?: ReactNode }) {
  const rsvp = document.pages.find(page => page.type === "rsvp");
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>{name}</h1>
      <InvitationPublicMotion>
        <InvitationRenderer document={document} photos={photos} locale={locale} rsvpContent={rsvpContent !== undefined ? rsvpContent : genericEnabled && rsvp && publicId ? <PublicGenericRsvp publicId={publicId} page={rsvp} maxGuests={genericMaxGuests} /> : null} />
      </InvitationPublicMotion>
    </main>
  );
}
