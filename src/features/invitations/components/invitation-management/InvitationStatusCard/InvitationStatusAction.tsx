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
  publishInvitationAction,
} from "@/features/invitations/actions/invitation/publishInvitationAction";

import {
  unpublishInvitationAction,
} from "@/features/invitations/actions/invitation/unpublishInvitationAction";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationStatusActionProps {
  invitationId:
    string;

  isPublished:
    boolean;
}


/* ==========================================================================
   Invitation Status Action
========================================================================== */

export default function InvitationStatusAction({
  invitationId,
  isPublished,
}: InvitationStatusActionProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    useTranslations(
      "Invitations.management.statusCard"
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
          ? await unpublishInvitationAction({
              p_invitation_id:
                invitationId,
            })
          : await publishInvitationAction({
              p_invitation_id:
                invitationId,
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
              "published.success"
            )
          : t(
              "draft.success"
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
            "published.action"
          )
        : t(
            "draft.action"
          )}
    </Button>
  );
}