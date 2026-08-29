import {
  Link,
} from "@/i18n/navigation";

import type {
  ComponentPropsWithoutRef,
} from "react";

import type {
  VariantProps,
} from "class-variance-authority";

import {
  cn,
} from "@/lib/utils/utils";

import {
  buttonVariants,
} from "./button";


/* ==========================================================================
   Types
========================================================================== */

export interface ButtonLinkProps
  extends ComponentPropsWithoutRef<typeof Link>,
    VariantProps<
      typeof buttonVariants
    > {}


/* ==========================================================================
   Button Link
========================================================================== */

function ButtonLink({
  className,
  variant,
  size,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      data-slot="button-link"
      className={cn(
        buttonVariants({
          variant,
          size,
        }),
        className
      )}
      {...props}
    />
  );
}

ButtonLink.displayName =
  "ButtonLink";


/* ==========================================================================
   Exports
========================================================================== */

export {
  ButtonLink,
};