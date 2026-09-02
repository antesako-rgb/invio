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

import InvitationEditorHeader
  from "@/features/invitations/editor/components/InvitationEditorHeader/InvitationEditorHeader";

import InvitationEditorWorkspace
  from "@/features/invitations/editor/components/InvitationEditorWorkspace/InvitationEditorWorkspace";

import type {
  InvitationEditorSaveStatus,
  InvitationEditorStep,
} from "@/features/invitations/editor/types/invitationEditor.types";

import "@/features/invitations/styles/invitationEditor.css";

import "./InvitationEditor.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationEditorProps {
  children:
    ReactNode;

  sidebar?:
    ReactNode;

  toolbar?:
    ReactNode;

  activeStep:
    InvitationEditorStep;

  saveStatus:
    InvitationEditorSaveStatus;

  onStepChange:
    (
      step: InvitationEditorStep
    ) => void;

  onPreview:
    () => void;
}


/* ==========================================================================
   Invitation Editor
========================================================================== */

export default function InvitationEditor({
  children,
  sidebar,
  toolbar,
  activeStep,
  saveStatus,
  onStepChange,
  onPreview,
}: InvitationEditorProps) {
  const t =
    useTranslations(
      "Invitations.editor"
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className="invitation-editor"
      data-invitation-editor
    >
      <InvitationEditorHeader
        activeStep={
          activeStep
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
        className="invitation-editor__main"
      >
        <InvitationEditorWorkspace
          sidebar={
            sidebar
          }
          toolbar={
            toolbar
          }
        >
          {children}
        </InvitationEditorWorkspace>
      </main>


      {/* ====================================================================
          Mobile Editor Controls
      ==================================================================== */}

      {sidebar && (
        <div
          className="invitation-editor__mobile-controls"
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
  className="invitation-editor__mobile-sheet"
>
              <div
                className="invitation-editor__mobile-sheet-content"
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