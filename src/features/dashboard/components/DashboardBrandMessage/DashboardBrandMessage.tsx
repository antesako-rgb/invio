import {
  Heart,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import styles from "./DashboardBrandMessage.module.css";


/* ==========================================================================
   Dashboard Brand Message
========================================================================== */

export default function DashboardBrandMessage() {
  const t =
    useTranslations(
      "Dashboard.overview"
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <section
      className={
        styles.message
      }
    >
      <Heart
        className={
          styles.icon
        }
        aria-hidden="true"
      />

      <p
        className={
          styles.title
        }
      >
        {t(
          "brandMessage.title"
        )}
      </p>

      <p
        className={
          styles.description
        }
      >
        {t(
          "brandMessage.description"
        )}
      </p>
    </section>
  );
}