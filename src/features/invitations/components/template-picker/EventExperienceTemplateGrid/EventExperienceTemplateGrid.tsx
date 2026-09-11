"use client";

import EventExperienceTemplateCard
  from "@/features/invitations/components/template-picker/EventExperienceTemplateCard/EventExperienceTemplateCard";

import type {
  EventExperienceTemplateEntry,
} from "@/features/invitations/cards/registry/eventExperienceTemplateRegistry.utils";

import type {
  EventExperienceType,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceTemplateGridProps {
  templates:
    EventExperienceTemplateEntry[];

  disabled?:
    boolean;

  creatingTemplateId?:
    string | null;

  onSelect:
    (
      type: EventExperienceType,
      templateId: string,
      variantId: string
    ) => void;
}


/* ==========================================================================
   Event Experience Template Grid
========================================================================== */

export default function EventExperienceTemplateGrid({
  templates,
  disabled = false,
  creatingTemplateId = null,
  onSelect,
}: EventExperienceTemplateGridProps) {
  return (
    <div
      className="
        grid
        grid-cols-1
        gap-6
        sm:grid-cols-2
        lg:grid-cols-3
        xl:grid-cols-4
      "
    >
      {templates.map(
        ({
          type,
          id,
          config,
        }) => (
          <EventExperienceTemplateCard
            key={
              `${type}:${id}`
            }
            type={
              type
            }
            templateId={
              id
            }
            template={
              config
            }
            disabled={
              disabled
            }
            isCreating={
              creatingTemplateId ===
                id
            }
            onSelect={
              onSelect
            }
          />
        )
      )}
    </div>
  );
}