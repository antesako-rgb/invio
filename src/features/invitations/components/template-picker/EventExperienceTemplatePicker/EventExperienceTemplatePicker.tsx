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
  getAllEventExperienceTemplates,
} from "@/features/invitations/cards/registry/eventExperienceTemplateRegistry.utils";

import type {
  EventExperienceTemplateEntry,
} from "@/features/invitations/cards/registry/eventExperienceTemplateRegistry.utils";

import EventExperienceTemplateFamilyDialog
  from "@/features/invitations/components/template-picker/EventExperienceTemplateFamilyDialog/EventExperienceTemplateFamilyDialog";

import EventExperienceTemplateGrid
  from "@/features/invitations/components/template-picker/EventExperienceTemplateGrid/EventExperienceTemplateGrid";

import EventExperienceTemplateTypeFilter
  from "@/features/invitations/components/template-picker/EventExperienceTemplateTypeFilter/EventExperienceTemplateTypeFilter";

import type {
  EventExperienceTemplateTypeFilterValue,
} from "@/features/invitations/components/template-picker/EventExperienceTemplateTypeFilter/EventExperienceTemplateTypeFilter";

import EventExperienceTemplateUseDialog
  from "@/features/invitations/components/template-picker/EventExperienceTemplateUseDialog/EventExperienceTemplateUseDialog";

import {
  useEventExperienceTemplateActions,
} from "@/features/invitations/components/template-picker/hooks/useEventExperienceTemplateActions";

import type {
  EventExperience,
  EventExperienceType,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Types
========================================================================== */

type EventExperienceTemplateCategoryFilter =
  | "all"
  | EventType;

interface EventExperienceTemplatePickerProps {
  eventId:
    string;

  event:
    Event;

  experiences:
    EventExperience[];
}

interface SelectedFamilyTemplate {
  type:
    EventExperienceType;

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
    EventExperienceTemplateEntry[]
) {
  const families =
    new Map<
      string,
      EventExperienceTemplateEntry
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
      current.type !==
        "invitation" &&
      template.type ===
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
   Event Experience Template Picker
========================================================================== */

export default function EventExperienceTemplatePicker({
  eventId,
  event,
  experiences,
}: EventExperienceTemplatePickerProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    useTranslations(
      "EventExperienceTemplates"
    );


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    category,
    setCategory,
  ] =
    useState<EventExperienceTemplateCategoryFilter>(
      "all"
    );

  const [
    templateType,
    setTemplateType,
  ] =
    useState<EventExperienceTemplateTypeFilterValue>(
      "all"
    );

  const [
    selectedFamilyTemplate,
    setSelectedFamilyTemplate,
  ] =
    useState<SelectedFamilyTemplate | null>(
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
    compatibleExperiences,
    isUseDialogOpen,
    isPending,
    creatingTemplateId,
    selectTemplate,
    applyExisting,
    createNew,
    setUseDialogOpen,
  } =
    useEventExperienceTemplateActions({
      eventId,
      event,
      experiences,
    });


  /* ==========================================================================
     Templates
  ========================================================================== */

const templates =
  useMemo(
    () =>
      getAllEventExperienceTemplates(),
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
            type,
          }) =>
            type ===
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
                    type,
                  }) =>
                    type ===
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
                        type,
                      }) =>
                        type ===
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
        EventExperienceTemplateCategoryFilter
    );
  }


  /* ==========================================================================
     Template Type
  ========================================================================== */

  function handleTemplateTypeChange(
    value:
      EventExperienceTemplateTypeFilterValue
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
    type: EventExperienceType,
    templateId: string,
    variantId: string
  ) {
    if (isPending) {
      return;
    }

    const template =
      templates.find(
        (template) =>
          template.type ===
            type &&
          template.id ===
            templateId
      );

    if (!template) {
      return;
    }

    setSelectedFamilyTemplate({
      type,

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
    if (isPending) {
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
    type: EventExperienceType,
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
      type,
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

      <EventExperienceTemplateTypeFilter
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

      <EventExperienceTemplateGrid
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
  <EventExperienceTemplateFamilyDialog
  open={
    isFamilyDialogOpen
  }
  templates={
    familyTemplates
  }
  initialType={
    selectedFamilyTemplate.type
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
        <EventExperienceTemplateUseDialog
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
          experiences={
            compatibleExperiences
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