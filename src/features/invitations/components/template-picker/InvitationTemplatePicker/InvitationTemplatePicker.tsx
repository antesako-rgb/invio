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

import InvitationTemplateFamilyDialog
  from "@/features/invitations/components/template-picker/InvitationTemplateFamilyDialog/InvitationTemplateFamilyDialog";

import InvitationTemplateGrid
  from "@/features/invitations/components/template-picker/InvitationTemplateGrid/InvitationTemplateGrid";

import InvitationTemplateTypeFilter
  from "@/features/invitations/components/template-picker/InvitationTemplateTypeFilter/InvitationTemplateTypeFilter";

import type {
  InvitationTemplateTypeFilterValue,
} from "@/features/invitations/components/template-picker/InvitationTemplateTypeFilter/InvitationTemplateTypeFilter";

import InvitationTemplateUseDialog
  from "@/features/invitations/components/template-picker/InvitationTemplateUseDialog/InvitationTemplateUseDialog";

import {
  useInvitationTemplateActions,
} from "@/features/invitations/components/template-picker/hooks/useInvitationTemplateActions";

import type {
  Invitation,
} from "@/features/invitations/types/invitation.types";

import type {
  InvitationTemplateConfig,
} from "@/features/invitations/types/invitationTemplateConfig.types";


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

interface InvitationTemplatePickerTemplate {
  id:
    string;

  config:
    InvitationTemplateConfig;
}

interface SelectedFamilyTemplate {
  templateId:
    string;

  variantId:
    string;

  family:
    string;
}


/* ==========================================================================
   Helpers
========================================================================== */

function getFamilyTemplates(
  templates:
    InvitationTemplatePickerTemplate[]
) {
  const families =
    new Map<
      string,
      InvitationTemplatePickerTemplate
    >();

  for (const template of templates) {
    const current =
      families.get(
        template.config.family
      );

    if (!current) {
      families.set(
        template.config.family,
        template
      );

      continue;
    }

    if (
      current.config.type !==
        "invitation" &&
      template.config.type ===
        "invitation"
    ) {
      families.set(
        template.config.family,
        template
      );
    }
  }

  return Array.from(
    families.values()
  );
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
      "InvitationTemplates"
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
    templateType,
    setTemplateType,
  ] =
    useState<
      InvitationTemplateTypeFilterValue
    >(
      "all"
    );

  const [
    selectedFamilyTemplate,
    setSelectedFamilyTemplate,
  ] =
    useState<
      SelectedFamilyTemplate | null
    >(
      null
    );

  const [
    isFamilyDialogOpen,
    setFamilyDialogOpen,
  ] =
    useState(
      false
    );


  /* ==========================================================================
     Actions
  ========================================================================== */

  const {
    selectedTemplate,
    compatibleInvitations,
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
    useMemo<
      InvitationTemplatePickerTemplate[]
    >(
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


  /* ==========================================================================
     Category Templates
  ========================================================================== */

  const categoryTemplates =
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
     Filtered Templates
  ========================================================================== */

  const filteredTemplates =
    useMemo(
      () => {
        if (
          templateType === "all"
        ) {
          return getFamilyTemplates(
            categoryTemplates
          );
        }

        return categoryTemplates.filter(
          ({
            config,
          }) =>
            config.type ===
            templateType
        );
      },
      [
        categoryTemplates,
        templateType,
      ]
    );


  /* ==========================================================================
     Family Templates
  ========================================================================== */

  const familyTemplates =
    useMemo(
      () => {
        if (!selectedFamilyTemplate) {
          return [];
        }

        return templates.filter(
          ({
            config,
          }) =>
            config.family ===
            selectedFamilyTemplate.family
        );
      },
      [
        selectedFamilyTemplate,
        templates,
      ]
    );


  /* ==========================================================================
     Category Filters
  ========================================================================== */

  const filterItems =
    useMemo(
      () => [
        {
          value:
            "all",

          label:
            t(
              "categories.all"
            ),

          count:
            templateType === "all"
              ? getFamilyTemplates(
                  templates
                ).length
              : templates.filter(
                  ({
                    config,
                  }) =>
                    config.type ===
                    templateType
                ).length,
        },

        ...EVENT_TYPES.map(
          (eventType) => {
            const eventTemplates =
              templates.filter(
                ({
                  config,
                }) =>
                  config.category ===
                  eventType
              );

            return {
              value:
                eventType,

              label:
                t(
                  `categories.${eventType}`
                ),

              count:
                templateType === "all"
                  ? getFamilyTemplates(
                      eventTemplates
                    ).length
                  : eventTemplates.filter(
                      ({
                        config,
                      }) =>
                        config.type ===
                        templateType
                    ).length,
            };
          }
        ),
      ],
      [
        templateType,
        templates,
        t,
      ]
    );


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
     Template Type
  ========================================================================== */

  function handleTemplateTypeChange(
    value:
      InvitationTemplateTypeFilterValue
  ) {
    if (isPending) {
      return;
    }

    setTemplateType(
      value
    );
  }


  /* ==========================================================================
     Open Family
  ========================================================================== */

  function handleOpenFamily(
    templateId: string,
    variantId: string
  ) {
    if (isPending) {
      return;
    }

    const template =
      templates.find(
        ({
          id,
        }) =>
          id ===
          templateId
      );

    if (!template) {
      return;
    }

    setSelectedFamilyTemplate({
      templateId,
      variantId,
      family:
        template.config.family,
    });

    setFamilyDialogOpen(
      true
    );
  }


  /* ==========================================================================
     Family Dialog
  ========================================================================== */

  function handleFamilyDialogChange(
    open: boolean
  ) {
    if (
      isPending &&
      !open
    ) {
      return;
    }

    setFamilyDialogOpen(
      open
    );

    if (!open) {
      setSelectedFamilyTemplate(
        null
      );
    }
  }


  /* ==========================================================================
     Select Family Template
  ========================================================================== */

  function handleSelectFamilyTemplate(
    templateId: string,
    variantId: string
  ) {
    if (isPending) {
      return;
    }

    setFamilyDialogOpen(
      false
    );

    setSelectedFamilyTemplate(
      null
    );

    selectTemplate(
      templateId,
      variantId
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className="flex flex-col gap-6"
    >
      {/* ====================================================================
          Category Filter
      ==================================================================== */}

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


      {/* ====================================================================
          Template Type Filter
      ==================================================================== */}

      <InvitationTemplateTypeFilter
        value={
          templateType
        }
        disabled={
          isPending
        }
        onValueChange={
          handleTemplateTypeChange
        }
      />


      {/* ====================================================================
          Templates
      ==================================================================== */}

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
          handleOpenFamily
        }
      />


      {/* ====================================================================
          Family Dialog
      ==================================================================== */}

      {selectedFamilyTemplate && (
        <InvitationTemplateFamilyDialog
          open={
            isFamilyDialogOpen
          }
          templates={
            familyTemplates
          }
          initialTemplateId={
            selectedFamilyTemplate.templateId
          }
          initialVariantId={
            selectedFamilyTemplate.variantId
          }
          disabled={
            isPending
          }
          onOpenChange={
            handleFamilyDialogChange
          }
          onSelect={
            handleSelectFamilyTemplate
          }
        />
      )}


      {/* ====================================================================
          Use Dialog
      ==================================================================== */}

      {selectedTemplate && (
        <InvitationTemplateUseDialog
          open={
            isUseDialogOpen
          }
          templateName={
            t(
              `templates.${selectedTemplate.templateId}.name`
            )
          }
          variantName={
            selectedTemplate.variantId
          }
          invitations={
            compatibleInvitations
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