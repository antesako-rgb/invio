"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  useTranslations,
} from "next-intl";

import {
  toast,
} from "sonner";

import {
  Button,
} from "@/components/ui/button";

import {
  publishEventExperienceAction,
} from "@/features/invitations/actions/experience/publishEventExperienceAction";

import {
  unpublishEventExperienceAction,
} from "@/features/invitations/actions/experience/unpublishEventExperienceAction";

import type {
  EventExperienceType,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceStatusActionProps {
  experienceId:
    string;

  isPublished:
    boolean;

  experienceType:
    EventExperienceType;
}


/* ==========================================================================
   Event Experience Status Action
========================================================================== */

export default function EventExperienceStatusAction({
  experienceId,
  isPublished,
  experienceType,
}: EventExperienceStatusActionProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    useTranslations(
      "EventExperiences.management.statusCard"
    );


  /* ==========================================================================
     Router
  ========================================================================== */

  const router =
    useRouter();


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    isPending,
    setIsPending,
  ] =
    useState(false);


  /* ==========================================================================
     Submit
  ========================================================================== */

  async function handleClick() {
    if (isPending) {
      return;
    }

    setIsPending(
      true
    );

    try {
      const result =
        isPublished
          ? await unpublishEventExperienceAction({
              experienceId,
            })
          : await publishEventExperienceAction({
              experienceId,
            });

      if (!result.success) {
        toast.error(
          result.message
        );

        return;
      }

      toast.success(
        isPublished
          ? t(
              `published.success.${experienceType}`
            )
          : t(
              `draft.success.${experienceType}`
            )
      );

      router.refresh();
    } finally {
      setIsPending(
        false
      );
    }
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Button
      type="button"
      variant={
        isPublished
          ? "destructiveOutline"
          : "default"
      }
      loading={
        isPending
      }
      disabled={
        isPending
      }
      onClick={
        handleClick
      }
    >
      {isPublished
        ? t(
            `published.action.${experienceType}`
          )
        : t(
            `draft.action.${experienceType}`
          )}
    </Button>
  );
}