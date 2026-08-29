import * as React from "react";

import {
  Label,
} from "@/components/ui/label";

import {
  cn,
} from "@/lib/utils/utils";


/* ==========================================================================
   Types
========================================================================== */

interface FieldProps
  extends React.HTMLAttributes<HTMLDivElement> {
  id?:
    string;

  label?:
    React.ReactNode;

  labelAction?:
    React.ReactNode;

  description?:
    React.ReactNode;

  error?:
    React.ReactNode;

  required?:
    boolean;

  invalid?:
    boolean;

  children:
    React.ReactNode;
}


/* ==========================================================================
   Field
========================================================================== */

function Field({
  id,
  label,
  labelAction,
  description,
  error,
  required,
  invalid,
  children,
  className,
  ...props
}: FieldProps) {
  const isInvalid =
    invalid ??
    Boolean(error);

  const describedBy =
    id
      ? error
        ? `${id}-error`
        : description
          ? `${id}-description`
          : undefined
      : undefined;


  /* ==========================================================================
     Control
  ========================================================================== */

  const child =
    React.isValidElement(
      children
    )
      ? React.cloneElement(
          children as React.ReactElement<{
            id?: string;
            "aria-invalid"?: boolean;
            "aria-describedby"?: string;
          }>,
          {
            id,

            "aria-invalid":
              isInvalid ||
              undefined,

            "aria-describedby":
              describedBy,
          }
        )
      : children;


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      data-slot="field"
      data-invalid={
        isInvalid
      }
      className={cn(
        "flex flex-col gap-2",
        className
      )}
      {...props}
    >
      {(label ||
        labelAction) && (
        <div
          data-slot="field-header"
          className="flex items-center justify-between gap-4"
        >
          {label && (
            <Label
              htmlFor={id}
              required={
                required
              }
            >
              {label}
            </Label>
          )}

          {labelAction && (
            <div
              data-slot="field-label-action"
              className="ml-auto shrink-0"
            >
              {labelAction}
            </div>
          )}
        </div>
      )}

      {child}

      {error ? (
        <p
          id={
            id
              ? `${id}-error`
              : undefined
          }
          data-slot="field-error"
          className="text-sm font-medium text-destructive"
          aria-live="polite"
        >
          {error}
        </p>
      ) : description ? (
        <p
          id={
            id
              ? `${id}-description`
              : undefined
          }
          data-slot="field-description"
          className="text-sm text-muted-foreground"
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}


/* ==========================================================================
   Exports
========================================================================== */

export {
  Field,
};