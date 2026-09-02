"use client";

import {
  Users,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  Field,
} from "@/components/ui/field";

import {
  Input,
} from "@/components/ui/input";

import {
  Section,
} from "@/components/ui/section";

import {
  SwitchField,
} from "@/components/ui/switch";

import type {
  InvitationRsvpContent,
} from "@/features/invitations/types/invitationContent.types";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationRSVPSettingsProps {
  rsvp:
    InvitationRsvpContent;

  onChange:
    (
      rsvp: InvitationRsvpContent
    ) => void;
}


/* ==========================================================================
   Invitation RSVP Settings
========================================================================== */

export default function InvitationRSVPSettings({
  rsvp,
  onChange,
}: InvitationRSVPSettingsProps) {
  const t =
    useTranslations(
      "Invitations.editor.rsvp.settings"
    );

  const isEnabled =
    rsvp.enabled ??
    true;

  const allowGenericResponses =
    rsvp.allow_generic_responses ??
    false;


  /* ==========================================================================
     Generic Responses
  ========================================================================== */

  function handleGenericResponsesChange(
    allowGenericResponses:
      boolean
  ) {
    onChange({
      ...rsvp,

      allow_generic_responses:
        allowGenericResponses,
    });
  }


  /* ==========================================================================
     Max Party Size
  ========================================================================== */

  function handleMaxPartySizeChange(
    value:
      string
  ) {
    const parsedValue =
      Number.parseInt(
        value,
        10
      );

    if (
      !Number.isInteger(
        parsedValue
      ) ||
      parsedValue < 1
    ) {
      return;
    }

    onChange({
      ...rsvp,

      max_party_size:
        parsedValue,
    });
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className="flex flex-col gap-10"
      data-invitation-rsvp-settings
    >
      <Section
        title={
          t(
            "title"
          )
        }
        description={
          t(
            "description"
          )
        }
        icon={
          Users
        }
      >
        {/* ==================================================================
            Generic Responses
        ================================================================== */}

        <SwitchField
          id="invitation-rsvp-generic-responses"
          label={
            t(
              "genericResponses.label"
            )
          }
          description={
            t(
              "genericResponses.description"
            )
          }
          checked={
            allowGenericResponses
          }
          disabled={
            !isEnabled
          }
          onCheckedChange={
            handleGenericResponsesChange
          }
        />


        {/* ==================================================================
            Max Party Size
        ================================================================== */}

        <Field
          id="invitation-rsvp-max-party-size"
          size="sm"
          label={
            t(
              "maxPartySize.label"
            )
          }
          description={
            t(
              "maxPartySize.description"
            )
          }
        >
          <Input
            type="number"
            min={1}
            step={1}
            value={
              rsvp.max_party_size
            }
            disabled={
              !isEnabled ||
              !allowGenericResponses
            }
            onChange={
              (event) =>
                handleMaxPartySizeChange(
                  event.target.value
                )
            }
          />
        </Field>
      </Section>
    </div>
  );
}