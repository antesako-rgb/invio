"use client";

import {
  useMemo,
  useState,
} from "react";

import Image
  from "next/image";

import {
  useTranslations,
} from "next-intl";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardMedia,
  CardTitle,
} from "@/components/ui/card";

import {
  invitationVariants,
} from "@/features/invitations/config/invitationVariants";

import type {
  InvitationTemplateConfig,
} from "@/features/invitations/types/invitationTemplateConfig.types";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationTemplateCardProps {
  templateId:
    string;

  template:
    InvitationTemplateConfig;

  disabled?:
    boolean;

  isCreating?:
    boolean;

  onSelect:
    (
      templateId: string,
      variantId: string
    ) => void;
}


/* ==========================================================================
   Invitation Template Card
========================================================================== */

export default function InvitationTemplateCard({
  templateId,
  template,
  disabled = false,
  isCreating = false,
  onSelect,
}: InvitationTemplateCardProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    useTranslations(
      "Invitations.page.templates"
    );


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    selectedVariantId,
    setSelectedVariantId,
  ] =
    useState(
      template.defaultVariantId
    );


  /* ==========================================================================
     Variant
  ========================================================================== */

  const selectedVariant =
    useMemo(
      () =>
        template.variants.find(
          (variant) =>
            variant.id ===
            selectedVariantId
        ) ??
        template.variants[0] ??
        null,
      [
        selectedVariantId,
        template.variants,
      ]
    );


  /* ==========================================================================
     Select
  ========================================================================== */

  function handleSelect() {
    if (
      disabled ||
      !selectedVariant
    ) {
      return;
    }

    onSelect(
      templateId,
      selectedVariant.id
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  if (!selectedVariant) {
    return null;
  }

  return (
    <Card
      variant="interactive"
      shadow="sm"
      radius="lg"
      className="flex h-full flex-col"
    >
      {/* ====================================================================
          Preview
      ==================================================================== */}

      <CardMedia
        className="relative aspect-[5/7] bg-muted"
      >
        <Image
          key={
            selectedVariant.id
          }
          src={
            selectedVariant.previewUrl
          }
          alt={
            t(
              `${templateId}.name`
            )
          }
          fill
          sizes="(max-width: 767px) 100vw, 320px"
          className="object-cover"
        />
      </CardMedia>


      {/* ====================================================================
          Content
      ==================================================================== */}

      <CardContent
        spacing="sm"
        className="flex-1"
      >
        <div>
          <CardTitle>
            {t(
              `${templateId}.name`
            )}
          </CardTitle>

          <CardDescription
            className="mt-1"
          >
            {t(
              `${templateId}.description`
            )}
          </CardDescription>
        </div>


        {/* ==================================================================
            Variants
        ================================================================== */}

        <div
          className="flex items-center gap-2"
          role="group"
          aria-label={
            t(
              "variantSelector"
            )
          }
        >
          {template.variants.map(
            (variant) => {
              const variantConfig =
                invitationVariants[
                  variant.id
                ];

              const selected =
                variant.id ===
                selectedVariant.id;

              return (
                <button
                  key={
                    variant.id
                  }
                  type="button"
                  title={
                    variantConfig.label
                  }
                  aria-label={
                    variantConfig.label
                  }
                  aria-pressed={
                    selected
                  }
                  disabled={
                    disabled
                  }
                  onClick={() =>
                    setSelectedVariantId(
                      variant.id
                    )
                  }
                  className="
                    relative
                    size-6
                    shrink-0
                    rounded-full
                    border
                    border-border
                    transition-all
                    hover:scale-110
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-ring
                    focus-visible:ring-offset-2
                    aria-pressed:ring-2
                    aria-pressed:ring-primary
                    aria-pressed:ring-offset-2
                    disabled:pointer-events-none
                    disabled:opacity-50
                  "
                  style={{
                    background:
                      variantConfig.swatch,
                  }}
                />
              );
            }
          )}
        </div>
      </CardContent>


      {/* ====================================================================
          Footer
      ==================================================================== */}

      <CardFooter>
        <Button
          type="button"
          className="w-full"
          disabled={
            disabled
          }
          onClick={
            handleSelect
          }
        >
          {isCreating
            ? t(
                "creating"
              )
            : t(
                "useTemplate"
              )}
        </Button>
      </CardFooter>
    </Card>
  );
}