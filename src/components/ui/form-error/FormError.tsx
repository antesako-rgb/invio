import type {
  ReactNode,
} from "react";

import styles from "./FormError.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface FormErrorProps {
  children?:
    ReactNode;
}


/* ==========================================================================
   Form Error
========================================================================== */

export function FormError({
  children,
}: FormErrorProps) {
  if (!children) {
    return null;
  }

  return (
    <p
      role="alert"
      className={
        styles.error
      }
    >
      {children}
    </p>
  );
}