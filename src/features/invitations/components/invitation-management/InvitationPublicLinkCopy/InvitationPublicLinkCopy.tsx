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

interface InvitationPublicLinkCopyProps {
  publicPath:
    string;

  disabled?:
    boolean;
}


/* ==========================================================================
   Invitation Public Link Copy
========================================================================== */

export default function InvitationPublicLinkCopy({
  publicPath,
  disabled = false,
}: InvitationPublicLinkCopyProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    useTranslations(
      "Invitations.management.publicLinkCard.actions"
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
    if (disabled) {
      return;
    }

    const publicUrl =
      new URL(
        publicPath,
        window.location.origin
      ).toString();

    await navigator.clipboard.writeText(
      publicUrl
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
      2000
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Button
      type="button"
      variant="default"
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