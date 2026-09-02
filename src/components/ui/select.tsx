import * as React from "react";

import {
  ChevronDown,
} from "lucide-react";

import {
  cn,
} from "@/lib/utils/utils";


/* ==========================================================================
   Types
========================================================================== */

interface SelectOption<
  TValue extends string = string
> {
  value:
    TValue;

  label:
    string;
}

interface SelectProps<
  TValue extends string = string
>
  extends Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    | "onChange"
    | "value"
    | "defaultValue"
  > {
  value?:
    TValue;

  defaultValue?:
    TValue;

  options:
    readonly SelectOption<TValue>[];

  placeholder?:
    string;

  onChange?:
    React.ChangeEventHandler<HTMLSelectElement>;

  onValueChange?:
    (
      value: TValue
    ) => void;

  ref?:
    React.Ref<HTMLSelectElement>;
}


/* ==========================================================================
   Select
========================================================================== */

function Select<
  TValue extends string = string
>({
  className,
  options,
  placeholder,
  onValueChange,
  onChange,
  value,
  defaultValue,
  ref,
  ...props
}: SelectProps<TValue>) {
  return (
    <div
      data-slot="select-root"
      className="relative"
    >
      <select
        ref={
          ref
        }
        data-slot="select"
        value={
          value
        }
        defaultValue={
          defaultValue
        }
        className={cn(
          [
            "flex",
            "h-10",
            "w-full",
            "appearance-none",
            "rounded-xl",
            "border",
            "border-border",
            "bg-background",
            "px-3",
            "pr-10",
            "text-base",
            "text-foreground",
            "shadow-xs",
            "transition-all",
            "outline-none",

            "focus-visible:border-primary",
            "focus-visible:ring-4",
            "focus-visible:ring-ring/30",

            "disabled:pointer-events-none",
            "disabled:opacity-50",

            "aria-invalid:border-destructive",
            "aria-invalid:ring-4",
            "aria-invalid:ring-destructive/20",

            "sm:text-sm",
          ],
          className
        )}
        onChange={(
          event
        ) => {
          onChange?.(
            event
          );

          onValueChange?.(
            event.target.value as TValue
          );
        }}
        {...props}
      >
        {placeholder && (
          <option
            value=""
            disabled
          >
            {placeholder}
          </option>
        )}

        {options.map(
          (option) => (
            <option
              key={
                option.value
              }
              value={
                option.value
              }
            >
              {option.label}
            </option>
          )
        )}
      </select>

      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}


/* ==========================================================================
   Exports
========================================================================== */

export {
  Select,
};

export type {
  SelectOption,
  SelectProps,
};