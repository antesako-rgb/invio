import * as React from "react";

import {
  Loader2,
} from "lucide-react";

import {
  Button as ButtonPrimitive,
} from "@base-ui/react/button";

import {
  cva,
  type VariantProps,
} from "class-variance-authority";

import {
  cn,
} from "@/lib/utils/utils";


/* ==========================================================================
   Button Variants
========================================================================== */

const buttonVariants =
  cva(
    [
      "group/button",
      "inline-flex",
      "shrink-0",
      "items-center",
      "justify-center",

      "rounded-xl",

      "border",
      "border-transparent",

      "text-sm",
      "font-semibold",
      "whitespace-nowrap",

      "shadow-xs",

      "transition-all",
      "duration-200",

      "outline-none",
      "select-none",

      "focus-visible:border-primary",
      "focus-visible:ring-4",
      "focus-visible:ring-ring/30",

      "active:scale-[0.98]",

      "disabled:pointer-events-none",
      "disabled:opacity-50",

      "aria-invalid:border-destructive",
      "aria-invalid:ring-4",
      "aria-invalid:ring-destructive/20",

      "[&_svg]:pointer-events-none",
      "[&_svg]:shrink-0",
      "[&_svg:not([class*='size-'])]:size-4",
    ],
    {
      variants: {
        variant: {
          default:
            "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-sm",

          secondary:
            "bg-secondary text-secondary-foreground hover:bg-secondary/80",

          outline:
            "border-primary/40 bg-background text-primary hover:border-primary/60 hover:bg-primary/5",

          ghost:
            "shadow-none hover:bg-muted hover:text-foreground",

          destructive:
            "bg-destructive text-white hover:bg-destructive/90 hover:shadow-sm",

          destructiveOutline:
            "border-destructive/40 bg-destructive/5 text-destructive hover:border-destructive/60 hover:bg-destructive/10",

          link:
            "border-transparent bg-transparent text-primary shadow-none underline-offset-4 hover:underline",
        },

        size: {
          default:
            "h-10 gap-2 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",

          xs:
            "h-7 gap-1 rounded-lg px-2 text-xs [&_svg]:size-3",

          sm:
            "h-9 gap-1.5 rounded-lg px-3 text-sm [&_svg]:size-3.5",

          lg:
            "h-11 gap-2 px-6 text-sm",

          icon:
            "size-10",

          "icon-xs":
            "size-7 rounded-lg [&_svg]:size-3",

          "icon-sm":
            "size-9 rounded-lg",

          "icon-lg":
            "size-11",
        },
      },

      defaultVariants: {
        variant:
          "default",

        size:
          "default",
      },
    }
  );


/* ==========================================================================
   Types
========================================================================== */

export interface ButtonProps
  extends ButtonPrimitive.Props,
    VariantProps<typeof buttonVariants> {
  loading?:
    boolean;
}


/* ==========================================================================
   Button
========================================================================== */

const Button =
  React.forwardRef<
    HTMLButtonElement,
    ButtonProps
  >(function Button(
    {
      className,
      variant,
      size,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) {
    return (
      <ButtonPrimitive
        ref={ref}
        data-slot="button"
        disabled={
          disabled ||
          loading
        }
        aria-busy={
          loading ||
          undefined
        }
        className={cn(
          buttonVariants({
            variant,
            size,
          }),
          className
        )}
        {...props}
      >
        {loading && (
          <Loader2
            aria-hidden="true"
            className="size-4 animate-spin"
          />
        )}

        {children}
      </ButtonPrimitive>
    );
  });

Button.displayName =
  "Button";


/* ==========================================================================
   Types
========================================================================== */

export type ButtonVariant =
  VariantProps<
    typeof buttonVariants
  >["variant"];

export type ButtonSize =
  VariantProps<
    typeof buttonVariants
  >["size"];


/* ==========================================================================
   Exports
========================================================================== */

export {
  Button,
  buttonVariants,
};