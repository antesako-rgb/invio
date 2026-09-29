"use client";

import {
  useState,
} from "react";

import {
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  UsersRound,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  dashboardNavigation,
} from "@/components/navigation/constants/dashboardNavigation";

import {
  Button,
} from "@/components/ui/button";

import Logo
  from "@/components/ui/logo/Logo";

import SideNavigation
  from "@/components/ui/side-navigation/SideNavigation";

import {
  useAuth,
} from "@/features/auth/hooks/useAuth";

import {
  usePathname,
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

  const projectText =
    useTranslations(
      "Projects.navigation"
    );

  const {
    signOut,
  } =
    useAuth();

  const router =
    useRouter();

  const pathname =
    usePathname();

  const projectId =
    pathname.match(
      /^\/dashboard\/projects\/([0-9a-f]{8}-[0-9a-f-]{27})(?:\/|$)/i
    )?.[1];

  const [
    collapsed,
    setCollapsed,
  ] =
    useState(
      false
    );


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
              size={
                20
              }
              aria-hidden="true"
            />
          ) : (
            <PanelLeftClose
              size={
                20
              }
              aria-hidden="true"
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

        {projectId && (
          <div
            className={
              styles.group
            }
          >
            {!collapsed && (
              <span
                className={
                  styles.groupLabel
                }
              >
                {projectText(
                  "workspace"
                )}
              </span>
            )}

            <SideNavigation
              items={[
                {
                  id:
                    "projectOverview",

                  label:
                    projectText(
                      "overview"
                    ),

                  href:
                    `/dashboard/projects/${projectId}`,

                  icon:
                    LayoutDashboard,

                  exact:
                    true,
                },

                {
                  id:
                    "collaborators",

                  label:
                    projectText(
                      "collaborators"
                    ),

                  href:
                    `/dashboard/projects/${projectId}/collaborators`,

                  icon:
                    UsersRound,

                  exact:
                    true,
                },
              ]}
              collapsed={
                collapsed
              }
              ariaLabel={
                projectText(
                  "workspace"
                )
              }
            />
          </div>
        )}
      </div>

      <div
        className={
          styles.footer
        }
      >
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
            size={
              18
            }
            aria-hidden="true"
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