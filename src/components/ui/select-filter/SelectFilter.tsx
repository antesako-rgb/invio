"use client";

import { cn } from "@/lib/utils/utils";

import { Select } from "@/components/ui/select";

import styles from "./SelectFilter.module.css";

/* ==========================================================================
   Types
========================================================================== */

export interface SelectFilterOption {
  value: string;

  label: string;

  disabled?: boolean;
}

interface SelectFilterProps {
  label: string;

  value: string;

  options: SelectFilterOption[];

  onValueChange: (
    value: string
  ) => void;

  disabled?: boolean;

  className?: string;
}

/* ==========================================================================
   Select Filter
========================================================================== */

export default function SelectFilter({
  label,
  value,
  options,
  onValueChange,
  disabled = false,
  className,
}: SelectFilterProps) {
  return (
    <div
      className={cn(
        styles.root,
        className
      )}
    >
      <span className={styles.label}>
        {label}
      </span>

      <Select
        aria-label={label}
        value={value}
        options={options}
        onValueChange={
          onValueChange
        }
        disabled={disabled}
      />
    </div>
  );
}