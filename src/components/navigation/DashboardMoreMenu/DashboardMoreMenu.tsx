"use client";
import { useProjectNavigation } from "../ProjectNavigationContext";

import {
  CalendarDays,
  Settings,
  LogOut,
  Plus,
  UsersRound,
  UserRound,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  Link,
  usePathname,
  useRouter,
} from "@/i18n/navigation";

import {
  Button,
} from "@/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet/Sheet";

import {
  useAuth,
} from "@/features/auth/hooks/useAuth";

import styles from "./DashboardMoreMenu.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface DashboardMoreMenuProps {
  open:
    boolean;

  onOpenChange:
    (open: boolean) => void;
}


/* ==========================================================================
   Dashboard More Menu
========================================================================== */

export default function DashboardMoreMenu({
  open,
  onOpenChange,
}: DashboardMoreMenuProps) {
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

  const { projectId, activeId } = useProjectNavigation();


  /* ==========================================================================
     Logout
  ========================================================================== */

  async function handleLogout() {
    try {
      await signOut();

      onOpenChange(
        false
      );

      router.replace(
        "/prijava"
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }
  }


  /* ==========================================================================
     Navigation
  ========================================================================== */

  function handleNavigate() {
    onOpenChange(
      false
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Sheet
      open={
        open
      }
      onOpenChange={
        onOpenChange
      }
    >
      <SheetContent
        side="bottom"
        className={
          styles.content
        }
      >
        <SheetHeader
          className={
            styles.header
          }
        >
          <SheetTitle>
            {t(
              "more"
            )}
          </SheetTitle>

          <SheetDescription
            className={
              styles.description
            }
          >
            {t(
              "moreDescription"
            )}
          </SheetDescription>
        </SheetHeader>

        <div
          className={
            styles.body
          }
        >
          <section
            className={
              styles.section
            }
          >
            <span
              className={
                styles.sectionLabel
              }
            >
              {t(
                "organize"
              )}
            </span>

            <nav
              className={
                styles.menu
              }
              aria-label={
                t(
                  "organize"
                )
              }
            >
              <Link
                href="/dashboard/projects"
                className={
                  styles.item
                }
                onClick={
                  handleNavigate
                }
              >
                <CalendarDays
                  size={
                    20
                  }
                  aria-hidden="true"
                />

                <span>
                  {t(
                    "content"
                  )}
                </span>
              </Link>

              {!projectId && (              <Link
                href="/dashboard/projects/new/event"
                className={
                  styles.item
                }
                onClick={
                  handleNavigate
                }
              >
                <Plus
                  size={
                    20
                  }
                  aria-hidden="true"
                />

                <span>
                  {t(
                    "create"
                  )}
                </span>
              </Link>)}
            </nav>
          </section>

          {projectId && (
            <section
              className={
                styles.section
              }
            >
              <span
                className={
                  styles.sectionLabel
                }
              >
                 {projectText(
    "workspace"
                )}
              </span>

              <nav
                className={
                  styles.menu
                }
                aria-label={
                  projectText(
                   "workspace"
                  )
                }
              >
                <Link
                  href={`/dashboard/projects/${projectId}/collaborators`}
                  aria-current={activeId === "collaborators" ? "page" : undefined}
                  className={
                    styles.item
                  }
                  onClick={
                    handleNavigate
                  }
                >
                  <UsersRound
                    size={
                      20
                    }
                    aria-hidden="true"
                  />

                  <span>
                    {projectText(
                      "collaborators"
                    )}
                  </span>
                </Link>
                <Link href={`/dashboard/projects/${projectId}/settings`} className={styles.item} aria-current={pathname === `/dashboard/projects/${projectId}/settings` ? "page" : undefined} onClick={handleNavigate}><Settings size={20} aria-hidden="true" /><span>{projectText("settings")}</span></Link>
              </nav>
            </section>
          )}

          <section
            className={
              styles.section
            }
          >
            <Link href="/dashboard/profile" className={styles.item} aria-current={pathname === "/dashboard/profile" ? "page" : undefined} onClick={handleNavigate}>
              <UserRound size={20} aria-hidden="true" /><span>{t("profile")}</span>
            </Link>
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
                  20
                }
                aria-hidden="true"
              />

              {t(
                "logout"
              )}
            </Button>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
