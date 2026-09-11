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
  cn,
} from "@/lib/utils/utils";

import {
  eventExperienceVariants,
} from "@/features/invitations/config/eventExperienceVariants";

import {
  getEventExperienceCardOrientation,
} from "@/features/invitations/cards/utils/eventExperienceCard.utils";

import type {
  EventExperienceTemplateConfig,
} from "@/features/invitations/types/eventExperienceTemplateConfig.types";

import type {
  EventExperienceType,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceTemplateCardProps {
  type:
    EventExperienceType;

  templateId:
    string;

  template:
    EventExperienceTemplateConfig;

  disabled?:
    boolean;

  isCreating?:
    boolean;

  onSelect:
    (
      type: EventExperienceType,
      templateId: string,
      variantId: string
    ) => void;
}


/* ==========================================================================
   Event Experience Template Card
========================================================================== */

export default function EventExperienceTemplateCard({
  type,
  templateId,
  template,
  disabled = false,
  isCreating = false,
  onSelect,
}: EventExperienceTemplateCardProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    useTranslations(
      "EventExperienceTemplates"
    );


  /* ==========================================================================
     Card
  ========================================================================== */

  const orientation =
    getEventExperienceCardOrientation(
      template.card.aspectRatio
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
      type,
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
        className="
          flex
          aspect-[5/7]
          items-center
          justify-center
          bg-muted
          p-3
        "
      >
        <div
          className={
            cn(
              "relative max-h-full max-w-full overflow-hidden bg-background shadow-sm",

              orientation ===
                "portrait" &&
                "h-full",

              orientation ===
                "landscape" &&
                "w-full",

              orientation ===
                "square" &&
                "w-full"
            )
          }
          style={{
            aspectRatio:
              template.card.aspectRatio,
          }}
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
                `templates.${templateId}.name`
              )
            }
            fill
            sizes="(max-width: 767px) 100vw, 320px"
            className="object-cover"
          />
        </div>
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
              `templates.${templateId}.name`
            )}
          </CardTitle>

          <CardDescription
            className="mt-1"
          >
            {t(
              `templates.${templateId}.description`
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
                eventExperienceVariants[
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
                    size-7
                    rounded-full
                    border
                    p-1
                    transition
                    disabled:pointer-events-none
                    disabled:opacity-50
                  "
                >
                  <span
                    className="
                      block
                      size-full
                      rounded-full
                    "
                    style={{
                      backgroundColor:
                        variantConfig.swatch,
                    }}
                  />
                </button>
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