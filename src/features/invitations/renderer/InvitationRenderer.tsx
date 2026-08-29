import {
  invitationCardRegistry,
} from "@/features/invitations/cards/registry/invitationCardRegistry";

import {
  getInvitationTemplateConfig,
} from "@/features/invitations/cards/registry/invitationTemplateRegistry.utils";

import InvitationEnvelope
  from "@/features/invitations/experience/envelope/InvitationEnvelope/InvitationEnvelope";

import InvitationExperience
  from "@/features/invitations/experience/InvitationExperience/InvitationExperience";

import type {
  InvitationRendererProps,
} from "@/features/invitations/types/invitationRenderer.types";


/* ==========================================================================
   Invitation Renderer
========================================================================== */

export default function InvitationRenderer({
  templateId,
  variantId,
  mode,
  data,
  editor,
}: InvitationRendererProps) {
  const Card =
    invitationCardRegistry[
      templateId
    ];

  const template =
    getInvitationTemplateConfig(
      templateId
    );

  if (
    !Card ||
    !template
  ) {
    return null;
  }

  const card = (
    <Card
      data={
        data
      }
      mode={
        mode
      }
      editor={
        editor
      }
    />
  );

  return (
    <InvitationExperience
      templateId={
        templateId
      }
      variantId={
        variantId
      }
      mode={
        mode
      }
    >
      {mode === "edit"
        ? card
        : (
          <InvitationEnvelope
            envelopeId={
              template.envelopeId
            }
          >
            {card}
          </InvitationEnvelope>
        )}
    </InvitationExperience>
  );
}