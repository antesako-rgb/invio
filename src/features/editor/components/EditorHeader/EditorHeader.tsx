import type {
  ReactNode,
} from "react";

import styles
  from "./EditorHeader.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface EditorHeaderProps {
  start?:
    ReactNode;

  navigation?:
    ReactNode;

  end?:
    ReactNode;
}


/* ==========================================================================
   Editor Header
========================================================================== */

export default function EditorHeader({
  start,
  navigation,
  end,
}: EditorHeaderProps) {
  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <header
      className={
        styles.root
      }
      data-editor-header
    >
      <div
        className={
          styles.start
        }
      >
        {start}
      </div>

      <div
        className={
          styles.navigation
        }
      >
        {navigation}
      </div>

      <div
        className={
          styles.end
        }
      >
        {end}
      </div>
    </header>
  );
}