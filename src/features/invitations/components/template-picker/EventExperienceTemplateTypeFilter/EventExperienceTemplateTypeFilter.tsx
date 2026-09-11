"use client";

import {
  useTranslations,
} from "next-intl";

import TabsFilter
  from "@/components/ui/filter/TabsFilter";

import type {
  EventExperienceType,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Types
========================================================================== */

export type EventExperienceTemplateTypeFilterValue =
  | "all"
  | EventExperienceType;

interface EventExperienceTemplateTypeFilterProps {
  value:
    EventExperienceTemplateTypeFilterValue;

  disabled?:
    boolean;

  onValueChange:
    (
      value:
        EventExperienceTemplateTypeFilterValue
    ) => void;
}


/* ==========================================================================
   Constants
========================================================================== */

const EVENT_EXPERIENCE_TYPES:
  EventExperienceType[] = [
    "invitation",
    "save-the-date",
    "thank-you",
    "photo-wall",
  ];


/* ==========================================================================
   Event Experience Template Type Filter
========================================================================== */

export default function EventExperienceTemplateTypeFilter({
  value,
  disabled = false,
  onValueChange,
}: EventExperienceTemplateTypeFilterProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    useTranslations(
      "EventExperienceTemplates"
    );


  /* ==========================================================================
     Items
  ========================================================================== */

  const items = [
    {
      value:
        "all",

      label:
        t(
          "types.all"
        ),
    },

    ...EVENT_EXPERIENCE_TYPES.map(
      (type) => ({
        value:
          type,

        label:
          t(
            `types.${type}`
          ),
      })
    ),
  ];


  /* ==========================================================================
     Change
  ========================================================================== */

  function handleValueChange(
    nextValue: string
  ) {
    if (disabled) {
      return;
    }

    onValueChange(
      nextValue as
        EventExperienceTemplateTypeFilterValue
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <TabsFilter
      items={
        items
      }
      value={
        value
      }
      onValueChange={
        handleValueChange
      }
    />
  );
}