import type { InvitationLayoutProps } from "../../InvitationLayouts";
import InvitationPhotos from "../../InvitationPhotos";
import { InvitationPageContent } from "../../InvitationPageContent";
import styles from "./TornPaper.module.css";

/* ==========================================================================
   Torn Paper Layout
========================================================================== */

export default function TornPaper({ page, photos, locale, showPhotoPlaceholders }: InvitationLayoutProps) {
  const hasPhoto = page.photos.some(slot => slot.photoId && photos.has(slot.photoId));
  const hasPhotoArea = hasPhoto || showPhotoPlaceholders;

  return (
    <div className={styles.tornPaper} data-has-photo={hasPhoto} data-photo-area={hasPhotoArea}>
      <div className={styles.hero}>
        <InvitationPhotos
          page={page}
          photos={photos}
          showPhotoPlaceholders={showPhotoPlaceholders}
          className={styles.photo}
        />
        {page.content.subtitle?.trim() && (
          <p className={styles.subtitle}>{page.content.subtitle}</p>
        )}
      </div>
      <div className={styles.paper}>
        <InvitationPageContent
          page={{ ...page, content: { ...page.content, subtitle: undefined } }}
          locale={locale}
        />
      </div>
    </div>
  );
}
