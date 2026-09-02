"use client";

import {
  Check,
  Eye,
  FileText,
  Heart,
  LoaderCircle,
  Palette,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import BackLink
  from "@/components/ui/back-link/BackLink";

import SideNavigation
  from "@/components/ui/side-navigation/SideNavigation";

import type {
  InvitationEditorSaveStatus,
  InvitationEditorStep,
} from "@/features/invitations/editor/types/invitationEditor.types";

import "./InvitationEditorHeader.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationEditorHeaderProps {
  activeStep:
    InvitationEditorStep;

  saveStatus?:
    InvitationEditorSaveStatus;

  onStepChange:
    (
      step: InvitationEditorStep
    ) => void;

  onPreview?:
    () => void;
}


/* ==========================================================================
   Invitation Editor Header
========================================================================== */

export default function InvitationEditorHeader({
  activeStep,
  saveStatus = "saved",
  onStepChange,
  onPreview,
}: InvitationEditorHeaderProps) {
  const t =
    useTranslations(
      "Invitations.editor"
    );


  /* ==========================================================================
     Navigation
  ========================================================================== */

  const navigationItems = [
    {
      id:
        "design",

      href:
        "#design",

      label:
        t(
          "navigation.design"
        ),

      icon:
        Palette,
    },

    {
      id:
        "details",

      href:
        "#details",

      label:
        t(
          "navigation.details"
        ),

      icon:
        FileText,
    },

    {
      id:
        "rsvp",

      href:
        "#rsvp",

      label:
        t(
          "navigation.rsvp"
        ),

      icon:
        Heart,
    },

    {
      id:
        "preview",

      href:
        "#preview",

      label:
        t(
          "navigation.preview"
        ),

      icon:
        Eye,
    },
  ];


  /* ==========================================================================
     Navigation
  ========================================================================== */

  function handleNavigation(
    id:
      string
  ) {
    if (
      id === "preview"
    ) {
      onPreview?.();

      return;
    }

    if (
      id === "design" ||
      id === "details" ||
      id === "rsvp"
    ) {
      onStepChange(
        id
      );
    }
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <header
      className="invitation-editor-header"
    >
      {/* ====================================================================
          Back
      ==================================================================== */}

      <div
        className="invitation-editor-header__start"
      >
        <BackLink
          href="/dashboard/dogadaji"
          label={
            t(
              "navigation.back"
            )
          }
        />
      </div>


      {/* ====================================================================
          Navigation
      ==================================================================== */}

      <div
        className="invitation-editor-header__navigation"
      >
        <SideNavigation
          items={
            navigationItems
          }
          variant="controlled"
          appearance="underline"
          activeId={
            activeStep
          }
          onControlledNavigate={
            handleNavigation
          }
          ariaLabel={
            t(
              "navigation.label"
            )
          }
        />
      </div>


      {/* ====================================================================
          Save Status
      ==================================================================== */}

      <div
        className="invitation-editor-header__status"
        role="status"
        aria-live="polite"
      >
        {saveStatus === "saving"
          ? (
            <>
              <LoaderCircle
                size={16}
                className="invitation-editor-header__status-spinner"
                aria-hidden="true"
              />

              <span>
                {t(
                  "status.saving"
                )}
              </span>
            </>
          )
          : (
            <>
              <Check
                size={16}
                aria-hidden="true"
              />

              <span>
                {t(
                  "status.saved"
                )}
              </span>
            </>
          )}
      </div>
    </header>
  );
}