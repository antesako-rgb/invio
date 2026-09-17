import {
  LoaderCircle,
} from "lucide-react";

import {
  cn,
} from "@/lib/utils/utils";

import styles
  from "./Loader.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface LoaderProps {
  label?:
    string;

  className?:
    string;
}


/* ==========================================================================
   Loader
========================================================================== */

export default function Loader({
  label,
  className,
}: LoaderProps) {
  return (
    <div
      className={
        cn(
          styles.root,
          className
        )
      }
      role="status"
      aria-live="polite"
    >
      <LoaderCircle
        className={
          styles.icon
        }
        aria-hidden="true"
      />

      {label && (
        <span
          className={
            styles.label
          }
        >
          {label}
        </span>
      )}
    </div>
  );
}