import { invitationText } from "../../InvitationPresentation";
import type { InvitationLayoutProps } from "../../InvitationLayouts";
import InvitationPhotos from "../../InvitationPhotos";
import { InvitationPageContent } from "../../InvitationPageContent";
import styles from "./PhotoStrip.module.css";

/* ==========================================================================
   Photo Strip — three photographs alongside a typographic cover
========================================================================== */

export default function PhotoStrip({ presentation,
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
          <InvitationPhotos presentation={presentation}
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

        {(hasNames || presentation) && (
          <h2 className={styles.names}>
            {(firstName || presentation) && <span>{invitationText(presentation, "firstName", firstName)}</span>}
            {((firstName && secondName) || presentation) && <span className={styles.ampersand}>&amp;</span>}
            {(secondName || presentation) && <span>{invitationText(presentation, "secondName", secondName)}</span>}
          </h2>
        )}

        {(page.content.subtitle?.trim() || presentation) && (
          <p className={styles.subtitle}>{invitationText(presentation, "subtitle", page.content.subtitle)}</p>
        )}

        {(page.content.text?.trim() || presentation) && (
          <p className={styles.message}>{invitationText(presentation, "text", page.content.text)}</p>
        )}

        <InvitationPageContent omit={presentation ? [...(hasNames || !page.content.title?.trim() ? ["title" as const] : []), "subtitle", "text", "firstName", "secondName"] : []} presentation={presentation}
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
