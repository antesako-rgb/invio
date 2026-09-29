import type { InvitationLayoutProps } from "../../InvitationLayouts";
import { InvitationPageContent } from "../../InvitationPageContent";
import styles from "./Timeline.module.css";

/* ==========================================================================
   Timeline Layout
========================================================================== */

export default function Timeline(props: InvitationLayoutProps) {
  return (
    <div className={styles.timeline}>
      <InvitationPageContent page={props.page} locale={props.locale} />
    </div>
  );
}
