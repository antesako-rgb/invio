import {
  invitationTemplates,
} from "./invitationTemplates";

import type {
  InvitationTemplate,
  InvitationTemplateId,
} from "./invitationTemplates";

import {
  changeInvitationPageLayout,
  createInvitationPage,
} from "../utils/invitationDocumentOperations";

import {
  parseInvitationDocument,
} from "../utils/parseInvitationDocument";

import type {
  InvitationContent,
  InvitationDocument,
} from "../types/invitationDocument.types";


/* ==========================================================================
   Create Invitation Template Document
========================================================================== */

export function createInvitationTemplateDocument(
  id: InvitationTemplateId,
  translate: (
    key: string
  ) => string
): InvitationDocument {
  const template:
    InvitationTemplate | undefined =
      invitationTemplates.find(
        (item) =>
          item.id === id
      );

  if (!template) {
    throw new Error(
      "Unknown Invitation template"
    );
  }

  const pages =
    template.pages.map(
      (definition) => {
        const page =
          changeInvitationPageLayout(
            createInvitationPage(
              definition.type
            ),
            definition.layout
          );

        const content:
          InvitationContent = {};

        for (
          const field
          of definition.fields
        ) {
          content[field] =
            translate(
              `templates.copy.${template.id}.${definition.copy}.${field}`
            );
        }

        return {
          ...page,
          variant: definition.variant ?? "default",
          content,
        };
      }
    );

  return parseInvitationDocument({
    theme:
      template.theme,

    pages,
  });
}
