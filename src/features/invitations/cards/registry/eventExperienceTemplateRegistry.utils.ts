import {
  eventExperienceTemplateRegistry,
} from "./eventExperienceTemplateRegistry";

import type {
  EventExperienceTemplateComponent,
  EventExperienceTemplateDefinition,
} from "@/features/invitations/types/eventExperienceTemplate.types";

import type {
  EventExperienceTemplateConfig,
  EventExperienceTemplateVariantConfig,
} from "@/features/invitations/types/eventExperienceTemplateConfig.types";

import type {
  EventExperienceType,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Types
========================================================================== */

export interface EventExperienceTemplateEntry {
  type:
    EventExperienceType;

  id:
    string;

  config:
    EventExperienceTemplateConfig;
}


/* ==========================================================================
   Get Event Experience Template
========================================================================== */

export function getEventExperienceTemplate(
  type:
    EventExperienceType,
  templateId:
    string
): EventExperienceTemplateDefinition | null {
  return (
    eventExperienceTemplateRegistry[
      type
    ]?.[
      templateId
    ] ??
    null
  );
}


/* ==========================================================================
   Get Event Experience Templates
========================================================================== */

export function getEventExperienceTemplates(
  type:
    EventExperienceType
): EventExperienceTemplateEntry[] {
  const templates =
    eventExperienceTemplateRegistry[
      type
    ];

  if (
    !templates
  ) {
    return [];
  }

  return Object.entries(
    templates
  ).map(
    ([
      id,
      definition,
    ]) => ({
      type,

      id,

      config:
        definition.config,
    })
  );
}


/* ==========================================================================
   Get All Event Experience Templates
========================================================================== */

export function getAllEventExperienceTemplates():
  EventExperienceTemplateEntry[] {
  return Object.entries(
    eventExperienceTemplateRegistry
  ).flatMap(
    ([
      type,
      templates,
    ]) => {
      if (
        !templates
      ) {
        return [];
      }

      return Object.entries(
        templates
      ).map(
        ([
          id,
          definition,
        ]) => ({
          type:
            type as
              EventExperienceType,

          id,

          config:
            definition.config,
        })
      );
    }
  );
}


/* ==========================================================================
   Get Event Experience Template Config
========================================================================== */

export function getEventExperienceTemplateConfig(
  type:
    EventExperienceType,
  templateId:
    string
): EventExperienceTemplateConfig | null {
  return (
    getEventExperienceTemplate(
      type,
      templateId
    )?.config ??
    null
  );
}


/* ==========================================================================
   Get Event Experience Template Component
========================================================================== */

export function getEventExperienceTemplateComponent(
  type:
    EventExperienceType,
  templateId:
    string
): EventExperienceTemplateComponent | null {
  return (
    getEventExperienceTemplate(
      type,
      templateId
    )?.component ??
    null
  );
}


/* ==========================================================================
   Get Event Experience Variant Config
========================================================================== */

export function getEventExperienceVariantConfig(
  type:
    EventExperienceType,
  templateId:
    string,
  variantId:
    string
): EventExperienceTemplateVariantConfig | null {
  const template =
    getEventExperienceTemplateConfig(
      type,
      templateId
    );

  if (
    !template
  ) {
    return null;
  }

  return (
    template.variants.find(
      (variant) =>
        variant.id ===
        variantId
    ) ??
    null
  );
}


/* ==========================================================================
   Get Default Event Experience Variant Config
========================================================================== */

export function getDefaultEventExperienceVariantConfig(
  type:
    EventExperienceType,
  templateId:
    string
): EventExperienceTemplateVariantConfig | null {
  const template =
    getEventExperienceTemplateConfig(
      type,
      templateId
    );

  if (
    !template
  ) {
    return null;
  }

  return (
    template.variants.find(
      (variant) =>
        variant.id ===
        template.defaultVariantId
    ) ??
    null
  );
}