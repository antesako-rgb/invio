"use client";

import {
  useTranslations,
} from "next-intl";

import {
  Link,
  usePathname,
} from "@/i18n/navigation";

import {
  eventNavigation,
} from "@/features/events/constants/eventNavigation";

import styles from "./EventNavigation.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface EventNavigationProps {
  eventId:
    string;
}


/* ==========================================================================
   Event Navigation
========================================================================== */

export default function EventNavigation({
  eventId,
}: EventNavigationProps) {
  const t =
    useTranslations(
      "Events.navigation"
    );

  const pathname =
    usePathname();

  const basePath =
    `/dashboard/dogadaji/${eventId}`;


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <nav
      className={
        styles.navigation
      }
      aria-label={
        t(
          "ariaLabel"
        )
      }
    >
      <div
        className={
          styles.list
        }
      >
        {eventNavigation.map(
          (item) => {
            const href =
              item.path
                ? `${basePath}/${item.path}`
                : basePath;

            const isActive =
              item.exact
                ? pathname === href
                : pathname.startsWith(
                    href
                  );

            return (
              <Link
                key={
                  item.id
                }
                href={
                  href
                }
                className={
                  `${styles.link} ${
                    isActive
                      ? styles.active
                      : ""
                  }`
                }
                aria-current={
                  isActive
                    ? "page"
                    : undefined
                }
              >
                {t(
                  item.id
                )}
              </Link>
            );
          }
        )}
      </div>
    </nav>
  );
}