import type { InvitationLayoutProps } from "../../InvitationLayouts";
import InvitationPhotos from "../../InvitationPhotos";
import styles from "./Poster.module.css";

/* ==========================================================================
   Poster Layout
========================================================================== */

export default function Poster({ page, photos, locale, showPhotoPlaceholders }: InvitationLayoutProps) {
  const { title, subtitle, date, location, address } = page.content;
  const hasPhoto = page.photos.some(slot => slot.photoId && photos.has(slot.photoId));
  const isDate = Boolean(date && /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date)));
  const formattedDate = isDate && date
    ? new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(new Date(date))
    : date;

  // Decorative repetitions resolve the same slot through the shared photo component.
  const backdrop = (
    <div className={styles.backdrop} aria-hidden="true">
      <InvitationPhotos page={page} photos={photos} className={styles.backgroundPhoto} />
    </div>
  );

  return (
    <div className={styles.poster} data-has-photo={hasPhoto}>
      <header className={styles.heading}>
        {backdrop}
        {title?.trim() && <h2>{title}</h2>}
      </header>

      <div className={styles.main}>
        <InvitationPhotos
          page={page}
          photos={photos}
          showPhotoPlaceholders={showPhotoPlaceholders}
          className={styles.mainPhoto}
        />
      </div>

      <div className={styles.footer}>
        {backdrop}
        <div className={styles.details}>
          <div className={styles.group}>
            {subtitle?.trim() && <p className={styles.primary}>{subtitle}</p>}
            {date?.trim() && <p>{isDate ? <time dateTime={date}>{formattedDate}</time> : date}</p>}
          </div>
          <div className={styles.group}>
            {location?.trim() && <p className={styles.primary}>{location}</p>}
            {address?.trim() && <p>{address}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
