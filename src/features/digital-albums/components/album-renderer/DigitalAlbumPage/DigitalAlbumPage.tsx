import type {
  ReactNode,
} from "react";

import {
  Page,
} from "@openpageflip/react";

import styles
  from "./DigitalAlbumPage.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumPageProps {
  children:
    ReactNode;

  hard?:
    boolean;

  className?:
    string;
}


/* ==========================================================================
   Digital Album Page
========================================================================== */

export default function DigitalAlbumPage({
  children,
  hard = false,
  className,
}: DigitalAlbumPageProps) {
  const pageClassName = [
    styles.page,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Page
      density={
        hard
          ? "hard"
          : "soft"
      }
      className={
        pageClassName
      }
    >
      {children}
    </Page>
  );
}