"use client";

import {
  useTranslations,
} from "next-intl";

import {
  ButtonLink,
} from "@/components/ui/button-link";

import Logo
  from "@/components/ui/logo/Logo";

import {
  useAuth,
} from "@/features/auth/hooks/useAuth";

import {
  publicNavigation,
} from "@/components/navigation/constants/publicNavigation";

import LanguageSwitcher
  from "@/components/navigation/LanguageSwitcher/LanguageSwitcher";

import NavLink
  from "@/components/navigation/NavLink/NavLink";

import UserMenu
  from "@/components/navigation/UserMenu/UserMenu";

import styles from "./PublicNavbar.module.css";


/* ==========================================================================
   Public Navbar
========================================================================== */

export default function PublicNavbar() {
  const t =
    useTranslations(
      "Navigation.public"
    );

  const {
    user,
    loading,
  } =
    useAuth();

  const authenticated =
    !!user;


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <header
      className={
        styles.header
      }
    >
      <div
        className={
          styles.container
        }
      >
        <Logo />

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
          {publicNavigation.map(
            (item) => (
              <NavLink
                key={
                  item.href
                }
                href={
                  item.href
                }
              >
                {t(
                  item.label
                )}
              </NavLink>
            )
          )}
        </nav>

<div
  className={
    styles.actions
  }
>
  <LanguageSwitcher />

  {!loading &&
    (authenticated ? (
      <>
        <div
          className={
            styles.desktopUser
          }
        >
          <UserMenu />
        </div>

        <div
          className={
            styles.mobileUser
          }
        >
          <UserMenu
            compact
          />
        </div>
      </>
    ) : (
      <>
        <ButtonLink
          href="/prijava"
          variant="ghost"
        >
          {t(
            "login"
          )}
        </ButtonLink>

        <ButtonLink
          href="/registracija"
        >
          {t(
            "register"
          )}
        </ButtonLink>
      </>
    ))}
</div>
      </div>
    </header>
  );
}