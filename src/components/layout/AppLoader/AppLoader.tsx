"use client";

import styles from "./AppLoader.module.css";


/* ==========================================================================
   App Loader
========================================================================== */

export default function AppLoader() {
  return (
    <div
      className={
        styles.container
      }
      role="status"
      aria-label="Loading"
    >
      <div
        className={
          styles.spinner
        }
        aria-hidden="true"
      />
    </div>
  );
}