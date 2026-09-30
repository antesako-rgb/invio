import { invitationText } from "../../InvitationPresentation";
import type { InvitationLayoutProps } from "../../InvitationLayouts";
import InvitationPhotos from "../../InvitationPhotos";
import styles from "./Poster.module.css";

/* ==========================================================================
   Poster Layout
========================================================================== */

export default function Poster({ presentation, page, photos, locale, showPhotoPlaceholders }: InvitationLayoutProps) {
  const { title, subtitle, date, location, address } = page.content;
  const hasPhoto = page.photos.some(slot => slot.photoId && photos.has(slot.photoId));
  const isDate = Boolean(date && /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date)));
  const formattedDate = isDate && date
    ? new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(new Date(date))
    : date;

  // Decorative repetitions resolve the same slot through the shared photo component.
  const backdrop = (
    <div className={styles.backdrop} aria-hidden="true">
      <InvitationPhotos presentation={presentation} page={page} photos={photos} className={styles.backgroundPhoto} decorative />
    </div>
  );

  return (
    <div className={styles.poster} data-has-photo={hasPhoto}>
      <header className={styles.heading}>
        {backdrop}
        {(title?.trim() || presentation) && <h2>{invitationText(presentation, "title", title)}</h2>}
      </header>

      <div className={styles.main}>
        <InvitationPhotos presentation={presentation}
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
            {(subtitle?.trim() || presentation) && <p className={styles.primary}>{invitationText(presentation, "subtitle", subtitle)}</p>}
            {(date?.trim() || presentation) && <p>{isDate ? <time dateTime={date}>{invitationText(presentation, "date", date, formattedDate)}</time> : invitationText(presentation, "date", date)}</p>}
          </div>
          <div className={styles.group}>
            {(location?.trim() || presentation) && <p className={styles.primary}>{invitationText(presentation, "location", location)}</p>}
            {(address?.trim() || presentation) && <p>{invitationText(presentation, "address", address)}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
