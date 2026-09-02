"use client";

import {
  MessageSquareText,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  DatePicker,
} from "@/components/ui/picker/DatePicker";

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

import {
  Textarea,
} from "@/components/ui/textarea";

import type {
  InvitationRsvpContent,
} from "@/features/invitations/types/invitationContent.types";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationRSVPBasicsProps {
  rsvp:
    InvitationRsvpContent;

  onChange:
    (
      rsvp: InvitationRsvpContent
    ) => void;
}


/* ==========================================================================
   Date Helpers
========================================================================== */

function parseDateValue(
  value:
    string | null
) {
  if (!value) {
    return undefined;
  }

  const [
    year,
    month,
    day,
  ] =
    value
      .split("-")
      .map(
        Number
      );

  return new Date(
    year,
    month - 1,
    day
  );
}


function formatDateValue(
  value:
    Date
) {
  const year =
    value.getFullYear();

  const month =
    String(
      value.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      value.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}


/* ==========================================================================
   Invitation RSVP Basics
========================================================================== */

export default function InvitationRSVPBasics({
  rsvp,
  onChange,
}: InvitationRSVPBasicsProps) {
  const t =
    useTranslations(
      "Invitations.editor.rsvp"
    );

  const isEnabled =
    rsvp.enabled ??
    true;


  /* ==========================================================================
     Enabled
  ========================================================================== */

  function handleEnabledChange(
    enabled:
      boolean
  ) {
    onChange({
      ...rsvp,

      enabled,
    });
  }


  /* ==========================================================================
     Title
  ========================================================================== */

  function handleTitleChange(
    value:
      string
  ) {
    onChange({
      ...rsvp,

      title:
        value ||
        null,
    });
  }


  /* ==========================================================================
     Description
  ========================================================================== */

  function handleDescriptionChange(
    value:
      string
  ) {
    onChange({
      ...rsvp,

      description:
        value ||
        null,
    });
  }


  /* ==========================================================================
     Deadline
  ========================================================================== */

  function handleDeadlineChange(
    value:
      Date | undefined
  ) {
    onChange({
      ...rsvp,

      deadline:
        value
          ? formatDateValue(
              value
            )
          : null,
    });
  }


  /* ==========================================================================
     Success Message
  ========================================================================== */

  function handleSuccessMessageChange(
    value:
      string
  ) {
    onChange({
      ...rsvp,

      success_message:
        value ||
        null,
    });
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className="flex flex-col gap-10"
      data-invitation-rsvp-basics
    >
      <Section
        title={
          t(
            "content.title"
          )
        }
        description={
          t(
            "content.description"
          )
        }
        icon={
          MessageSquareText
        }
      >
        {/* ==================================================================
            Enabled
        ================================================================== */}

        <SwitchField
          id="invitation-rsvp-enabled"
          label={
            t(
              "enabled.label"
            )
          }
          description={
            t(
              "enabled.description"
            )
          }
          checked={
            isEnabled
          }
          onCheckedChange={
            handleEnabledChange
          }
        />


        {/* ==================================================================
            Title
        ================================================================== */}

        <Field
          id="invitation-rsvp-title"
          size="sm"
          label={
            t(
              "title.label"
            )
          }
          description={
            t(
              "title.description"
            )
          }
        >
          <Input
            value={
              rsvp.title ??
              ""
            }
            placeholder={
              t(
                "title.placeholder"
              )
            }
            disabled={
              !isEnabled
            }
            onChange={
              (event) =>
                handleTitleChange(
                  event.target.value
                )
            }
          />
        </Field>


        {/* ==================================================================
            Description
        ================================================================== */}

        <Field
          id="invitation-rsvp-description"
          size="sm"
          label={
            t(
              "description.label"
            )
          }
          description={
            t(
              "description.description"
            )
          }
        >
          <Textarea
            value={
              rsvp.description ??
              ""
            }
            placeholder={
              t(
                "description.placeholder"
              )
            }
            disabled={
              !isEnabled
            }
            onChange={
              (event) =>
                handleDescriptionChange(
                  event.target.value
                )
            }
          />
        </Field>


        {/* ==================================================================
            Deadline
        ================================================================== */}

        <Field
          id="invitation-rsvp-deadline"
          size="sm"
          label={
            t(
              "deadline.label"
            )
          }
          description={
            t(
              "deadline.description"
            )
          }
        >
          <DatePicker
            value={
              parseDateValue(
                rsvp.deadline
              )
            }
            onChange={
              handleDeadlineChange
            }
            placeholder={
              t(
                "deadline.placeholder"
              )
            }
            disabled={
              !isEnabled
            }
            clearable
            disablePast
          />
        </Field>


        {/* ==================================================================
            Success Message
        ================================================================== */}

        <Field
          id="invitation-rsvp-success-message"
          size="sm"
          label={
            t(
              "successMessage.label"
            )
          }
          description={
            t(
              "successMessage.description"
            )
          }
        >
          <Textarea
            value={
              rsvp.success_message ??
              ""
            }
            placeholder={
              t(
                "successMessage.placeholder"
              )
            }
            disabled={
              !isEnabled
            }
            onChange={
              (event) =>
                handleSuccessMessageChange(
                  event.target.value
                )
            }
          />
        </Field>
      </Section>
    </div>
  );
}