import type {
  ComponentProps,
} from "react";

import {
  ArrowLeft,
} from "lucide-react";

import {
  Link,
} from "@/i18n/navigation";

import {
  cn,
} from "@/lib/utils/utils";

import styles from "./BackLink.module.css";


/* ==========================================================================
   Types
========================================================================== */

type BackLinkProps =
  ComponentProps<typeof Link> & {
    label:
      string;
  };


/* ==========================================================================
   Back Link
========================================================================== */

export default function BackLink({
  label,
  className,
  ...props
}: BackLinkProps) {
  return (
    <Link
      className={cn(
        styles.backLink,
        className
      )}
      {...props}
    >
      <ArrowLeft
        aria-hidden="true"
        className={
          styles.icon
        }
      />

      <span>
        {label}
      </span>
    </Link>
  );
}