import type { InvitationDocument } from "../../types/invitationDocument.types";
import type { InvitationRenderPhoto } from "../../types/invitationPhoto.types";
import InvitationRenderer from "../../components/invitation-renderer/InvitationRenderer";
import InvitationPublicMotion from "../../components/InvitationPublicMotion/InvitationPublicMotion";
import styles from "./PublicInvitationPage.module.css";
export default function PublicInvitationPage({ name, document, photos, locale }: { name: string; document: InvitationDocument; photos: InvitationRenderPhoto[]; locale: string }) {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>{name}</h1>
      <InvitationPublicMotion>
        <InvitationRenderer document={document} photos={photos} locale={locale} />
      </InvitationPublicMotion>
    </main>
  );
}
