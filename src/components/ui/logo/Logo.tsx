import {
  Link,
} from "@/i18n/navigation";

import {
  Send,
} from "lucide-react";

import styles from "./Logo.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface LogoProps {
  href?:
    string;

  showText?:
    boolean;
}


/* ==========================================================================
   Logo
========================================================================== */

export default function Logo({
  href = "/",
  showText = true,
}: LogoProps) {
  return (
    <Link
      href={href}
      className={
        styles.logo
      }
      aria-label="Invio"
    >
      <span
        className={
          styles.icon
        }
      >
        <Send
          size={22}
          strokeWidth={2.25}
          aria-hidden="true"
        />
      </span>

      {showText && (
        <span
          className={
            styles.text
          }
        >
          Invio
        </span>
      )}
    </Link>
  );
}