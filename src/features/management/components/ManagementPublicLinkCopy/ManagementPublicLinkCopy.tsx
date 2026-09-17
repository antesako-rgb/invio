"use client";

import {
  useState,
} from "react";

import {
  Check,
  Copy,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";


/* ==========================================================================
   Types
========================================================================== */

interface ManagementPublicLinkCopyProps {
  publicPath:
    string;

  copyLabel:
    string;

  copiedLabel:
    string;

  disabled?:
    boolean;
}


/* ==========================================================================
   Management Public Link Copy
========================================================================== */

export default function ManagementPublicLinkCopy({
  publicPath,
  copyLabel,
  copiedLabel,
  disabled = false,
}: ManagementPublicLinkCopyProps) {
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
        ? copiedLabel
        : copyLabel}
    </Button>
  );
}