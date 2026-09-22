import type {
  ReactNode,
} from "react";

import styles
  from "./DigitalAlbumViewer.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumViewerProps {
  children:
    ReactNode;
}


/* ==========================================================================
   Digital Album Viewer
========================================================================== */

export default function DigitalAlbumViewer({
  children,
}: DigitalAlbumViewerProps) {
  return (
    <main
      className={
        styles.root
      }
    >
      {children}
    </main>
  );
}