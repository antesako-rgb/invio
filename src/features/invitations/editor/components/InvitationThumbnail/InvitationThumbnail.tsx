import { useLocale } from "next-intl";
import InvitationRenderer from "../../../components/invitation-renderer/InvitationRenderer";
import type { InvitationDocument } from "../../../types/invitationDocument.types";
import type { InvitationRenderPhoto } from "../../../types/invitationPhoto.types";
import styles from "./InvitationThumbnail.module.css";

/** A clipped miniature of the real responsive renderer, never a second layout implementation. */
interface InvitationThumbnailProps {
  document: InvitationDocument;
  photos?: InvitationRenderPhoto[];
  large?: boolean;
}

export default function InvitationThumbnail({ document, photos = [], large = false }: InvitationThumbnailProps) {
  const locale = useLocale();

  return <div className={styles.thumbnail} data-large={large} aria-hidden="true" inert>
    <div className={styles.surface}>
      <InvitationRenderer
        document={{ ...document, pages: document.pages.slice(0, 1) }}
        photos={photos}
        locale={locale}
        showPhotoPlaceholders />
    </div>
  </div>;
}
