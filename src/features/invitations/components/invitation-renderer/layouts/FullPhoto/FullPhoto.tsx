import type { InvitationLayoutProps } from "../../InvitationLayouts";
import { InvitationPageContent } from "../../InvitationPageContent";
import InvitationPhotos from "../../InvitationPhotos";
import styles from "./FullPhoto.module.css";
import { allura } from "@/styles/fonts/albumMaterialFonts";

/* ==========================================================================
   FullPhoto Layout
========================================================================== */

export default function FullPhoto(props: InvitationLayoutProps) {
  const isCover = props.page.type === "cover";
  const hasPhoto = props.page.photos.some(slot => (
    slot.photoId && props.photos.has(slot.photoId)
  ));

  return (
    <div
      className={`${styles.fullPhoto} ${isCover ? allura.variable : ""}`}
      onClick={props.presentation ? event => {
        if (event.target === event.currentTarget && props.page.photos[0]) props.presentation?.selectPhoto?.(props.page.photos[0].id);
      } : undefined}
      data-has-photo={hasPhoto}
      data-cover={isCover}
    >
      <InvitationPhotos presentation={props.presentation}
        page={props.page}
        photos={props.photos}
        showPhotoPlaceholders={props.showPhotoPlaceholders}
        className={styles.photo}
      />

      {isCover ? (
        <>
          <p className={styles.saveTheDate} lang="en">
            <span>Save the</span>
            <span>Date</span>
          </p>
          <div className={styles.coverContent}>
            <InvitationPageContent presentation={props.presentation} page={props.page} locale={props.locale} />
          </div>
        </>
      ) : (
        <InvitationPageContent presentation={props.presentation} page={props.page} locale={props.locale} />
      )}
    </div>
  );
}
