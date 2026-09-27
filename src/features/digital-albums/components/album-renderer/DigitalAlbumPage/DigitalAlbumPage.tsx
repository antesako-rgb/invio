import type { ReactNode } from "react";

import { Page } from "@openpageflip/react";

import styles from "./DigitalAlbumPage.module.css";

/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumPageProps {
  children: ReactNode;

  hard?: boolean;
  coverSide?: "front" | "back";

  className?: string;
}

/* ==========================================================================
   Digital Album Page
========================================================================== */

export default function DigitalAlbumPage({
  children,
  hard = false,
  coverSide,
  className,
}: DigitalAlbumPageProps) {
  const pageClassName = [styles.page, hard ? styles.hard : undefined, className]
    .filter(Boolean)
    .join(" ");

  return (
    <Page
      data-album-page="book"
      data-album-cover={hard ? coverSide : undefined}
      density={hard ? "hard" : "soft"}
      className={pageClassName}
    >
      {children}
    </Page>
  );
}
