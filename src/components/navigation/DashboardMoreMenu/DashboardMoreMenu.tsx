"use client";

import {
  CircleHelp,
  LogOut,
  Settings,
  User,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  Link,
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

  const {
    signOut,
  } =
    useAuth();

  const router =
    useRouter();


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
                "account"
              )}
            </span>

            <nav
              className={
                styles.menu
              }
              aria-label={
                t(
                  "account"
                )
              }
            >
              <Link
                href="/dashboard/profil"
                className={
                  styles.item
                }
                onClick={
                  handleNavigate
                }
              >
                <User
                  size={20}
                  aria-hidden="true"
                />

                <span>
                  {t(
                    "profile"
                  )}
                </span>
              </Link>

              <Link
                href="/dashboard/postavke"
                className={
                  styles.item
                }
                onClick={
                  handleNavigate
                }
              >
                <Settings
                  size={20}
                  aria-hidden="true"
                />

                <span>
                  {t(
                    "settings"
                  )}
                </span>
              </Link>

              <Link
                href="/pomoc"
                className={
                  styles.item
                }
                onClick={
                  handleNavigate
                }
              >
                <CircleHelp
                  size={20}
                  aria-hidden="true"
                />

                <span>
                  {t(
                    "support"
                  )}
                </span>
              </Link>
            </nav>
          </section>

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
                size={20}
                aria-hidden="true"
              />

              {t(
                "logout"
              )}
            </Button>
          </section>

          <section
            className={
              styles.premium
            }
          >
            <div
              className={
                styles.premiumContent
              }
            >
              <span
                className={
                  styles.premiumTitle
                }
              >
                Invio Premium
              </span>

              <p
                className={
                  styles.premiumText
                }
              >
                {t(
                  "premiumDescription"
                )}
              </p>
            </div>

            <Button
              className={
                styles.premiumButton
              }
            >
              {t(
                "premiumAction"
              )}
            </Button>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}