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
  publishDigitalAlbumAction,
} from "@/features/digital-albums/actions/album/publishDigitalAlbumAction";

import {
  unpublishDigitalAlbumAction,
} from "@/features/digital-albums/actions/album/unpublishDigitalAlbumAction";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumStatusActionProps {
  albumId:
    string;

  isPublished:
    boolean;
}


/* ==========================================================================
   Digital Album Status Action
========================================================================== */

export default function DigitalAlbumStatusAction({
  albumId,
  isPublished,
}: DigitalAlbumStatusActionProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    useTranslations(
      "DigitalAlbums.management.statusCard"
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
          ? await unpublishDigitalAlbumAction({
              albumId,
            })
          : await publishDigitalAlbumAction({
              albumId,
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