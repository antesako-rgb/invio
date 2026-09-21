"use client";

import styles
  from "./DigitalAlbumPicker.module.css";


/* ==========================================================================
   Types
========================================================================== */

export interface DigitalAlbumPickerItem<
  TValue extends string
> {
  value:
    TValue;

  label:
    string;

  imageSrc:
    string;
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
                <img
                  src={
                    item.imageSrc
                  }
                  alt=""
                  className={
                    styles.previewImage
                  }
                />
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