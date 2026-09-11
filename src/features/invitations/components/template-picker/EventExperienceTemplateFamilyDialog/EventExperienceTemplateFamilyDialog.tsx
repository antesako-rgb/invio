"use client";

import {
  useEffect,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog";

import {
  cn,
} from "@/lib/utils/utils";

import {
  getEventExperienceCardOrientation,
} from "@/features/invitations/cards/utils/eventExperienceCard.utils";

import {
  eventExperienceVariants,
} from "@/features/invitations/config/eventExperienceVariants";

import type {
  EventExperienceTemplateEntry,
} from "@/features/invitations/cards/registry/eventExperienceTemplateRegistry.utils";

import type {
  EventExperienceType,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceTemplateFamilyDialogProps {
  open:
    boolean;

  templates:
    EventExperienceTemplateEntry[];

  initialType:
    EventExperienceType;

  initialTemplateId:
    string;

  initialVariantId:
    string;

  disabled?:
    boolean;

  onOpenChange:
    (
      open: boolean
    ) => void;

  onSelect:
    (
      type: EventExperienceType,
      templateId: string,
      variantId: string
    ) => void;
}


/* ==========================================================================
   Event Experience Template Family Dialog
========================================================================== */

export default function EventExperienceTemplateFamilyDialog({
  open,
  templates,
  initialType,
  initialTemplateId,
  initialVariantId,
  disabled = false,
  onOpenChange,
  onSelect,
}: EventExperienceTemplateFamilyDialogProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

  const t =
    useTranslations(
      "EventExperienceTemplates"
    );


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    activeType,
    setActiveType,
  ] =
    useState<EventExperienceType>(
      initialType
    );

  const [
    activeTemplateId,
    setActiveTemplateId,
  ] =
    useState(
      initialTemplateId
    );

  const [
    selectedVariantId,
    setSelectedVariantId,
  ] =
    useState(
      initialVariantId
    );


  /* ==========================================================================
     Active Template
  ========================================================================== */

  const activeTemplate =
    useMemo(
      () =>
        templates.find(
          (template) =>
            template.type ===
              activeType &&
            template.id ===
              activeTemplateId
        ) ??
        templates[0] ??
        null,
      [
        activeType,
        activeTemplateId,
        templates,
      ]
    );

  const selectedVariant =
    useMemo(
      () =>
        activeTemplate?.config.variants.find(
          (variant) =>
            variant.id ===
            selectedVariantId
        ) ??
        activeTemplate?.config.variants[0] ??
        null,
      [
        activeTemplate,
        selectedVariantId,
      ]
    );

  const activeOrientation =
    useMemo(
      () =>
        activeTemplate
          ? getEventExperienceCardOrientation(
              activeTemplate.config.card.aspectRatio
            )
          : null,
      [
        activeTemplate,
      ]
    );


  /* ==========================================================================
     Matching Templates
  ========================================================================== */

  const matchingTemplates =
    useMemo(
      () =>
        templates.filter(
          (template) =>
            !(
              template.type ===
                activeTemplate?.type &&
              template.id ===
                activeTemplate?.id
            )
        ),
      [
        activeTemplate,
        templates,
      ]
    );


  /* ==========================================================================
     Reset
  ========================================================================== */

  useEffect(
    () => {
      if (!open) {
        return;
      }

      setActiveType(
        initialType
      );

      setActiveTemplateId(
        initialTemplateId
      );

      setSelectedVariantId(
        initialVariantId
      );
    },
    [
      open,
      initialType,
      initialTemplateId,
      initialVariantId,
    ]
  );


  /* ==========================================================================
     Template Change
  ========================================================================== */

  function handleTemplateChange(
    type: EventExperienceType,
    templateId: string
  ) {
    if (disabled) {
      return;
    }

    const nextTemplate =
      templates.find(
        (template) =>
          template.type ===
            type &&
          template.id ===
            templateId
      );

    if (!nextTemplate) {
      return;
    }

    const supportsCurrentVariant =
      nextTemplate.config.variants.some(
        (variant) =>
          variant.id ===
          selectedVariantId
      );

    setActiveType(
      nextTemplate.type
    );

    setActiveTemplateId(
      nextTemplate.id
    );

    if (supportsCurrentVariant) {
      return;
    }

    setSelectedVariantId(
      nextTemplate.config.defaultVariantId
    );
  }


  /* ==========================================================================
     Variant Change
  ========================================================================== */

  function handleVariantChange(
    variantId: string
  ) {
    if (disabled) {
      return;
    }

    setSelectedVariantId(
      variantId
    );
  }


  /* ==========================================================================
     Select
  ========================================================================== */

  function handleSelect() {
    if (
      disabled ||
      !activeTemplate ||
      !selectedVariant
    ) {
      return;
    }

    onSelect(
      activeTemplate.type,
      activeTemplate.id,
      selectedVariant.id
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  if (
    !activeTemplate ||
    !selectedVariant ||
    !activeOrientation
  ) {
    return null;
  }

  return (
    <Dialog
      open={
        open
      }
      onOpenChange={
        onOpenChange
      }
    >
      <DialogContent
        className="max-w-5xl"
      >
        {/* ==================================================================
            Header
        ================================================================== */}

        <DialogHeader>
          <DialogTitle>
            {t(
              `templates.${activeTemplate.id}.name`
            )}
          </DialogTitle>

          <DialogDescription>
            {t(
              `templates.${activeTemplate.id}.description`
            )}
          </DialogDescription>
        </DialogHeader>


        {/* ==================================================================
            Main
        ================================================================== */}

        <div
          className="
            grid
            gap-8
            lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]
          "
        >
          {/* ================================================================
              Preview
          ================================================================ */}

          <div
            className="
              flex
              h-[24rem]
              items-center
              justify-center
              rounded-xl
              bg-muted
              p-4
              sm:p-5
            "
          >
            <div
              className={
                cn(
                  "relative max-h-full max-w-full overflow-hidden rounded-lg bg-background shadow-sm",

                  activeOrientation ===
                    "portrait" &&
                    "h-full",

                  activeOrientation ===
                    "landscape" &&
                    "w-full",

                  activeOrientation ===
                    "square" &&
                    "h-full"
                )
              }
              style={{
                aspectRatio:
                  activeTemplate.config.card
                    .aspectRatio,
              }}
            >
              <Image
                key={
                  `${activeTemplate.type}-${activeTemplate.id}-${selectedVariant.id}`
                }
                src={
                  selectedVariant.previewUrl
                }
                alt={
                  t(
                    `templates.${activeTemplate.id}.name`
                  )
                }
                fill
                sizes="(max-width: 1023px) 100vw, 600px"
                className="object-cover"
                priority
              />
            </div>
          </div>


          {/* ================================================================
              Information
          ================================================================ */}

          <div
            className="flex flex-col"
          >
            <div>
              <p
                className="
                  mb-3
                  text-sm
                  font-medium
                "
              >
                {t(
                  "familyDialog.variants"
                )}
              </p>

              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-3
                "
                role="group"
                aria-label={
                  t(
                    "variantSelector"
                  )
                }
              >
                {activeTemplate.config.variants.map(
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
                          handleVariantChange(
                            variant.id
                          )
                        }
                        className="
                          relative
                          size-7
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
            </div>


            {/* ==============================================================
                Action
            ============================================================== */}

            <Button
              type="button"
              className="mt-8 w-full"
              disabled={
                disabled
              }
              onClick={
                handleSelect
              }
            >
              {t(
                "familyDialog.useTemplate"
              )}
            </Button>
          </div>
        </div>


        {/* ==================================================================
            Matching Designs
        ================================================================== */}

        {matchingTemplates.length > 0 && (
          <div
            className="
              mt-8
              border-t
              border-border
              pt-6
            "
          >
            <div>
              <h3
                className="
                  text-base
                  font-semibold
                  tracking-tight
                "
              >
                {t(
                  "familyDialog.matchingDesigns"
                )}
              </h3>

              <p
                className="
                  mt-1
                  text-sm
                  text-muted-foreground
                "
              >
                {t(
                  "familyDialog.matchingDesignsDescription"
                )}
              </p>
            </div>

            <div
              className="
                mt-4
                grid
                grid-cols-2
                gap-4
                sm:grid-cols-3
              "
            >
              {matchingTemplates.map(
                (template) => {
                  const previewVariant =
                    template.config.variants.find(
                      (variant) =>
                        variant.id ===
                        selectedVariant.id
                    ) ??
                    template.config.variants.find(
                      (variant) =>
                        variant.id ===
                        template.config
                          .defaultVariantId
                    ) ??
                    template.config.variants[0] ??
                    null;

                  if (!previewVariant) {
                    return null;
                  }

                  const orientation =
                    getEventExperienceCardOrientation(
                      template.config.card
                        .aspectRatio
                    );

                  return (
                    <button
                      key={
                        `${template.type}:${template.id}`
                      }
                      type="button"
                      disabled={
                        disabled
                      }
                      onClick={() =>
                        handleTemplateChange(
                          template.type,
                          template.id
                        )
                      }
                      className="
                        group
                        min-w-0
                        text-left
                        disabled:pointer-events-none
                        disabled:opacity-50
                      "
                    >
                      <div
                        className="
                          flex
                          h-40
                          items-center
                          justify-center
                          overflow-hidden
                          rounded-lg
                          border
                          border-border
                          bg-muted
                          p-3
                          transition-colors
                          group-hover:border-foreground/30
                        "
                      >
                        <div
                          className={
                            cn(
                              "relative max-h-full max-w-full overflow-hidden rounded-md bg-background shadow-sm",

                              orientation ===
                                "portrait" &&
                                "h-full",

                              orientation ===
                                "landscape" &&
                                "w-full",

                              orientation ===
                                "square" &&
                                "h-full"
                            )
                          }
                          style={{
                            aspectRatio:
                              template.config.card
                                .aspectRatio,
                          }}
                        >
                          <Image
                            src={
                              previewVariant.previewUrl
                            }
                            alt=""
                            fill
                            sizes="180px"
                            className="object-cover"
                          />
                        </div>
                      </div>

                      <div
                        className="mt-2"
                      >
                        <p
                          className="
                            truncate
                            text-sm
                            font-medium
                          "
                        >
                          {t(
                            `familyDialog.types.${template.type}`
                          )}
                        </p>

                        <p
                          className="
                            mt-0.5
                            truncate
                            text-xs
                            text-muted-foreground
                          "
                        >
                          {t(
                            `templates.${template.id}.name`
                          )}
                        </p>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}