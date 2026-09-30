import type { InvitationLayoutProps } from "../../InvitationLayouts";
import { InvitationPageContent } from "../../InvitationPageContent";
import InvitationPhotos from "../../InvitationPhotos";
import styles from "./Editorial.module.css";

/* ==========================================================================
   Editorial Layout
========================================================================== */

export default function Editorial(props: InvitationLayoutProps) {
  return (
    <div className={styles.editorial}>
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
