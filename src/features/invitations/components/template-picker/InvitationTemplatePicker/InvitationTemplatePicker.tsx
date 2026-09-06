"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  useTranslations,
} from "next-intl";

import TabsFilter
  from "@/components/ui/filter/TabsFilter";

import {
  EVENT_TYPES,
} from "@/features/events/types/event.types";

import type {
  Event,
  EventType,
} from "@/features/events/types/event.types";

import {
  invitationTemplateRegistry,
} from "@/features/invitations/cards/registry/invitationTemplateRegistry";

import InvitationTemplateGrid
  from "@/features/invitations/components/template-picker/InvitationTemplateGrid/InvitationTemplateGrid";

import InvitationTemplateUseDialog
  from "@/features/invitations/components/template-picker/InvitationTemplateUseDialog/InvitationTemplateUseDialog";

import {
  useInvitationTemplateActions,
} from "@/features/invitations/components/template-picker/hooks/useInvitationTemplateActions";

import type {
  Invitation,
} from "@/features/invitations/types/invitation.types";


/* ==========================================================================
   Types
========================================================================== */

type InvitationTemplateCategoryFilter =
  | "all"
  | EventType;

interface InvitationTemplatePickerProps {
  eventId:
    string;

  event:
    Event;

  invitations:
    Invitation[];
}


/* ==========================================================================
   Invitation Template Picker
========================================================================== */

export default function InvitationTemplatePicker({
  eventId,
  event,
  invitations,
}: InvitationTemplatePickerProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    useTranslations(
      "Invitations.page.templates"
    );


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    category,
    setCategory,
  ] =
    useState<
      InvitationTemplateCategoryFilter
    >(
      "all"
    );


  /* ==========================================================================
     Actions
  ========================================================================== */

  const {
    selectedTemplate,
    isUseDialogOpen,
    isPending,
    creatingTemplateId,
    selectTemplate,
    applyExisting,
    createNew,
    setUseDialogOpen,
  } =
    useInvitationTemplateActions({
      eventId,
      event,
      invitations,
    });


  /* ==========================================================================
     Templates
  ========================================================================== */

  const templates =
    useMemo(
      () =>
        Object.entries(
          invitationTemplateRegistry
        ).map(
          ([
            id,
            config,
          ]) => ({
            id,
            config,
          })
        ),
      []
    );

  const filteredTemplates =
    useMemo(
      () =>
        category === "all"
          ? templates
          : templates.filter(
              ({
                config,
              }) =>
                config.category ===
                category
            ),
      [
        category,
        templates,
      ]
    );


  /* ==========================================================================
     Filters
  ========================================================================== */

  const filterItems = [
    {
      value:
        "all",

      label:
        t(
          "categories.all"
        ),

      count:
        templates.length,
    },

    ...EVENT_TYPES.map(
      (eventType) => ({
        value:
          eventType,

        label:
          t(
            `categories.${eventType}`
          ),

        count:
          templates.filter(
            ({
              config,
            }) =>
              config.category ===
              eventType
          ).length,
      })
    ),
  ];


  /* ==========================================================================
     Category
  ========================================================================== */

  function handleCategoryChange(
    value: string
  ) {
    if (isPending) {
      return;
    }

    setCategory(
      value as
        InvitationTemplateCategoryFilter
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div className="flex flex-col gap-6">
      <TabsFilter
        items={
          filterItems
        }
        value={
          category
        }
        onValueChange={
          handleCategoryChange
        }
      />

      <InvitationTemplateGrid
        templates={
          filteredTemplates
        }
        disabled={
          isPending
        }
        creatingTemplateId={
          creatingTemplateId
        }
        onSelect={
          selectTemplate
        }
      />

      {selectedTemplate && (
<InvitationTemplateUseDialog
  open={
    isUseDialogOpen
  }
  templateName={
    selectedTemplate.templateId
  }
  variantName={
    selectedTemplate.variantId
  }
  invitations={
    invitations
  }
  disabled={
    isPending
  }
  onOpenChange={
    setUseDialogOpen
  }
  onApplyExisting={
    applyExisting
  }
  onCreateNew={
    createNew
  }
/>
      )}
    </div>
  );
}