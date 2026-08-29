import Link from "next/link";

import styles
  from "./not-found.module.css";


/* ==========================================================================
   Not Found
========================================================================== */

export default function NotFound() {
  return (
    <main
      className={
        styles.notFound
      }
    >
      <span
        className={
          styles.code
        }
      >
        404
      </span>

      <h1>
        Stranica nije pronađena
      </h1>

      <p>
        Stranica koju tražite
        ne postoji ili je
        premještena.
      </p>

      <Link
        href="/"
        className={
          styles.button
        }
      >
        Povratak na početnu
      </Link>
    </main>
  );
}