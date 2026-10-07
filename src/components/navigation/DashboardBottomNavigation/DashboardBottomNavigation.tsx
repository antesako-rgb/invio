"use client";
import { useProjectNavigation } from "../ProjectNavigationContext";

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
  projectBottomNavigation,
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

  const { projectId } = useProjectNavigation();
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
      <nav data-project={!!projectId}
        className={
          styles.navigation
        }
        aria-label={
          t(
            "ariaLabel"
          )
        }
      >
     {(projectId ? projectBottomNavigation(projectId) : dashboardBottomNavigation).map(
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

            (moreOpen || pathname === "/dashboard/profile" || (!!projectId && (pathname.endsWith("/collaborators") || pathname === `/dashboard/projects/${projectId}/settings`))) &&
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

    const active = projectId && item.id === "invitations" ? (pathname === `/dashboard/projects/${projectId}/invitations` || pathname.startsWith(`/dashboard/projects/${projectId}/invitations/`) || pathname.startsWith("/dashboard/invitations/")) : projectId && item.id === "event" ? !(pathname.startsWith(`/dashboard/projects/${projectId}/invitations`) || pathname.startsWith("/dashboard/invitations/") || pathname.endsWith("/collaborators") || pathname === `/dashboard/projects/${projectId}/settings`) :
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