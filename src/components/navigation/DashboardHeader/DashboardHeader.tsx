"use client";

import LanguageSwitcher
  from "@/components/navigation/LanguageSwitcher/LanguageSwitcher";

import UserMenu
  from "@/components/navigation/UserMenu/UserMenu";

import Container
  from "@/components/layout/Container/Container";

import Logo
  from "@/components/ui/logo/Logo";

import styles from "./DashboardHeader.module.css";


/* ==========================================================================
   Dashboard Header
========================================================================== */

export default function DashboardHeader() {
  return (
    <header
      className={
        styles.header
      }
    >
      <Container
        className={
          styles.inner
        }
      >
        <div
          className={
            styles.logo
          }
        >
          <Logo />
        </div>

        <div
          className={
            styles.actions
          }
        >
          <LanguageSwitcher />

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
        </div>
      </Container>
    </header>
  );
}