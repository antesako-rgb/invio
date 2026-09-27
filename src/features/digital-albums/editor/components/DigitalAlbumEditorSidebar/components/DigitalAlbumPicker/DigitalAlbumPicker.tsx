"use client";
import type { ReactNode } from "react";

import styles
  from "./DigitalAlbumPicker.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumPickerItem<
  TValue extends string
> {
  value:
    TValue;

  label:
    string;

  preview: ReactNode;
}

interface DigitalAlbumPickerProps<
  TValue extends string
> {
  items:
    DigitalAlbumPickerItem<TValue>[];

  value?:
    TValue | null;

  onChange:
    (
      value:
        TValue
    ) => void;
}


/* ==========================================================================
   Digital Album Picker
========================================================================== */

export default function DigitalAlbumPicker<
  TValue extends string
>({
  items,
  value,
  onChange,
}: DigitalAlbumPickerProps<TValue>) {
  return (
    <div
      className={
        styles.root
      }
    >
      {items.map(
        (item) => {
          const isActive =
            value ===
            item.value;

          return (
            <button
              key={
                item.value
              }
              type="button"
              aria-pressed={isActive}
              className={
                styles.card
              }
              data-active={
                isActive
                  ? ""
                  : undefined
              }
              onClick={
                () =>
                  onChange(
                    item.value
                  )
              }
            >
              <span
                className={
                  styles.preview
                }
              >
                {item.preview}
              </span>

              <span
                className={
                  styles.label
                }
              >
                {item.label}
              </span>
            </button>
          );
        }
      )}
    </div>
  );
}
