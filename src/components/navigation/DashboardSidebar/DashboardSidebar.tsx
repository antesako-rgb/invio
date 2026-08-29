"use client";

import {
  useState,
} from "react";

import {
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from "lucide-react";
import {
  useTranslations,
} from "next-intl";

import Logo
  from "@/components/ui/logo/Logo";

import SideNavigation
  from "@/components/ui/side-navigation/SideNavigation";

import {
  Button,
} from "@/components/ui/button";

import {
  dashboardNavigation,
} from "@/components/navigation/constants/dashboardNavigation";

import {
  useAuth,
} from "@/features/auth/hooks/useAuth";

import {
  useRouter,
} from "@/i18n/navigation";

import {
  cn,
} from "@/lib/utils/utils";

import styles from "./DashboardSidebar.module.css";


/* ==========================================================================
   Dashboard Sidebar
========================================================================== */

export default function DashboardSidebar() {
  const t =
    useTranslations(
      "Navigation.dashboard"
    );

  const {
    signOut,
  } =
    useAuth();

  const router =
    useRouter();

  const [
    collapsed,
    setCollapsed,
  ] =
    useState(false);


  /* ==========================================================================
     Logout
  ========================================================================== */

  async function handleLogout() {
    await signOut();

    router.replace(
      "/prijava"
    );

    router.refresh();
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <aside
      className={cn(
        styles.sidebar,

        collapsed &&
          styles.collapsed
      )}
    >
      <div
        className={
          styles.header
        }
      >
        <Logo
          showText={
            !collapsed
          }
        />

        <button
          type="button"
          className={
            styles.toggle
          }
          onClick={() =>
            setCollapsed(
              (value) =>
                !value
            )
          }
          aria-label={
            collapsed
              ? t(
                  "expand"
                )
              : t(
                  "collapse"
                )
          }
        >
          {collapsed ? (
            <PanelLeftOpen
              size={20}
            />
          ) : (
            <PanelLeftClose
              size={20}
            />
          )}
        </button>
      </div>

      <div
        className={
          styles.navigation
        }
      >
        {dashboardNavigation.map(
          (group) => {
            const items =
              group.items.map(
                (item) => ({
                  ...item,

                  label:
                    t(
                      item.label
                    ),
                })
              );

            return (
              <div
                key={
                  group.id
                }
                className={
                  styles.group
                }
              >
                {group.label &&
                  !collapsed && (
                    <span
                      className={
                        styles.groupLabel
                      }
                    >
                      {t(
                        group.label
                      )}
                    </span>
                  )}

                <SideNavigation
                  items={
                    items
                  }
                  collapsed={
                    collapsed
                  }
                  ariaLabel={
                    group.label
                      ? t(
                          group.label
                        )
                      : t(
                          "ariaLabel"
                        )
                  }
                />
              </div>
            );
          }
        )}
      </div>

      <div
        className={
          styles.footer
        }
      >
        {!collapsed && (
        <div
  className={
    styles.premium
  }
>
  <div
    className={
      styles.premiumHeader
    }
  >
    <div
      className={
        styles.premiumIcon
      }
    >
      <Sparkles
        size={18}
        aria-hidden="true"
      />
    </div>

    <span
      className={
        styles.premiumTitle
      }
    >
      Invio Premium
    </span>
  </div>

  <span
    className={
      styles.premiumText
    }
  >
    {t(
      "premiumDescription"
    )}
  </span>

  <Button
    size="sm"
  >
    {t(
      "premiumAction"
    )}
  </Button>
</div>
        )}

        <Button
          type="button"
          variant="ghost"
          className={
            styles.logout
          }
          onClick={
            handleLogout
          }
        >
          <LogOut
            size={18}
          />

          {!collapsed &&
            t(
              "logout"
            )}
        </Button>
      </div>
    </aside>
  );
}