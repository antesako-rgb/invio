import type { ReactNode } from "react";

import styles from "./EditorSidebar.module.css";

/* ==========================================================================
   Types
========================================================================== */

interface EditorSidebarProps {
  mobileScrollOwner?: "sidebar" | "parent";
  title: ReactNode;

  children: ReactNode;
}

/* ==========================================================================
   Editor Sidebar
========================================================================== */

export default function EditorSidebar({
  title,
  children,
  mobileScrollOwner = "sidebar",
}: EditorSidebarProps) {
  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <aside
      className={styles.root}
      data-mobile-scroll-owner={mobileScrollOwner}
      data-editor-sidebar
    >
      {/* ====================================================================
          Header
      ==================================================================== */}

      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
      </div>

      {/* ====================================================================
          Content
      ==================================================================== */}

      <div className={styles.content}>{children}</div>
    </aside>
  );
}
