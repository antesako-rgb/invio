"use client";

import {
  Languages,
} from "lucide-react";

import {
  useLocale,
  useTranslations,
} from "next-intl";

import {
  usePathname,
  useRouter,
} from "@/i18n/navigation";

import {
  Button,
} from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type {
  Locale,
} from "@/i18n/config";

import styles from "./LanguageSwitcher.module.css";


/* ==========================================================================
   Language Switcher
========================================================================== */

export default function LanguageSwitcher() {
  const t =
    useTranslations(
      "Navigation.language"
    );

  const locale =
    useLocale() as Locale;

  const pathname =
    usePathname();

  const router =
    useRouter();


  /* ==========================================================================
     Change Locale
  ========================================================================== */

  function handleLocaleChange(
    nextLocale: Locale
  ) {
    if (
      nextLocale === locale
    ) {
      return;
    }

    router.replace(
      pathname,
      {
        locale:
          nextLocale,
      }
    );
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
            size="icon"
            className={
              styles.trigger
            }
            aria-label={
              t(
                "ariaLabel"
              )
            }
          />
        }
      >
        <Languages
          size={18}
          aria-hidden="true"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className={
          styles.content
        }
      >
        <DropdownMenuItem
          onClick={() =>
            handleLocaleChange(
              "hr"
            )
          }
          className={
            styles.item
          }
        >
          <span>
            Hrvatski
          </span>

          {locale === "hr" && (
            <span
              className={
                styles.active
              }
            >
              HR
            </span>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() =>
            handleLocaleChange(
              "en"
            )
          }
          className={
            styles.item
          }
        >
          <span>
            English
          </span>

          {locale === "en" && (
            <span
              className={
                styles.active
              }
            >
              EN
            </span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}