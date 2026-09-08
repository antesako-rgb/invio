"use client";

import {
  useTranslations,
} from "next-intl";

import TabsFilter
  from "@/components/ui/filter/TabsFilter";

import type {
  InvitationTemplateType,
} from "@/features/invitations/types/invitationTemplateConfig.types";


/* ==========================================================================
   Types
========================================================================== */

export type InvitationTemplateTypeFilterValue =
  | "all"
  | InvitationTemplateType;

interface InvitationTemplateTypeFilterProps {
  value:
    InvitationTemplateTypeFilterValue;

  disabled?:
    boolean;

  onValueChange:
    (
      value: InvitationTemplateTypeFilterValue
    ) => void;
}


/* ==========================================================================
   Invitation Template Types
========================================================================== */

const INVITATION_TEMPLATE_TYPES:
  readonly InvitationTemplateType[] = [
    "invitation",
    "save-the-date",
    "thank-you",
  ];


/* ==========================================================================
   Invitation Template Type Filter
========================================================================== */

export default function InvitationTemplateTypeFilter({
  value,
  disabled = false,
  onValueChange,
}: InvitationTemplateTypeFilterProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    useTranslations(
     "InvitationTemplates"
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

    ...INVITATION_TEMPLATE_TYPES.map(
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
        InvitationTemplateTypeFilterValue
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