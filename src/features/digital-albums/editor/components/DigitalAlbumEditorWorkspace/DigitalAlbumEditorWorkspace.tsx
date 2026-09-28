import type {
  ReactNode,
} from "react";

import EditorWorkspace
  from "@/features/editor/components/EditorWorkspace/EditorWorkspace";

import styles
  from "./DigitalAlbumEditorWorkspace.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumEditorWorkspaceProps {
  sidebarCollapsed?: boolean;
  toolRail?:
    ReactNode;

  sidebar?:
    ReactNode;

  children:
    ReactNode;
}


/* ==========================================================================
   Digital Album Editor Workspace
========================================================================== */

export default function DigitalAlbumEditorWorkspace({
  sidebarCollapsed = false,
  toolRail,
  sidebar,
  children,
}: DigitalAlbumEditorWorkspaceProps) {
  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <EditorWorkspace
      sidebarCollapsed={sidebarCollapsed}
      toolRail={toolRail}
      sidebar={
        sidebar
      }
    >
      <div
        className={
          styles.inner
        }
      >
        <div
          className={
            styles.document
          }
        >
          {children}
        </div>
      </div>
    </EditorWorkspace>
  );
}
