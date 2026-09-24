"use client";

import type { ReactNode } from "react";

import DigitalAlbumEditorHeader from "@/features/digital-albums/editor/components/DigitalAlbumEditorHeader/DigitalAlbumEditorHeader";

import DigitalAlbumEditorMobileNavigation from "@/features/digital-albums/editor/components/DigitalAlbumEditorMobileNavigation/DigitalAlbumEditorMobileNavigation";

import DigitalAlbumEditorWorkspace from "@/features/digital-albums/editor/components/DigitalAlbumEditorWorkspace/DigitalAlbumEditorWorkspace";

import DigitalAlbumEditorToolRail from "@/features/digital-albums/editor/components/DigitalAlbumEditorToolRail/DigitalAlbumEditorToolRail";

import type { DigitalAlbumEditorStep } from "@/features/digital-albums/editor/types/digitalAlbumEditor.types";

import EditorMobilePanel from "@/features/editor/components/EditorMobilePanel/EditorMobilePanel";

import EditorShell from "@/features/editor/components/EditorShell/EditorShell";

/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumEditorProps {
  mobilePanelOpen: boolean;
  onMobilePanelOpenChange: (open: boolean) => void;
  mobileSnapPoint: number;
  onMobileSnapPointChange: (snapPoint: number) => void;
  headerProps?: Omit<
    import("../DigitalAlbumEditorHeader/DigitalAlbumEditorHeader").DigitalAlbumEditorHeaderProps,
    "albumId"
  >;
  albumId: string;

  activeStep: DigitalAlbumEditorStep;

  sidebar?: ReactNode;

  children: ReactNode;

  onStepChange: (step: DigitalAlbumEditorStep) => void;
}

/* ==========================================================================
   Digital Album Editor
========================================================================== */
export default function DigitalAlbumEditor({
  albumId,
  activeStep,
  sidebar,
  children,
  onStepChange,
  headerProps,
  mobilePanelOpen,
  onMobilePanelOpenChange,
  mobileSnapPoint,
  onMobileSnapPointChange,
}: DigitalAlbumEditorProps) {
  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <EditorShell
      header={<DigitalAlbumEditorHeader albumId={albumId} {...headerProps} />}
      mobileControls={
        sidebar ? (
          <>
            <DigitalAlbumEditorMobileNavigation
              activeStep={activeStep}
              onStepChange={onStepChange}
              onOpenPanel={() => onMobilePanelOpenChange(true)}
            />

            <EditorMobilePanel
              open={mobilePanelOpen}
              onOpenChange={onMobilePanelOpenChange}
              snapPoint={mobileSnapPoint}
              onSnapPointChange={onMobileSnapPointChange}
              handleOnly
            >
              {sidebar}
            </EditorMobilePanel>
          </>
        ) : undefined
      }
    >
      <DigitalAlbumEditorWorkspace
        toolRail={
          <DigitalAlbumEditorToolRail
            activeStep={activeStep}
            onStepChange={onStepChange}
          />
        }
        sidebar={sidebar}
      >
        {children}
      </DigitalAlbumEditorWorkspace>
    </EditorShell>
  );
}
