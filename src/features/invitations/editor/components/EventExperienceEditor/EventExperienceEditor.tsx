"use client";

import {
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import EditorMobilePanel
  from "@/features/editor/components/EditorMobilePanel/EditorMobilePanel";

import EditorShell
  from "@/features/editor/components/EditorShell/EditorShell";

import EventExperienceEditorHeader
  from "@/features/invitations/editor/components/EventExperienceEditorHeader/EventExperienceEditorHeader";

import EventExperienceEditorMobileNavigation
  from "@/features/invitations/editor/components/EventExperienceEditorMobileNavigation/EventExperienceEditorMobileNavigation";

import EventExperienceEditorWorkspace
  from "@/features/invitations/editor/components/EventExperienceEditorWorkspace/EventExperienceEditorWorkspace";

import type {
  EventExperienceEditorSaveStatus,
  EventExperienceEditorStep,
} from "@/features/invitations/editor/types/eventExperienceEditor.types";

import type {
  EventExperienceTemplateFeaturesConfig,
} from "@/features/invitations/types/eventExperienceTemplateConfig.types";

import type {
  EventExperienceType,
} from "@/features/invitations/types/eventExperience.types";

import "@/features/invitations/styles/eventExperienceEditor.css";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceEditorProps {
  children:
    ReactNode;

  sidebar?:
    ReactNode;

  toolbar?:
    ReactNode;

  type:
    EventExperienceType;

  activeStep:
    EventExperienceEditorStep;

  features:
    EventExperienceTemplateFeaturesConfig;

  saveStatus:
    EventExperienceEditorSaveStatus;

  onStepChange:
    (
      step:
        EventExperienceEditorStep
    ) => void;

  onPreview:
    () => void;
}


/* ==========================================================================
   Event Experience Editor
========================================================================== */

export default function EventExperienceEditor({
  children,
  sidebar,
  toolbar,
  type,
  activeStep,
  features,
  saveStatus,
  onStepChange,
  onPreview,
}: EventExperienceEditorProps) {
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
        <EventExperienceEditorHeader
          type={
            type
          }
          activeStep={
            activeStep
          }
          features={
            features
          }
          saveStatus={
            saveStatus
          }
          onStepChange={
            onStepChange
          }
          onPreview={
            onPreview
          }
        />
      }
      mobileControls={
        sidebar
          ? (
              <>
                <EventExperienceEditorMobileNavigation
                  type={
                    type
                  }
                  activeStep={
                    activeStep
                  }
                  features={
                    features
                  }
                  onStepChange={
                    onStepChange
                  }
                  onPreview={
                    onPreview
                  }
                  onOpenPanel={
                    () =>
                      setIsMobilePanelOpen(
                        true
                      )
                  }
                  onClosePanel={
                    () =>
                      setIsMobilePanelOpen(
                        false
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
      <EventExperienceEditorWorkspace
        sidebar={
          sidebar
        }
        toolbar={
          toolbar
        }
        showMobileToolbar={
          activeStep === "design"
        }
      >
        {children}
      </EventExperienceEditorWorkspace>
    </EditorShell>
  );
}