"use client";

import type {
  LucideIcon,
} from "lucide-react";

import styles
  from "./EditorMobileNavigation.module.css";


/* ==========================================================================
   Types
========================================================================== */

export interface EditorMobileNavigationItem {
  id:
    string;

  label:
    string;

  icon:
    LucideIcon;
}

interface EditorMobileNavigationProps {
  items:
    EditorMobileNavigationItem[];

  activeId?:
    string;

  ariaLabel:
    string;

  onNavigate:
    (
      id:
        string
    ) => void;
}


/* ==========================================================================
   Editor Mobile Navigation
========================================================================== */

export default function EditorMobileNavigation({
  items,
  activeId,
  ariaLabel,
  onNavigate,
}: EditorMobileNavigationProps) {
  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <nav
      className={
        styles.root
      }
      aria-label={
        ariaLabel
      }
      data-editor-mobile-navigation
    >
      {items.map(
        (
          item
        ) => {
          const isActive =
            item.id ===
            activeId;

          const Icon =
            item.icon;

          return (
            <button
              key={
                item.id
              }
              type="button"
              className={
                styles.item
              }
              data-active={
                isActive
                  ? ""
                  : undefined
              }
              aria-current={
                isActive
                  ? "page"
                  : undefined
              }
              onClick={
                () =>
                  onNavigate(
                    item.id
                  )
              }
            >
              <span
                className={
                  styles.icon
                }
                aria-hidden="true"
              >
                <Icon
                  aria-hidden="true"
                />
              </span>

              <span
                className={
                  styles.label
                }
              >
                {item.label}
              </span>
            </button>
          );
        }
      )}
    </nav>
  );
}