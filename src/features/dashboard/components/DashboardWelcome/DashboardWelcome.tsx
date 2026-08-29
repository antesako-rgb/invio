"use client";

import {
  useTranslations,
} from "next-intl";

import styles from "./DashboardWelcome.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface DashboardWelcomeProps {
  firstName?:
    string | null;
}


/* ==========================================================================
   Dashboard Welcome
========================================================================== */

export default function DashboardWelcome({
  firstName,
}: DashboardWelcomeProps) {
  const t =
    useTranslations(
      "Dashboard.overview"
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={
        styles.welcome
      }
    >
      <h1
        className={
          styles.title
        }
      >
        {firstName
          ? t(
              "welcome.title",
              {
                name:
                  firstName,
              }
            )
          : t(
              "welcome.titleFallback"
            )}

        <span
          className={
            styles.wave
          }
          aria-hidden="true"
        >
          👋
        </span>
      </h1>

      <p
        className={
          styles.description
        }
      >
        {t(
          "welcome.description"
        )}
      </p>
    </div>
  );
}