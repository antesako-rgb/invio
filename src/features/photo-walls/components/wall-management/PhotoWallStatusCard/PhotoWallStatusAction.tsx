"use client";
import { useActionError } from "@/lib/actions/useActionError";

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
  publishPhotoWallAction,
} from "@/features/photo-walls/actions/photos-wall/publishPhotoWallAction";

import {
  unpublishPhotoWallAction,
} from "@/features/photo-walls/actions/photos-wall/unpublishPhotoWallAction";




/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallStatusActionProps {
  photoWallId:
    string;

  isPublished:
    boolean;
}


/* ==========================================================================
   Photo Wall Status Action
========================================================================== */

export default function PhotoWallStatusAction({
  photoWallId,
  isPublished,

}: PhotoWallStatusActionProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const actionError = useActionError();
  const t =
    useTranslations(
      "PhotoWalls.management.statusCard"
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
          ? await unpublishPhotoWallAction({
              p_photo_wall_id: photoWallId,
            })
          : await publishPhotoWallAction({
              p_photo_wall_id: photoWallId,
            });

      if (!result.success) {
        toast.error(
          actionError(result.code)
        );

        return;
      }

      toast.success(
        isPublished
          ? t(
              `published.success.photo-wall`
            )
          : t(
              `draft.success.photo-wall`
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
            `published.action.photo-wall`
          )
        : t(
            `draft.action.photo-wall`
          )}
    </Button>
  );
}