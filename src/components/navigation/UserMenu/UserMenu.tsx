"use client";

import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  Link,
  useRouter,
} from "@/i18n/navigation";

import Avatar
  from "@/components/ui/avatar/Avatar";

import {
  Button,
} from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  useAuth,
} from "@/features/auth/hooks/useAuth";

import {
  getInitials,
} from "@/lib/utils/getInitials";

import styles from "./UserMenu.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface UserMenuProps {
  compact?:
    boolean;
}


/* ==========================================================================
   User Menu
========================================================================== */

export default function UserMenu({
  compact = false,
}: UserMenuProps) {
  const t =
    useTranslations(
      "Navigation.user"
    );

  const {
    profile,
    signOut,
  } =
    useAuth();

  const router =
    useRouter();


  /* ==========================================================================
     Profile
  ========================================================================== */

  const firstName =
    profile?.first_name?.trim() ??
    "";

  const lastName =
    profile?.last_name?.trim() ??
    "";

  const fullName =
    [
      firstName,
      lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    t(
      "fallbackName"
    );

  const initials =
    getInitials(
      fullName
    );


  /* ==========================================================================
     Logout
  ========================================================================== */

  async function handleLogout() {
    try {
      await signOut();

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
     Render
  ========================================================================== */

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            className={
              compact
                ? styles.compactTrigger
                : styles.trigger
            }
            aria-label={
              fullName
            }
          />
        }
      >
        <Avatar
          src={
            profile?.avatar_url
          }
          alt={
            fullName
          }
          fallback={
            initials
          }
          size="sm"
        />

        {!compact && (
          <>
            <div
              className={
                styles.identity
              }
            >
              <span
                className={
                  styles.name
                }
              >
                {fullName}
              </span>

              {profile?.email && (
                <span
                  className={
                    styles.email
                  }
                >
                  {profile.email}
                </span>
              )}
            </div>

            <ChevronDown
              size={16}
              className={
                styles.chevron
              }
              aria-hidden="true"
            />
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className={
          styles.content
        }
      >
        <div
          className={
            styles.profile
          }
        >
          <Avatar
            src={
              profile?.avatar_url
            }
            alt={
              fullName
            }
            fallback={
              initials
            }
            size="sm"
          />

          <div
            className={
              styles.profileIdentity
            }
          >
            <span
              className={
                styles.name
              }
            >
              {fullName}
            </span>

            {profile?.email && (
              <span
                className={
                  styles.email
                }
              >
                {profile.email}
              </span>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          render={
            <Link
              href="/dashboard"
            />
          }
        >
          <LayoutDashboard
            size={16}
            aria-hidden="true"
          />

          {t(
            "dashboard"
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          render={
            <Link
              href="/dashboard/postavke"
            />
          }
        >
          <Settings
            size={16}
            aria-hidden="true"
          />

          {t(
            "settings"
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onClick={
            handleLogout
          }
        >
          <LogOut
            size={16}
            aria-hidden="true"
          />

          {t(
            "logout"
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}