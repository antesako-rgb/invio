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
  EVENT_EXPERIENCE_FONT_OPTIONS,
} from "@/features/invitations/editor/fonts/eventExperienceFonts";

import {
  useEventExperienceElementPresentation,
} from "@/features/invitations/editor/hooks/useEventExperienceElementPresentation";

import type {
  EventExperienceEditorSelection,
} from "@/features/invitations/editor/types/eventExperienceEditor.types";

import type {
  EventExperiencePresentation,
} from "@/features/invitations/types/eventExperiencePresentation.types";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceFontFamilyControlProps {
  element:
    EventExperienceEditorSelection;

  presentation:
    EventExperiencePresentation;

  onPresentationChange:
    (
      presentation: EventExperiencePresentation
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
    EVENT_EXPERIENCE_FONT_OPTIONS.find(
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
   Event Experience Font Family Control
========================================================================== */

export default function EventExperienceFontFamilyControl({
  element,
  presentation,
  onPresentationChange,
}: EventExperienceFontFamilyControlProps) {
  /* ==========================================================================
     Presentation
  ========================================================================== */

  const {
    elementPresentation,
    updatePresentation,
  } =
    useEventExperienceElementPresentation({
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
    EVENT_EXPERIENCE_FONT_OPTIONS.find(
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
    value:
      string
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
        className="event-experience-editor-toolbar__control event-experience-editor-toolbar__font"
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
        className="event-experience-editor-font-popover"
        data-event-experience-editor-ui
      >
        <div
          className="event-experience-editor-font-popover__list"
        >
          {EVENT_EXPERIENCE_FONT_OPTIONS.map(
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
                  className="event-experience-editor-font-popover__option"
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