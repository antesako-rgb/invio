"use client";

import {
  useRef,
  useState,
} from "react";

import {
  useTranslations,
} from "next-intl";

import {
  toast,
} from "sonner";

import {
  useRouter,
} from "@/i18n/navigation";

import {
  isEventType,
} from "@/features/events/types/event.types";

import type {
  Event,
} from "@/features/events/types/event.types";

import {
  createInvitationAction,
} from "@/features/invitations/actions/invitation/createInvitationAction";

import {
  updateInvitationAction,
} from "@/features/invitations/actions/invitation/updateInvitationAction";

import {
  createInitialInvitationContent,
} from "@/features/invitations/content/createInitialInvitationContent";

import {
  getInvitationEditorFallback,
} from "@/features/invitations/editor/data/InvitationEditorFallbacks";

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

interface SelectedTemplate {
  templateId:
    string;

  variantId:
    string;
}

interface UseInvitationTemplateActionsOptions {
  eventId:
    string;

  event:
    Event;

  invitations:
    Invitation[];
}


/* ==========================================================================
   Use Invitation Template Actions
========================================================================== */

export function useInvitationTemplateActions({
  eventId,
  event,
  invitations,
}: UseInvitationTemplateActionsOptions) {
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

  const contentT =
    useTranslations(
      "InvitationContent"
    );


  /* ==========================================================================
     State
  ========================================================================== */

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

  const [
    creatingTemplateId,
    setCreatingTemplateId,
  ] =
    useState<string | null>(
      null
    );


  /* ==========================================================================
     Locks
  ========================================================================== */

  const isCreatingRef =
    useRef(false);

  const isUpdatingRef =
    useRef(false);


  /* ==========================================================================
     Pending
  ========================================================================== */

  const isPending =
    isCreating ||
    isUpdating;


  /* ==========================================================================
     Create Invitation
  ========================================================================== */

  async function createInvitation(
    templateId: string,
    variantId: string
  ) {
    if (
      isCreatingRef.current ||
      isUpdatingRef.current
    ) {
      return;
    }

    isCreatingRef.current =
      true;

    setIsCreating(
      true
    );

    setCreatingTemplateId(
      templateId
    );

    try {
      if (!isEventType(event.type)) {
        throw new Error(
          `Unsupported event type: ${event.type}`
        );
      }

      const eventFallback =
        getInvitationEditorFallback(
          event.type
        );

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
            createInitialInvitationContent(
              event,
              {
                primaryName:
                  eventFallback.primaryName,

                secondaryName:
                  eventFallback.secondaryName,

                heroTitle:
                  contentT(
                    `${event.type}.heroTitle`
                  ),

                heroSubtitle:
                  contentT(
                    `${event.type}.heroSubtitle`
                  ),

                firstInitial:
                  eventFallback.firstInitial,

                secondInitial:
                  eventFallback.secondInitial,

                description:
                  contentT(
                    `${event.type}.description`
                  ),
              }
            ),

          p_presentation:
            {},
        });

      if (!result.success) {
        isCreatingRef.current =
          false;

        setIsCreating(
          false
        );

        setCreatingTemplateId(
          null
        );

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
    } catch (error) {
      isCreatingRef.current =
        false;

      setIsCreating(
        false
      );

      setCreatingTemplateId(
        null
      );

      throw error;
    }
  }


  /* ==========================================================================
     Select Template
  ========================================================================== */

  async function selectTemplate(
    templateId: string,
    variantId: string
  ) {
    if (
      isCreatingRef.current ||
      isUpdatingRef.current
    ) {
      return;
    }

    if (
      invitations.length === 0
    ) {
      await createInvitation(
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
     Apply Existing
  ========================================================================== */

  async function applyExisting(
    invitationId: string
  ) {
    if (
      !selectedTemplate ||
      isCreatingRef.current ||
      isUpdatingRef.current
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

    isUpdatingRef.current =
      true;

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
        isUpdatingRef.current =
          false;

        setIsUpdating(
          false
        );

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
    } catch (error) {
      isUpdatingRef.current =
        false;

      setIsUpdating(
        false
      );

      throw error;
    }
  }


  /* ==========================================================================
     Create New
  ========================================================================== */

  async function createNew() {
    if (
      !selectedTemplate ||
      isCreatingRef.current ||
      isUpdatingRef.current
    ) {
      return;
    }

    await createInvitation(
      selectedTemplate.templateId,
      selectedTemplate.variantId
    );
  }


  /* ==========================================================================
     Dialog
  ========================================================================== */

  function setUseDialogOpen(
    open: boolean
  ) {
    if (isPending) {
      return;
    }

    setIsUseDialogOpen(
      open
    );
  }


  /* ==========================================================================
     Return
  ========================================================================== */

  return {
    selectedTemplate,
    isUseDialogOpen,
    isCreating,
    isUpdating,
    isPending,
    creatingTemplateId,
    selectTemplate,
    applyExisting,
    createNew,
    setUseDialogOpen,
  };
}