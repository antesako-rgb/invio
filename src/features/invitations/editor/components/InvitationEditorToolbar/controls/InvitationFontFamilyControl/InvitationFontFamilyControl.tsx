"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Check,
  Type,
} from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover/Popover";

import {
  INVITATION_FONT_OPTIONS,
} from "@/features/invitations/fonts/invitationFonts";

import {
  useInvitationElementPresentation,
} from "@/features/invitations/editor/hooks/useInvitationElementPresentation";

import type {
  InvitationEditorSelection,
} from "@/features/invitations/editor/types/invitationEditor.types";

import type {
  InvitationPresentation,
} from "@/features/invitations/types/invitationPresentation.types";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationFontFamilyControlProps {
  element:
    InvitationEditorSelection;

  presentation:
    InvitationPresentation;

  onPresentationChange:
    (
      presentation: InvitationPresentation
    ) => void;
}


/* ==========================================================================
   Helpers
========================================================================== */

function getFontLabel(
  fontFamily:
    string | null
) {
  if (!fontFamily) {
    return null;
  }

  const normalizedFontFamily =
    fontFamily
      .replaceAll(
        '"',
        ""
      )
      .toLowerCase();

  const matchingFont =
    INVITATION_FONT_OPTIONS.find(
      (font) =>
        normalizedFontFamily.includes(
          font.label.toLowerCase()
        )
    );

  if (matchingFont) {
    return matchingFont.label;
  }

  const [
    firstFontFamily,
  ] =
    fontFamily.split(
      ","
    );

  return firstFontFamily
    ?.replaceAll(
      '"',
      ""
    )
    .trim() ??
    null;
}


/* ==========================================================================
   Invitation Font Family Control
========================================================================== */

export default function InvitationFontFamilyControl({
  element,
  presentation,
  onPresentationChange,
}: InvitationFontFamilyControlProps) {
  /* ==========================================================================
     Presentation
  ========================================================================== */

  const {
    elementPresentation,
    updatePresentation,
  } =
    useInvitationElementPresentation({
      element,
      presentation,
      onPresentationChange,
    });


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    computedFontFamily,
    setComputedFontFamily,
  ] =
    useState<string | null>(
      null
    );


  /* ==========================================================================
     Computed Font Family
  ========================================================================== */

  useEffect(
    () => {
      const target =
        document.querySelector<HTMLElement>(
          `[data-editor-element="${element}"]`
        );

      if (!target) {
        return;
      }

      const styles =
        window.getComputedStyle(
          target
        );

      setComputedFontFamily(
        styles.fontFamily
      );
    },
    [
      element,
      elementPresentation?.font_family,
    ]
  );


  /* ==========================================================================
     Font Family
  ========================================================================== */

  const selectedFont =
    INVITATION_FONT_OPTIONS.find(
      (font) =>
        font.value ===
        elementPresentation?.font_family
    );

  const fontLabel =
    selectedFont?.label ??
    getFontLabel(
      computedFontFamily
    ) ??
    "—";


  /* ==========================================================================
     Change Font
  ========================================================================== */

  function handleFontChange(
    value: string
  ) {
    updatePresentation({
      font_family:
        value,
    });
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Popover>
      <PopoverTrigger
        className="invitation-editor-toolbar__control invitation-editor-toolbar__font"
      >
        <Type
          size={16}
          aria-hidden="true"
        />

        <span>
          {fontLabel}
        </span>
      </PopoverTrigger>

     <PopoverContent
  className="invitation-editor-font-popover"
  data-invitation-editor-ui
      >
        <div
          className="invitation-editor-font-popover__list"
        >
          {INVITATION_FONT_OPTIONS.map(
            (font) => {
              const isSelected =
                elementPresentation?.font_family ===
                font.value;

              return (
                <button
                  key={
                    font.value
                  }
                  type="button"
                  className="invitation-editor-font-popover__option"
                  style={{
                    fontFamily:
                      font.value,
                  }}
                  onClick={
                    () =>
                      handleFontChange(
                        font.value
                      )
                  }
                >
                  <span>
                    {font.label}
                  </span>

                  {isSelected && (
                    <Check
                      size={16}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            }
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}