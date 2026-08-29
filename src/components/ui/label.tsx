import * as React from "react";

import {
  cn,
} from "@/lib/utils/utils";


/* ==========================================================================
   Types
========================================================================== */

interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?:
    boolean;
}


/* ==========================================================================
   Label
========================================================================== */

const Label =
  React.forwardRef<
    HTMLLabelElement,
    LabelProps
  >(function Label(
    {
      className,
      required = false,
      children,
      ...props
    },
    ref
  ) {
    return (
      <label
        ref={ref}
        data-slot="label"
        className={cn(
          [
            "inline-flex",
            "items-center",
            "gap-1.5",
            "text-sm",
            "font-semibold",
            "leading-none",
            "tracking-tight",
            "text-foreground",
            "select-none",
          ],
          className
        )}
        {...props}
      >
        {children}

        {required && (
          <span
            data-slot="label-required"
            aria-hidden="true"
            className="text-destructive"
          >
            *
          </span>
        )}
      </label>
    );
  });

Label.displayName =
  "Label";


/* ==========================================================================
   Exports
========================================================================== */

export {
  Label,
};