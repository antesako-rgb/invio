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
      rsvp:
        InvitationRsvpContent
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

  const allowResponseChanges =
    rsvp.allow_response_changes ??
    true;

  const allowGenericResponses =
    rsvp.allow_generic_responses ??
    false;

  const collectGenericEmail =
    rsvp.collect_generic_email ??
    false;


  /* ==========================================================================
     Response Changes
  ========================================================================== */

  function handleResponseChangesChange(
    allowResponseChanges:
      boolean
  ) {
    onChange({
      ...rsvp,

      allow_response_changes:
        allowResponseChanges,
    });
  }


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
     Collect Generic Email
  ========================================================================== */

  function handleCollectGenericEmailChange(
    collectGenericEmail:
      boolean
  ) {
    onChange({
      ...rsvp,

      collect_generic_email:
        collectGenericEmail,
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
     Max Generic Guests
  ========================================================================== */

  function handleMaxGenericGuestsChange(
    value:
      string
  ) {
    if (
      value === ""
    ) {
      onChange({
        ...rsvp,

        max_generic_guests:
          null,
      });

      return;
    }

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

      max_generic_guests:
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
            Response Changes
        ================================================================== */}

        <SwitchField
          id="invitation-rsvp-response-changes"
          label={
            t(
              "responseChanges.label"
            )
          }
          description={
            t(
              "responseChanges.description"
            )
          }
          checked={
            allowResponseChanges
          }
          disabled={
            !isEnabled
          }
          onCheckedChange={
            handleResponseChangesChange
          }
        />


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
            Collect Generic Email
        ================================================================== */}

        <SwitchField
          id="invitation-rsvp-collect-generic-email"
          label={
            t(
              "collectGenericEmail.label"
            )
          }
          description={
            t(
              "collectGenericEmail.description"
            )
          }
          checked={
            collectGenericEmail
          }
          disabled={
            !isEnabled ||
            !allowGenericResponses
          }
          onCheckedChange={
            handleCollectGenericEmailChange
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


        {/* ==================================================================
            Max Generic Guests
        ================================================================== */}

        <Field
          id="invitation-rsvp-max-generic-guests"
          size="sm"
          label={
            t(
              "maxGenericGuests.label"
            )
          }
          description={
            t(
              "maxGenericGuests.description"
            )
          }
        >
          <Input
            type="number"
            min={1}
            step={1}
            value={
              rsvp.max_generic_guests ??
              ""
            }
            placeholder={
              t(
                "maxGenericGuests.placeholder"
              )
            }
            disabled={
              !isEnabled ||
              !allowGenericResponses
            }
            onChange={
              (event) =>
                handleMaxGenericGuestsChange(
                  event.target.value
                )
            }
          />
        </Field>
      </Section>
    </div>
  );
}