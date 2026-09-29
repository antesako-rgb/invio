import type { InvitationLayoutProps } from "../../InvitationLayouts";
import { InvitationPageContent } from "../../InvitationPageContent";
import InvitationPhotos from "../../InvitationPhotos";
import styles from "./PhotoText.module.css";

/* ==========================================================================
   PhotoText Layout
========================================================================== */

export default function PhotoText(props: InvitationLayoutProps) {
  return (
    <div className={styles.photoText}>
      <InvitationPhotos
        page={props.page}
        photos={props.photos}
        showPhotoPlaceholders={props.showPhotoPlaceholders}
        className={styles.photo}
      />

      <InvitationPageContent page={props.page} locale={props.locale} />
    </div>
  );
}
