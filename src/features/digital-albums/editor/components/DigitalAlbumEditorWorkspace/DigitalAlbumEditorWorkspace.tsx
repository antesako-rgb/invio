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
  sidebar?:
    ReactNode;

  children:
    ReactNode;
}


/* ==========================================================================
   Digital Album Editor Workspace
========================================================================== */

export default function DigitalAlbumEditorWorkspace({
  sidebar,
  children,
}: DigitalAlbumEditorWorkspaceProps) {
  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <EditorWorkspace
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