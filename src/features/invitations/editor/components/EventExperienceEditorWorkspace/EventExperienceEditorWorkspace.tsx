"use client";

import type {
  ReactNode,
} from "react";

import EditorWorkspace
  from "@/features/editor/components/EditorWorkspace/EditorWorkspace";

import styles
  from "./EventExperienceEditorWorkspace.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceEditorWorkspaceProps {
  sidebar?:
    ReactNode;

  toolbar?:
    ReactNode;

  showMobileToolbar?:
    boolean;

  children:
    ReactNode;
}


/* ==========================================================================
   Event Experience Editor Workspace
========================================================================== */

export default function EventExperienceEditorWorkspace({
  sidebar,
  toolbar,
  showMobileToolbar = true,
  children,
}: EventExperienceEditorWorkspaceProps) {
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
        data-mobile-toolbar={
          showMobileToolbar
            ? "visible"
            : "hidden"
        }
      >
        <div
          className={
            styles.toolbar
          }
        >
          {toolbar}
        </div>

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