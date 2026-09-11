"use client";

import {
  useState,
} from "react";

import {
  Check,
  Copy,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  Button,
} from "@/components/ui/button";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperiencePublicLinkCopyProps {
  publicPath:
    string;

  disabled?:
    boolean;
}


/* ==========================================================================
   Event Experience Public Link Copy
========================================================================== */

export default function EventExperiencePublicLinkCopy({
  publicPath,
  disabled = false,
}: EventExperiencePublicLinkCopyProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    useTranslations(
      "EventExperiences.management.publicLinkCard.actions"
    );


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    copied,
    setCopied,
  ] =
    useState(false);


  /* ==========================================================================
     Copy
  ========================================================================== */

  async function handleCopy() {
    if (
      disabled ||
      !navigator.clipboard
    ) {
      return;
    }

    const absoluteUrl =
      new URL(
        publicPath,
        window.location.origin
      ).toString();

    await navigator.clipboard.writeText(
      absoluteUrl
    );

    setCopied(
      true
    );

    window.setTimeout(
      () => {
        setCopied(
          false
        );
      },
      1600
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Button
      type="button"
      variant="outline"
      disabled={
        disabled
      }
      onClick={
        handleCopy
      }
    >
      {copied
        ? (
          <Check
            aria-hidden="true"
          />
        )
        : (
          <Copy
            aria-hidden="true"
          />
        )}

      {copied
        ? t(
            "copied"
          )
        : t(
            "copy"
          )}
    </Button>
  );
}