"use client";
import { DIGITAL_ALBUM_MOBILE_DEFAULT_SNAP_POINT } from "../../hooks/useDigitalAlbumMobilePanel";

import { type ReactNode, useState } from "react";
import { useTranslations } from "next-intl";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";
import IconButton from "@/components/ui/icon-button/IconButton";

import DigitalAlbumEditorHeader from "@/features/digital-albums/editor/components/DigitalAlbumEditorHeader/DigitalAlbumEditorHeader";

import DigitalAlbumEditorMobileNavigation from "@/features/digital-albums/editor/components/DigitalAlbumEditorMobileNavigation/DigitalAlbumEditorMobileNavigation";

import DigitalAlbumEditorWorkspace from "@/features/digital-albums/editor/components/DigitalAlbumEditorWorkspace/DigitalAlbumEditorWorkspace";

import DigitalAlbumEditorToolRail from "@/features/digital-albums/editor/components/DigitalAlbumEditorToolRail/DigitalAlbumEditorToolRail";

import type { DigitalAlbumEditorStep } from "@/features/digital-albums/editor/types/digitalAlbumEditor.types";

import EditorMobilePanel, {
  type EditorMobilePanelChangeDetails,
} from "@/features/editor/components/EditorMobilePanel/EditorMobilePanel";

import EditorShell from "@/features/editor/components/EditorShell/EditorShell";

/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumEditorProps {
  mobilePanelOpen: boolean;
  onMobilePanelOpenChange: (
    open: boolean,
    details?: EditorMobilePanelChangeDetails,
  ) => void;
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigationT = useTranslations("Navigation.dashboard");
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
              defaultSnapPoint={DIGITAL_ALBUM_MOBILE_DEFAULT_SNAP_POINT}
              scrollResetKey={`${activeStep}:${mobileSnapPoint}`}
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
        sidebarCollapsed={sidebarCollapsed}
        toolRail={
          <>
          <IconButton
            className="mx-auto mb-3 flex"
            aria-label={navigationT(sidebarCollapsed ? "expand" : "collapse")}
            title={navigationT(sidebarCollapsed ? "expand" : "collapse")}
            aria-expanded={!sidebarCollapsed}
            onClick={() => setSidebarCollapsed((value) => !value)}
          >
            {sidebarCollapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}
          </IconButton>
          <DigitalAlbumEditorToolRail
            activeStep={activeStep}
            onStepChange={(step) => { onStepChange(step); setSidebarCollapsed(false); }}
          />
          </>
        }
        sidebar={sidebar}
      >
        {children}
      </DigitalAlbumEditorWorkspace>
    </EditorShell>
  );
}
