"use client";

import {
  cn,
} from "@/lib/utils/utils";

import styles
  from "./TabsFilter.module.css";


/* ==========================================================================
   Types
========================================================================== */

export interface TabsFilterItem {
  value:
    string;

  label:
    string;

  count?:
    number;

  disabled?:
    boolean;
}

interface TabsFilterProps {
  items:
    TabsFilterItem[];

  value:
    string;

  onValueChange: (
    value: string
  ) => void;

  className?:
    string;
}


/* ==========================================================================
   Tabs Filter
========================================================================== */

export default function TabsFilter({
  items,
  value,
  onValueChange,
  className,
}: TabsFilterProps) {
  return (
    <div
      className={cn(
        styles.root,
        className
      )}
    >
      {items.map(
        (item) => {
          const active =
            value ===
            item.value;

          return (
            <button
              key={
                item.value
              }
              type="button"
              aria-pressed={
                active
              }
              disabled={
                item.disabled
              }
              onClick={() => {
                if (
                  item.disabled
                ) {
                  return;
                }

                onValueChange(
                  item.value
                );
              }}
              className={cn(
                styles.tab,
                active &&
                  styles.active
              )}
            >
              <span
                className={
                  styles.label
                }
              >
                {item.label}
              </span>

              {item.count !==
                undefined && (
                <span
                  className={
                    styles.count
                  }
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        }
      )}
    </div>
  );
}