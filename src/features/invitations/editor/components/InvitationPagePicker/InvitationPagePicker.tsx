import {
  useState,
} from "react";

import {
  useTranslations,
} from "next-intl";

import {
  Button,
} from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog/dialog";

import EditorPageAddButton
  from "@/features/editor/components/pages/EditorPageAddButton/EditorPageAddButton";

import {
  invitationPageTypes,
  type InvitationPageType,
} from "../../../config/invitationPageTypes";

import type {
  InvitationTheme,
} from "../../../config/invitationThemes";

import {
  getInvitationLayout,
} from "../../../config/invitationLayouts";

import {
  getInvitationPageDesigns,
  type InvitationPageDesign,
} from "../../../config/invitationPageDesigns";

import InvitationThumbnail
  from "../InvitationThumbnail/InvitationThumbnail";

import styles
  from "./InvitationPagePicker.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationPagePickerProps {
  rsvpExists?: boolean;
  theme: InvitationTheme;
  disabled: boolean;
  onAdd: (
    type: InvitationPageType,
    designId: string
  ) => void;
}


/* ==========================================================================
   Invitation Page Picker
========================================================================== */

export default function InvitationPagePicker({
  theme,
  disabled,
  onAdd,
  rsvpExists = false,
}: InvitationPagePickerProps) {
  const t =
    useTranslations(
      "Invitations"
    );

  const [
    open,
    setOpen,
  ] =
    useState(
      false
    );

  const [
    selected,
    setSelected,
  ] =
    useState<InvitationPageType | null>(
      null
    );

  const types =
    Object.keys(
      invitationPageTypes
    ).filter(type => type !== "rsvp" || !rsvpExists) as InvitationPageType[];

  const choices =
    selected
      ? getInvitationPageDesigns(
          selected,
          theme
        ).map(
          design => ({
            type: selected,
            design,
          })
        )
      : types.map(
          type => ({
            type,
            design:
              getInvitationPageDesigns(
                type,
                theme
              )[0],
          })
        );


  /* ==========================================================================
     Open Picker
  ========================================================================== */

  function openPicker() {
    setSelected(
      null
    );

    setOpen(
      true
    );
  }


  /* ==========================================================================
     Choose Page
  ========================================================================== */

  function choosePage(
    type: InvitationPageType,
    design: InvitationPageDesign
  ) {
    if (!selected) {
      setSelected(
        type
      );

      return;
    }

    onAdd(
      type,
      design.id
    );

    setOpen(
      false
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <>
      <EditorPageAddButton
        label={
          t(
            "editor.addPage"
          )
        }
        disabled={
          disabled
        }
        onClick={
          openPicker
        }
      />

      <Dialog
        open={
          open
        }
        onOpenChange={
          setOpen
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t(
                "editor.addPage"
              )}
            </DialogTitle>

            <DialogDescription>
              {t(
                selected
                  ? "editor.chooseDesign"
                  : "editor.choosePageType"
              )}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <Button
              variant="ghost"
              onClick={
                () =>
                  setSelected(
                    null
                  )
              }
            >
              {t(
                "back"
              )}
            </Button>
          )}

          <div
            className={
              styles.pickerGrid
            }
          >
            {choices.map(
              ({
                type,
                design,
              }) => (
                <button
                  type="button"
                  className={
                    styles.pickerCard
                  }
                  disabled={
                    disabled
                  }
                  key={
                    `${type}:${design.id}`
                  }
                  onClick={
                    () =>
                      choosePage(
                        type,
                        design
                      )
                  }
                >
                  <InvitationThumbnail
                    document={{
                      theme,
                      pages: [
                        {
                          id:
                            `preview-${type}`,
                          type,
                          layout:
                            design.layout,
                          variant:
                            design.variant,
                          layoutVersion:
                            1,
                          content: {
                            title:
                              t(
                                `types.${type}`
                              ),
                          },
                          photos:
                            Array.from(
                              {
                                length:
                                  getInvitationLayout(
                                    design.layout
                                  ).photoSlotCount,
                              },
                              (
                                _,
                                index
                              ) => ({
                                id:
                                  `preview-slot-${index}`,
                                photoId:
                                  null,
                              })
                            ),
                        },
                      ],
                    }}
                  />

                  <span>
                    {t(
                      selected
                        ? design.label
                        : `types.${type}`
                    )}
                  </span>
                </button>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
