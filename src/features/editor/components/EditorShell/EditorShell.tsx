import type {
  ReactNode,
} from "react";

import styles
  from "./EditorShell.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface EditorShellProps {
  header:
    ReactNode;

  children:
    ReactNode;

  mobileControls?:
    ReactNode;
}


/* ==========================================================================
   Editor Shell
========================================================================== */

export default function EditorShell({
  header,
  children,
  mobileControls,
}: EditorShellProps) {
  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={
        styles.root
      }
      data-editor-shell
    >
      {header}

      <main
        className={
          styles.main
        }
      >
        {children}
      </main>

      {mobileControls && (
        <div
          className={
            styles.mobileControls
          }
        >
          {mobileControls}
        </div>
      )}
    </div>
  );
}