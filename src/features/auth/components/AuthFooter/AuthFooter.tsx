import {
  Link,
} from "@/i18n/navigation";

import styles
  from "./AuthFooter.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface AuthFooterProps {
  text:
    string;

  href:
    string;

  linkLabel:
    string;
}


/* ==========================================================================
   Auth Footer
========================================================================== */

export default function AuthFooter({
  text,
  href,
  linkLabel,
}: AuthFooterProps) {
  return (
    <footer
      className={
        styles.footer
      }
    >
      <span>
        {text}
      </span>

      <Link
        href={href}
        className={
          styles.link
        }
      >
        {linkLabel}
      </Link>
    </footer>
  );
}