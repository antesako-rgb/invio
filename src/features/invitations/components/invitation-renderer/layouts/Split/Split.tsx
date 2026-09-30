import type { InvitationLayoutProps } from "../../InvitationLayouts";
import { InvitationPageContent } from "../../InvitationPageContent";
import InvitationPhotos from "../../InvitationPhotos";
import styles from "./Split.module.css";

/* ==========================================================================
   Split Layout
========================================================================== */

export default function Split(props: InvitationLayoutProps) {
  return (
    <div className={styles.split}>
      <InvitationPageContent presentation={props.presentation} page={props.page} locale={props.locale} />

      <InvitationPhotos presentation={props.presentation}
        page={props.page}
        photos={props.photos}
        showPhotoPlaceholders={props.showPhotoPlaceholders}
        className={styles.photo}
      />
    </div>
  );
}
