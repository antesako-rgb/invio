import type {
  ReactNode,
} from "react";

import styles from "./Container.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface ContainerProps {
  children:
    ReactNode;

  className?:
    string;
}


/* ==========================================================================
   Container
========================================================================== */

export default function Container({
  children,
  className,
}: ContainerProps) {
  return (
    <div
      className={
        [
          styles.container,
          className,
        ]
          .filter(Boolean)
          .join(" ")
      }
    >
      {children}
    </div>
  );
}