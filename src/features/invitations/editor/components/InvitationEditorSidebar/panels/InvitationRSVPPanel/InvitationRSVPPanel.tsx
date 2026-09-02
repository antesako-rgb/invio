"use client";

import {
  useState,
} from "react";

import {
  useTranslations,
} from "next-intl";

import SideNavigation
  from "@/components/ui/side-navigation/SideNavigation";

import InvitationRSVPBasics
  from "@/features/invitations/editor/components/InvitationEditorSidebar/panels/InvitationRSVPPanel/InvitationRSVPBasics";

import InvitationRSVPQuestions
  from "@/features/invitations/editor/components/InvitationEditorSidebar/panels/InvitationRSVPPanel/InvitationRSVPQuestions";

import InvitationRSVPSettings
  from "@/features/invitations/editor/components/InvitationEditorSidebar/panels/InvitationRSVPPanel/InvitationRSVPSettings";

import type {
  InvitationRsvpContent,
} from "@/features/invitations/types/invitationContent.types";

import type {
  InvitationRSVPViewState,
} from "@/features/invitations/types/invitationRsvp.types";


/* ==========================================================================
   Types
========================================================================== */

type InvitationRSVPPanelTab =
  | "basics"
  | "questions"
  | "settings";

interface InvitationRSVPPanelProps {
  rsvp:
    InvitationRsvpContent;

  previewState:
    InvitationRSVPViewState;

  onChange:
    (
      rsvp:
        InvitationRsvpContent
    ) => void;

  onPreviewStateChange:
    (
      state:
        InvitationRSVPViewState
    ) => void;
}


/* ==========================================================================
   Invitation RSVP Panel
========================================================================== */

export default function InvitationRSVPPanel({
  rsvp,
  previewState,
  onChange,
  onPreviewStateChange,
}: InvitationRSVPPanelProps) {
  const t =
    useTranslations(
      "Invitations.editor.rsvp"
    );

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<InvitationRSVPPanelTab>(
      "basics"
    );


  /* ==========================================================================
     Preview Navigation
  ========================================================================== */

  const previewNavigationItems = [
    {
      id:
        "form",

      label:
        t(
          "preview.form"
        ),

      href:
        "#form",
    },

    {
      id:
        "success",

      label:
        t(
          "preview.success"
        ),

      href:
        "#success",
    },
  ];


  /* ==========================================================================
     Panel Navigation
  ========================================================================== */

  const navigationItems = [
    {
      id:
        "basics",

      label:
        t(
          "tabs.basics"
        ),

      href:
        "#basics",
    },

    {
      id:
        "questions",

      label:
        t(
          "tabs.questions"
        ),

      href:
        "#questions",
    },

    {
      id:
        "settings",

      label:
        t(
          "tabs.settings"
        ),

      href:
        "#settings",
    },
  ];


  /* ==========================================================================
     Preview Navigate
  ========================================================================== */

  function handlePreviewNavigate(
    id:
      string
  ) {
    if (
      id !== "form" &&
      id !== "success"
    ) {
      return;
    }

    onPreviewStateChange(
      id
    );
  }


  /* ==========================================================================
     Panel Navigate
  ========================================================================== */

  function handleNavigate(
    id:
      string
  ) {
    if (
      id !== "basics" &&
      id !== "questions" &&
      id !== "settings"
    ) {
      return;
    }

    setActiveTab(
      id
    );
  }


  /* ==========================================================================
     Content
  ========================================================================== */

  function renderContent() {
    switch (
      activeTab
    ) {
      case "questions":
        return (
          <InvitationRSVPQuestions
            rsvp={
              rsvp
            }
            onChange={
              onChange
            }
          />
        );

      case "settings":
        return (
          <InvitationRSVPSettings
            rsvp={
              rsvp
            }
            onChange={
              onChange
            }
          />
        );

      case "basics":
      default:
        return (
          <InvitationRSVPBasics
            rsvp={
              rsvp
            }
            onChange={
              onChange
            }
          />
        );
    }
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className="flex flex-col gap-6"
      data-invitation-rsvp-panel
    >
      {/* ====================================================================
          Preview State
      ==================================================================== */}

      <div
        className="flex flex-col gap-2"
        data-invitation-rsvp-preview-state
      >
        <div
          className="text-sm font-medium"
        >
          {t(
            "preview.label"
          )}
        </div>

        <SideNavigation
          items={
            previewNavigationItems
          }
          variant="controlled"
          appearance="tabs"
          activeId={
            previewState
          }
          onControlledNavigate={
            handlePreviewNavigate
          }
          ariaLabel={
            t(
              "preview.ariaLabel"
            )
          }
        />
      </div>


      {/* ====================================================================
          Panel Navigation
      ==================================================================== */}

      <SideNavigation
        items={
          navigationItems
        }
        variant="controlled"
        appearance="tabs"
        activeId={
          activeTab
        }
        onControlledNavigate={
          handleNavigate
        }
        ariaLabel={
          t(
            "tabs.ariaLabel"
          )
        }
      />


      {/* ====================================================================
          Content
      ==================================================================== */}

      {renderContent()}
    </div>
  );
}