"use client";

import {
  Check,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import type {
  PhotoWallColor,
} from "@/features/photo-walls/types/photoWall.types";

import "./PhotoWallColorPicker.css";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallColorPickerProps {
  value:
    PhotoWallColor;

  onChange:
    (
      color:
        PhotoWallColor
    ) => void;

  disabled?:
    boolean;
}


/* ==========================================================================
   Colors
========================================================================== */

const PHOTO_WALL_COLORS:
  PhotoWallColor[] = [
    "memiva",
    "warm",
    "sage",
    "rose",
    "blue",
    "lavender",
    "charcoal",
  ];


/* ==========================================================================
   Photo Wall Color Picker
========================================================================== */

export default function PhotoWallColorPicker({
  value,
  onChange,
  disabled = false,
}: PhotoWallColorPickerProps) {
  /* ==========================================================================
     Translation
  ========================================================================== */

const t =
  useTranslations(
    "PhotoWalls.management.settings.appearance.color"
  );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className="photo-wall-color-picker"
    >
      <div
        className="photo-wall-color-picker__header"
      >
        <h3
          className="photo-wall-color-picker__title"
        >
          {t(
            "title"
          )}
        </h3>

        <p
          className="photo-wall-color-picker__description"
        >
          {t(
            "description"
          )}
        </p>
      </div>

      <div
        className="photo-wall-color-picker__colors"
        role="radiogroup"
        aria-label={
          t(
            "title"
          )
        }
      >
        {PHOTO_WALL_COLORS.map(
          (color) => {
            const isSelected =
              value ===
              color;

            return (
              <button
                key={
                  color
                }
                type="button"
                className="photo-wall-color-picker__option"
                data-color={
                  color
                }
                data-selected={
                  isSelected
                    ? "true"
                    : undefined
                }
                role="radio"
                aria-checked={
                  isSelected
                }
                aria-label={
                  t(
                    `options.${color}`
                  )
                }
                disabled={
                  disabled
                }
                onClick={
                  () =>
                    onChange(
                      color
                    )
                }
              >
                <span
                  className="photo-wall-color-picker__swatch"
                  aria-hidden="true"
                >
                  {isSelected && (
                    <Check />
                  )}
                </span>

                <span
                  className="photo-wall-color-picker__label"
                >
                  {t(
                    `options.${color}`
                  )}
                </span>
              </button>
            );
          }
        )}
      </div>
    </div>
  );
}