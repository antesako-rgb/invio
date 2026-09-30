import type { InvitationLayoutProps } from "../../InvitationLayouts";
import { InvitationPageContent } from "../../InvitationPageContent";
import InvitationPhotos from "../../InvitationPhotos";
import styles from "./Grid.module.css";

/* ==========================================================================
   Grid Layout
========================================================================== */

export default function Grid(props: InvitationLayoutProps) {
  return (
    <div className={styles.gallery}>
      <InvitationPageContent presentation={props.presentation} page={props.page} locale={props.locale} />

      <div className={styles.grid}>
        <InvitationPhotos presentation={props.presentation}
          page={props.page}
          photos={props.photos}
          showPhotoPlaceholders={props.showPhotoPlaceholders}
          className={styles.photo}
        />
      </div>
    </div>
  );
}
