"use client";

import {
  UserRound,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  Select,
} from "@/components/ui/select";

import type {
  SelectOption,
} from "@/components/ui/select";

import type {
  InvitationRSVPPreviewMode as InvitationRSVPPreviewModeValue,
} from "@/features/invitations/types/invitationRsvp.types";

import "./InvitationRSVPPreviewMode.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationRSVPPreviewModeProps {
  value:
    InvitationRSVPPreviewModeValue;

  onChange:
    (
      value:
        InvitationRSVPPreviewModeValue
    ) => void;
}


/* ==========================================================================
   Invitation RSVP Preview Mode
========================================================================== */

export default function InvitationRSVPPreviewMode({
  value,
  onChange,
}: InvitationRSVPPreviewModeProps) {
  const t =
    useTranslations(
      "Invitations.editor.rsvp.previewMode"
    );


  /* ==========================================================================
     Options
  ========================================================================== */

  const options:
    SelectOption<InvitationRSVPPreviewModeValue>[] = [
      {
        value:
          "personalized",

        label:
          t(
            "personalized"
          ),
      },

      {
        value:
          "generic",

        label:
          t(
            "generic"
          ),
      },
    ];


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className="invitation-rsvp-preview-mode"
      data-invitation-editor-ui
      data-invitation-rsvp-preview-mode
    >
      <UserRound
        className="invitation-rsvp-preview-mode__icon"
        aria-hidden="true"
      />

      <span
        className="invitation-rsvp-preview-mode__label"
      >
        {t(
          "label"
        )}
      </span>

      <Select<InvitationRSVPPreviewModeValue>
        value={
          value
        }
        options={
          options
        }
        onValueChange={
          onChange
        }
        aria-label={
          t(
            "ariaLabel"
          )
        }
        className="invitation-rsvp-preview-mode__select"
      />
    </div>
  );
}