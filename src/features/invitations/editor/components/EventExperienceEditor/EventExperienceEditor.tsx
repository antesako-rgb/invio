"use client";

import type {
  ReactNode,
} from "react";

import {
  SlidersHorizontal,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  Button,
} from "@/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet/Sheet";

import EventExperienceEditorHeader
  from "@/features/invitations/editor/components/EventExperienceEditorHeader/EventExperienceEditorHeader";

import EventExperienceEditorWorkspace
  from "@/features/invitations/editor/components/EventExperienceEditorWorkspace/EventExperienceEditorWorkspace";

import type {
  EventExperienceEditorSaveStatus,
  EventExperienceEditorStep,
} from "@/features/invitations/editor/types/eventExperienceEditor.types";

import type {
  EventExperienceTemplateFeaturesConfig,
} from "@/features/invitations/types/eventExperienceTemplateConfig.types";

import "@/features/invitations/styles/eventExperienceEditor.css";

import "./EventExperienceEditor.css";


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

  activeStep:
    EventExperienceEditorStep;

  features:
    EventExperienceTemplateFeaturesConfig;

  saveStatus:
    EventExperienceEditorSaveStatus;

  onStepChange:
    (
      step: EventExperienceEditorStep
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
  activeStep,
  features,
  saveStatus,
  onStepChange,
  onPreview,
}: EventExperienceEditorProps) {
const t =
  useTranslations(
    "EventExperiences.editor"
  );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className="event-experience-editor"
      data-event-experience-editor
    >
      <EventExperienceEditorHeader
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

      <main
        className="event-experience-editor__main"
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
      </main>


      {/* ====================================================================
          Mobile Editor Controls
      ==================================================================== */}

      {sidebar && (
        <div
          className="event-experience-editor__mobile-controls"
        >
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  type="button"
                  size="lg"
                />
              }
            >
              <SlidersHorizontal
                aria-hidden="true"
              />

              {t(
                "mobile.edit"
              )}
            </SheetTrigger>

            <SheetContent
              side="bottom"
              className="event-experience-editor__mobile-sheet"
            >
              <div
                className="event-experience-editor__mobile-sheet-content"
              >
                {sidebar}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  );
}