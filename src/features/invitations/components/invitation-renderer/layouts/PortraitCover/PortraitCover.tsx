import type { InvitationLayoutProps } from "../../InvitationLayouts";
import InvitationPhotos from "../../InvitationPhotos";
import { InvitationPageContent } from "../../InvitationPageContent";
import styles from "./PortraitCover.module.css";

/* ==========================================================================
   Portrait Cover — photograph, anchored title and connected paper caption
========================================================================== */

export default function PortraitCover({ page, photos, locale, showPhotoPlaceholders }: InvitationLayoutProps) {
  const hasPhoto = page.photos.some(slot => slot.photoId && photos.has(slot.photoId));

  return (
    <div className={styles.portraitCover} data-has-photo={hasPhoto}>
      <div className={styles.hero}>
        <InvitationPhotos
          page={page}
          photos={photos}
          showPhotoPlaceholders={showPhotoPlaceholders}
          className={styles.photo}
        />
        {page.content.title?.trim() && (
          <div className={styles.heading}>
            <h2>{page.content.title}</h2>
          </div>
        )}
      </div>
      {(page.content.subtitle?.trim() || page.content.date?.trim()) && (
        <div className={styles.caption}>
          <div className={styles.captionContent}>
            <InvitationPageContent
              page={{ ...page, content: { ...page.content, title: undefined } }}
              locale={locale}
            />
          </div>
        </div>
      )}
    </div>
  );
}
