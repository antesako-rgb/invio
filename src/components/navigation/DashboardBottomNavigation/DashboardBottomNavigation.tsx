"use client";

import {
  useState,
} from "react";

import {
  useTranslations,
} from "next-intl";

import {
  Link,
  usePathname,
} from "@/i18n/navigation";

import {
  dashboardBottomNavigation,
} from "@/components/navigation/constants/dashboardBottomNavigation";

import DashboardMoreMenu
  from "@/components/navigation/DashboardMoreMenu/DashboardMoreMenu";

import {
  cn,
} from "@/lib/utils/utils";

import styles from "./DashboardBottomNavigation.module.css";


/* ==========================================================================
   Dashboard Bottom Navigation
========================================================================== */

export default function DashboardBottomNavigation() {
  const t =
    useTranslations(
      "Navigation.dashboard"
    );

  const pathname =
    usePathname();

  const [
    moreOpen,
    setMoreOpen,
  ] =
    useState(false);


  /* ==========================================================================
     Active State
  ========================================================================== */

  function isActive(
    href: string,
    exact?: boolean
  ) {
    if (exact) {
      return (
        pathname ===
        href
      );
    }

    return (
      pathname === href ||
      pathname.startsWith(
        `${href}/`
      )
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <>
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
     {dashboardBottomNavigation.map(
  (item) => {
    const Icon =
      item.icon;


    /* ==============================================================
       Action
    ============================================================== */

    if (
      !item.href
    ) {
      return (
        <button
          key={
            item.id
          }
          type="button"
          className={cn(
            styles.item,

            moreOpen &&
              styles.active
          )}
          onClick={() =>
            setMoreOpen(
              true
            )
          }
          aria-expanded={
            moreOpen
          }
          aria-label={
            t(
              item.label
            )
          }
        >
          <Icon
            size={20}
            className={
              styles.icon
            }
            aria-hidden="true"
          />

          <span
            className={
              styles.label
            }
          >
            {t(
              item.label
            )}
          </span>
        </button>
      );
    }


    /* ==============================================================
       Navigation Link
    ============================================================== */

    const active =
      isActive(
        item.href,
        item.exact
      );

    return (
      <Link
        key={
          item.id
        }
        href={
          item.href
        }
        prefetch={
          false
        }
        className={cn(
          styles.item,

          active &&
            styles.active
        )}
        aria-current={
          active
            ? "page"
            : undefined
        }
      >
        <Icon
          size={20}
          className={
            styles.icon
          }
          aria-hidden="true"
        />

        <span
          className={
            styles.label
          }
        >
          {t(
            item.label
          )}
        </span>
      </Link>
    );
  }
)}
      </nav>

      <DashboardMoreMenu
        open={
          moreOpen
        }
        onOpenChange={
          setMoreOpen
        }
      />
    </>
  );
}