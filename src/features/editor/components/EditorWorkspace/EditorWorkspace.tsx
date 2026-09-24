import type {
  ReactNode,
} from "react";

import styles
  from "./EditorWorkspace.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface EditorWorkspaceProps {
  toolRail?:
    ReactNode;

  sidebar?:
    ReactNode;

  children:
    ReactNode;
}


/* ==========================================================================
   Editor Workspace
========================================================================== */

export default function EditorWorkspace({
  toolRail,
  sidebar,
  children,
}: EditorWorkspaceProps) {
  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={
        styles.root
      }
      data-editor-workspace
    >
      {toolRail && (
        <div className={styles.toolRail}>
          {toolRail}
        </div>
      )}

      {sidebar && (
        <aside
          className={
            styles.sidebar
          }
        >
          {sidebar}
        </aside>
      )}

      <div
        className={
          styles.canvas
        }
      >
        {children}
      </div>
    </div>
  );
}
