"use client";

import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Plus,
  UsersRound,
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

  const eventText =
    useTranslations(
      "Events.header"
    );

  const {
    signOut,
  } =
    useAuth();

  const router =
    useRouter();

  const pathname =
    usePathname();

  const eventId =
    pathname.match(
      /^\/dashboard\/dogadaji\/([0-9a-f]{8}-[0-9a-f-]{27})(?:\/|$)/i
    )?.[1];


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
                href="/dashboard/dogadaji"
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
                    "events"
                  )}
                </span>
              </Link>

              <Link
                href="/dashboard/dogadaji/novi"
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
                    "newEvent"
                  )}
                </span>
              </Link>
            </nav>
          </section>

          {eventId && (
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
                 {eventText(
    "workspace"
                )}
              </span>

              <nav
                className={
                  styles.menu
                }
                aria-label={
                  eventText(
                   "workspace"
                  )
                }
              >
                <Link
                  href={`/dashboard/dogadaji/${eventId}`}
                  className={
                    styles.item
                  }
                  onClick={
                    handleNavigate
                  }
                >
                  <LayoutDashboard
                    size={
                      20
                    }
                    aria-hidden="true"
                  />

                  <span>
                    {eventText(
                      "overview"
                    )}
                  </span>
                </Link>

                <Link
                  href={`/dashboard/dogadaji/${eventId}/suradnici`}
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
                    {eventText(
                      "collaborators"
                    )}
                  </span>
                </Link>
              </nav>
            </section>
          )}

          <section
            className={
              styles.section
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