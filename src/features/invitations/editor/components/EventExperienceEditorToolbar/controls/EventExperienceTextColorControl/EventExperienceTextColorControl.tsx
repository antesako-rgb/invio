"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Palette,
  RotateCcw,
} from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover/Popover";

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
   Constants
========================================================================== */

const PRESET_COLORS = [
  "#332c27",
  "#000000",
  "#ffffff",
  "#7a6258",
  "#b76e79",
  "#c89b3c",
  "#7b8f71",
  "#617891",
] as const;


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceTextColorControlProps {
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

function rgbToHex(
  value:
    string
) {
  const match =
    value.match(
      /\d+/g
    );

  if (
    !match ||
    match.length < 3
  ) {
    return null;
  }

  const [
    red,
    green,
    blue,
  ] =
    match
      .slice(
        0,
        3
      )
      .map(
        Number
      );

  return `#${[
    red,
    green,
    blue,
  ]
    .map(
      (channel) =>
        channel
          .toString(16)
          .padStart(
            2,
            "0"
          )
    )
    .join("")}`;
}


/* ==========================================================================
   Event Experience Text Color Control
========================================================================== */

export default function EventExperienceTextColorControl({
  element,
  presentation,
  onPresentationChange,
}: EventExperienceTextColorControlProps) {
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
    computedColor,
    setComputedColor,
  ] =
    useState<string | null>(
      null
    );


  /* ==========================================================================
     Computed Color
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

      setComputedColor(
        rgbToHex(
          styles.color
        )
      );
    },
    [
      element,
      elementPresentation?.color,
    ]
  );


  /* ==========================================================================
     Color
  ========================================================================== */

  const color =
    elementPresentation?.color ??
    computedColor ??
    "#000000";


  /* ==========================================================================
     Change Color
  ========================================================================== */

  function handleColorChange(
    value:
      string
  ) {
    updatePresentation({
      color:
        value,
    });
  }


  /* ==========================================================================
     Reset Color
  ========================================================================== */

  function handleReset() {
    updatePresentation({
      color:
        undefined,
    });
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Popover>
      <PopoverTrigger
        className="event-experience-editor-toolbar__icon"
        aria-label="Text color"
      >
        <Palette
          size={16}
          aria-hidden="true"
        />
      </PopoverTrigger>

      <PopoverContent
        className="event-experience-editor-color-popover"
        data-event-experience-editor-ui
      >
        <div
          className="event-experience-editor-color-popover__presets"
        >
          {PRESET_COLORS.map(
            (presetColor) => (
              <button
                key={
                  presetColor
                }
                type="button"
                className="event-experience-editor-color-popover__preset"
                style={{
                  backgroundColor:
                    presetColor,
                }}
                aria-label={
                  presetColor
                }
                onClick={
                  () =>
                    handleColorChange(
                      presetColor
                    )
                }
              />
            )
          )}
        </div>

        <div
          className="event-experience-editor-color-popover__custom"
        >
          <input
            type="color"
            value={
              color
            }
            className="event-experience-editor-color-popover__picker"
            aria-label="Choose color"
            onChange={
              (event) =>
                handleColorChange(
                  event.target.value
                )
            }
          />

          <input
            type="text"
            value={
              color.toUpperCase()
            }
            className="event-experience-editor-color-popover__input"
            aria-label="Color value"
            readOnly
          />
        </div>

        {elementPresentation?.color && (
          <button
            type="button"
            className="event-experience-editor-color-popover__reset"
            onClick={
              handleReset
            }
          >
            <RotateCcw
              size={14}
              aria-hidden="true"
            />

            <span>
              Reset
            </span>
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}