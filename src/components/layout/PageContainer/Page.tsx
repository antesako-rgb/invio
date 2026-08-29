import type {
  HTMLAttributes,
} from "react";

import {
  cn,
} from "@/lib/utils/utils";

import styles from "./Page.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface PageProps
  extends HTMLAttributes<HTMLDivElement> {}


/* ==========================================================================
   Page
========================================================================== */

export default function Page({
  className,
  children,
  ...props
}: PageProps) {
  return (
    <div
      className={cn(
        styles.page,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}