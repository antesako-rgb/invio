"use client";

import InvitationTemplateCard
  from "@/features/invitations/components/template-picker/InvitationTemplateCard/InvitationTemplateCard";

import type {
  InvitationTemplateConfig,
} from "@/features/invitations/types/invitationTemplateConfig.types";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationTemplateGridProps {
  templates:
    Array<{
      id:
        string;

      config:
        InvitationTemplateConfig;
    }>;

  disabled?:
    boolean;

  creatingTemplateId?:
    string | null;

  onSelect:
    (
      templateId: string,
      variantId: string
    ) => void;
}


/* ==========================================================================
   Invitation Template Grid
========================================================================== */

export default function InvitationTemplateGrid({
  templates,
  disabled = false,
  creatingTemplateId = null,
  onSelect,
}: InvitationTemplateGridProps) {
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
          id,
          config,
        }) => (
          <InvitationTemplateCard
            key={
              id
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
              creatingTemplateId === id
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