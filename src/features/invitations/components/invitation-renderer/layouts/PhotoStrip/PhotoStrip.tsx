import type { InvitationLayoutProps } from "../../InvitationLayouts";
import InvitationPhotos from "../../InvitationPhotos";
import { InvitationPageContent } from "../../InvitationPageContent";
import styles from "./PhotoStrip.module.css";

/* ==========================================================================
   Photo Strip — three photographs alongside a typographic cover
========================================================================== */

export default function PhotoStrip({
  page,
  photos,
  locale,
  showPhotoPlaceholders,
}: InvitationLayoutProps) {
  const firstName = page.content.firstName?.trim() ?? "";
  const secondName = page.content.secondName?.trim() ?? "";
  const hasNames = Boolean(firstName || secondName);
  const initial = (name: string) => (
    Array.from(new Intl.Segmenter(locale, { granularity: "grapheme" }).segment(name))[0]
      ?.segment.toLocaleUpperCase(locale) ?? ""
  );
  const hasPhotos = page.photos.some(slot => (
    slot.photoId && photos.has(slot.photoId)
  ));

  return (
    <div className={styles.photoStrip}>
      {(hasPhotos || showPhotoPlaceholders) && (
        <div className={styles.strip}>
          <InvitationPhotos
            page={page}
            photos={photos}
            showPhotoPlaceholders={showPhotoPlaceholders}
            className={styles.photo}
          />
        </div>
      )}

      <div className={styles.panel}>
        {hasNames && (
          <div className={styles.monogram} aria-hidden="true">
            <span>{initial(firstName)}</span>
            <span>{initial(secondName)}</span>
          </div>
        )}

        {hasNames && (
          <h2 className={styles.names}>
            {firstName && <span>{firstName}</span>}
            {firstName && secondName && <span className={styles.ampersand}>&amp;</span>}
            {secondName && <span>{secondName}</span>}
          </h2>
        )}

        {page.content.subtitle?.trim() && (
          <p className={styles.subtitle}>{page.content.subtitle}</p>
        )}

        {page.content.text?.trim() && (
          <p className={styles.message}>{page.content.text}</p>
        )}

        <InvitationPageContent
          page={{
            ...page,
            content: {
              ...page.content,
              title: hasNames ? undefined : page.content.title,
              subtitle: undefined,
            },
          }}
          locale={locale}
        />
      </div>
    </div>
  );
}
