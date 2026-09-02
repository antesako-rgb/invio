"use client";

import {
  cn,
} from "@/lib/utils/utils";

import {
  Select,
} from "@/components/ui/select";

import type {
  SelectOption,
} from "@/components/ui/select";

import styles
  from "./SelectFilter.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface SelectFilterProps<
  TValue extends string = string
> {
  label:
    string;

  showLabel?:
    boolean;

  value:
    TValue;

  options:
    readonly SelectOption<TValue>[];

  onValueChange:
    (
      value: TValue
    ) => void;

  disabled?:
    boolean;

  className?:
    string;
}


/* ==========================================================================
   Select Filter
========================================================================== */

export default function SelectFilter<
  TValue extends string = string
>({
  label,
  showLabel = true,
  value,
  options,
  onValueChange,
  disabled = false,
  className,
}: SelectFilterProps<TValue>) {
  return (
    <div
      className={cn(
        styles.root,
        className
      )}
    >
      {showLabel && (
        <span
          className={
            styles.label
          }
        >
          {label}
        </span>
      )}

      <Select
        aria-label={
          label
        }
        value={
          value
        }
        options={
          options
        }
        onValueChange={
          onValueChange
        }
        disabled={
          disabled
        }
      />
    </div>
  );
}