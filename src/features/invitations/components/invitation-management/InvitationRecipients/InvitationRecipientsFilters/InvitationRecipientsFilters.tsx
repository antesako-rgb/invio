"use client";

import {
  useMemo,
} from "react";

import {
  useTranslations,
} from "next-intl";

import Search
  from "@/components/ui/search/Search";

import SelectFilter
  from "@/components/ui/select-filter/SelectFilter";

import type {
  SelectOption,
} from "@/components/ui/select";

import type {
  InvitationRecipientRsvpFilter,
} from "@/features/invitations/types/invitationRecipient.types";

import styles
  from "./InvitationRecipientsFilters.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationRecipientsFiltersProps {
  search:
    string;

  rsvpFilter:
    InvitationRecipientRsvpFilter;

  onSearchChange:
    (
      value: string
    ) => void;

  onRsvpFilterChange:
    (
      value: InvitationRecipientRsvpFilter
    ) => void;
}


/* ==========================================================================
   Invitation Recipients Filters
========================================================================== */

export default function InvitationRecipientsFilters({
  search,
  rsvpFilter,
  onSearchChange,
  onRsvpFilterChange,
}: InvitationRecipientsFiltersProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Invitations.management.recipients.filters"
    );


  /* ==========================================================================
     RSVP Options
  ========================================================================== */

  const rsvpOptions =
    useMemo<
      SelectOption<
        InvitationRecipientRsvpFilter
      >[]
    >(
      () => [
        {
          value:
            "all",

          label:
            t(
              "rsvp.all"
            ),
        },

        {
          value:
            "pending",

          label:
            t(
              "rsvp.pending"
            ),
        },

        {
          value:
            "attending",

          label:
            t(
              "rsvp.attending"
            ),
        },

        {
          value:
            "declined",

          label:
            t(
              "rsvp.declined"
            ),
        },
      ],
      [
        t,
      ]
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={
        styles.filters
      }
    >
      <Search
        value={
          search
        }
        placeholder={
          t(
            "searchPlaceholder"
          )
        }
        ariaLabel={
          t(
            "searchPlaceholder"
          )
        }
        onValueChange={
          onSearchChange
        }
      />


      <div
        className={
          styles.controls
        }
      >
        <SelectFilter
          label={
            t(
              "rsvp.label"
            )
          }
          showLabel={
            false
          }
          value={
            rsvpFilter
          }
          options={
            rsvpOptions
          }
          onValueChange={
            onRsvpFilterChange
          }
        />
      </div>
    </div>
  );
}