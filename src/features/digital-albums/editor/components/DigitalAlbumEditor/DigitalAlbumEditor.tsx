"use client";

import {
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import DigitalAlbumEditorHeader
  from "@/features/digital-albums/editor/components/DigitalAlbumEditorHeader/DigitalAlbumEditorHeader";

import DigitalAlbumEditorMobileNavigation
  from "@/features/digital-albums/editor/components/DigitalAlbumEditorMobileNavigation/DigitalAlbumEditorMobileNavigation";

import DigitalAlbumEditorWorkspace
  from "@/features/digital-albums/editor/components/DigitalAlbumEditorWorkspace/DigitalAlbumEditorWorkspace";

import type {
  DigitalAlbumEditorStep,
} from "@/features/digital-albums/editor/types/digitalAlbumEditor.types";

import EditorMobilePanel
  from "@/features/editor/components/EditorMobilePanel/EditorMobilePanel";

import EditorShell
  from "@/features/editor/components/EditorShell/EditorShell";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumEditorProps {
  activeStep:
    DigitalAlbumEditorStep;

  sidebar?:
    ReactNode;

  children:
    ReactNode;

  onStepChange:
    (
      step:
        DigitalAlbumEditorStep
    ) => void;
}


/* ==========================================================================
   Digital Album Editor
========================================================================== */

export default function DigitalAlbumEditor({
  activeStep,
  sidebar,
  children,
  onStepChange,
}: DigitalAlbumEditorProps) {
  /* ==========================================================================
     State
  ========================================================================== */

  const [
    isMobilePanelOpen,
    setIsMobilePanelOpen,
  ] =
    useState(false);


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <EditorShell
      header={
        <DigitalAlbumEditorHeader
          activeStep={
            activeStep
          }
          onStepChange={
            onStepChange
          }
        />
      }
      mobileControls={
        sidebar
          ? (
              <>
                <DigitalAlbumEditorMobileNavigation
                  activeStep={
                    activeStep
                  }
                  onStepChange={
                    onStepChange
                  }
                  onOpenPanel={
                    () =>
                      setIsMobilePanelOpen(
                        true
                      )
                  }
                />

                <EditorMobilePanel
                  open={
                    isMobilePanelOpen
                  }
                  onOpenChange={
                    setIsMobilePanelOpen
                  }
                >
                  {sidebar}
                </EditorMobilePanel>
              </>
            )
          : undefined
      }
    >
      <DigitalAlbumEditorWorkspace
        sidebar={
          sidebar
        }
      >
        {children}
      </DigitalAlbumEditorWorkspace>
    </EditorShell>
  );
}