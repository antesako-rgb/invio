"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  useRouter,
} from "@/i18n/navigation";

import {
  useTranslations,
} from "next-intl";
import {
  toast,
} from "sonner";

import TabsFilter
  from "@/components/ui/filter/TabsFilter";

import type {
  Event,
  EventType,
} from "@/features/events/types/event.types";

import {
  createInvitationAction,
} from "@/features/invitations/actions/invitation/createInvitationAction";

import {
  updateInvitationAction,
} from "@/features/invitations/actions/invitation/updateInvitationAction";

import {
  invitationTemplateRegistry,
} from "@/features/invitations/cards/registry/invitationTemplateRegistry";

import InvitationTemplateGrid
  from "@/features/invitations/components/template-picker/InvitationTemplateGrid/InvitationTemplateGrid";

import InvitationTemplateUseDialog
  from "@/features/invitations/components/template-picker/InvitationTemplateUseDialog/InvitationTemplateUseDialog";

import {
  createInvitationContentFromEvent,
} from "@/features/invitations/content/createInvitationContentFromEvent";

import {
  parseInvitationContent,
} from "@/features/invitations/renderer/parsers/parseInvitationContent";

import {
  parseInvitationPresentation,
} from "@/features/invitations/renderer/parsers/parseInvitationPresentation";
import type {
  Invitation,
} from "@/features/invitations/types/invitation.types";


/* ==========================================================================
   Types
========================================================================== */

type InvitationTemplateCategoryFilter =
  | "all"
  | EventType;

interface SelectedTemplate {
  templateId:
    string;

  variantId:
    string;
}

interface InvitationTemplatePickerProps {
  eventId:
    string;

  event:
    Event;

  invitations:
    Invitation[];
}


/* ==========================================================================
   Event Types
========================================================================== */

const EVENT_TYPES = [
  "wedding",
  "confirmation",
  "baptism",
  "communion",
  "birthday",
  "other_private",
  "conference",
  "seminar",
  "team_building",
  "reception",
  "gala_dinner",
  "other_business",
  "festival",
  "charity",
  "sports",
  "cultural",
  "music",
  "other_social",
] satisfies EventType[];


/* ==========================================================================
   Invitation Template Picker
========================================================================== */

export default function InvitationTemplatePicker({
  eventId,
  event,
  invitations,
}: InvitationTemplatePickerProps) {
  /* ==========================================================================
     Router
  ========================================================================== */

  const router =
    useRouter();


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

  const [
    selectedTemplate,
    setSelectedTemplate,
  ] =
    useState<SelectedTemplate | null>(
      null
    );

  const [
    isUseDialogOpen,
    setIsUseDialogOpen,
  ] =
    useState(false);

  const [
    isCreating,
    setIsCreating,
  ] =
    useState(false);

  const [
    isUpdating,
    setIsUpdating,
  ] =
    useState(false);


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
    setCategory(
      value as
        InvitationTemplateCategoryFilter
    );
  }


  /* ==========================================================================
     Create Invitation
  ========================================================================== */

  async function handleCreateInvitation(
    templateId: string,
    variantId: string
  ) {
    if (
      isCreating ||
      isUpdating
    ) {
      return;
    }

    setIsCreating(
      true
    );

    try {
      const result =
        await createInvitationAction({
          p_event_id:
            eventId,

          p_name:
            t(
              "newInvitationName"
            ),

          p_template_id:
            templateId,

          p_variant_id:
            variantId,

          p_content:
            createInvitationContentFromEvent(
              event
            ),

          p_presentation:
            {},
        });

      if (!result.success) {
        toast.error(
          result.message
        );

        return;
      }

      setIsUseDialogOpen(
        false
      );

      router.push(
        `/editor/pozivnice/${result.data.id}/uredi`
      );
    } finally {
      setIsCreating(
        false
      );
    }
  }


  /* ==========================================================================
     Template
  ========================================================================== */

  async function handleTemplateSelect(
    templateId: string,
    variantId: string
  ) {
    if (
      isCreating ||
      isUpdating
    ) {
      return;
    }

    if (
      invitations.length === 0
    ) {
      await handleCreateInvitation(
        templateId,
        variantId
      );

      return;
    }

    setSelectedTemplate({
      templateId,
      variantId,
    });

    setIsUseDialogOpen(
      true
    );
  }


  /* ==========================================================================
     Existing Invitation
  ========================================================================== */

  async function handleApplyExisting(
    invitationId: string
  ) {
    if (
      !selectedTemplate ||
      isCreating ||
      isUpdating
    ) {
      return;
    }

    const invitation =
      invitations.find(
        (invitation) =>
          invitation.id ===
          invitationId
      );

    if (!invitation) {
      return;
    }

    setIsUpdating(
      true
    );

    try {
const content =
  parseInvitationContent(
    invitation.content
  );

const presentation =
  parseInvitationPresentation(
    invitation.presentation
  );

const result =
  await updateInvitationAction({
    p_invitation_id:
      invitation.id,

    p_name:
      invitation.name,

    p_template_id:
      selectedTemplate.templateId,

    p_variant_id:
      selectedTemplate.variantId,

    p_content:
      content,

    p_presentation:
      presentation,
  });

      if (!result.success) {
        toast.error(
          result.message
        );

        return;
      }

      setIsUseDialogOpen(
        false
      );

      router.push(
        `/editor/pozivnice/${result.data.id}/uredi`
      );
    } finally {
      setIsUpdating(
        false
      );
    }
  }


  /* ==========================================================================
     New Invitation
  ========================================================================== */

  async function handleCreateNew() {
    if (!selectedTemplate) {
      return;
    }

    await handleCreateInvitation(
      selectedTemplate.templateId,
      selectedTemplate.variantId
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
        onSelect={
          handleTemplateSelect
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
          onOpenChange={
            setIsUseDialogOpen
          }
          onApplyExisting={
            handleApplyExisting
          }
          onCreateNew={
            handleCreateNew
          }
        />
      )}
    </div>
  );
}