"use client";

import type {
  MouseEvent,
} from "react";

import {
  Link,
  usePathname,
} from "@/i18n/navigation";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip/tooltip";

import {
  cn,
} from "@/lib/utils/utils";

import type {
  SideNavigationProps,
} from "./types";

import styles from "./SideNavigation.module.css";


/* ==========================================================================
   Side Navigation
========================================================================== */

export default function SideNavigation({
  items,
  variant = "route",
  appearance = "default",
  activeId,
  collapsed = false,
  onNavigate,
  onControlledNavigate,
  ariaLabel = "Navigation",
}: SideNavigationProps) {
  const pathname =
    usePathname();


  /* ==========================================================================
     Anchor Navigation
  ========================================================================== */

  function handleAnchorClick(
    e:
      MouseEvent<HTMLAnchorElement>,
    id:
      string
  ) {
    e.preventDefault();

    window.history.replaceState(
      null,
      "",
      `#${id}`
    );

    const element =
      document.getElementById(
        id
      );

    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior:
        "smooth",

      block:
        "start",
    });

    onNavigate?.();
  }


  /* ==========================================================================
     Controlled Navigation
  ========================================================================== */

  function handleControlledClick(
    id:
      string
  ) {
    onControlledNavigate?.(
      id
    );
  }


  /* ==========================================================================
     Appearance
  ========================================================================== */

  const isHorizontal =
    appearance === "tabs" ||
    appearance === "underline";


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <nav
      className={cn(
        styles.nav,

        isHorizontal &&
          styles.horizontal,

        appearance === "tabs" &&
          styles.tabs,

        appearance === "underline" &&
          styles.underline
      )}
      aria-label={
        ariaLabel
      }
    >
      {items.map(
        (item) => {
          const Icon =
            item.icon;

          const active =
            variant === "route"
              ? item.exact
                ? pathname ===
                  item.href
                : pathname ===
                    item.href ||
                  pathname.startsWith(
                    `${item.href}/`
                  )
              : activeId ===
                item.id;

          const className =
            cn(
              styles.link,

              appearance ===
                "tabs" &&
                styles.tab,

              appearance ===
                "underline" &&
                styles.underlineItem,

              active &&
                styles.active,

              collapsed &&
                styles.collapsed
            );


          /* ==============================================================
             Anchor
          ============================================================== */

          if (
            variant === "anchor"
          ) {
            if (!collapsed) {
              return (
                <a
                  key={
                    item.id
                  }
                  href={
                    item.href
                  }
                  className={
                    className
                  }
                  onClick={(
                    e
                  ) =>
                    handleAnchorClick(
                      e,
                      item.id
                    )
                  }
                >
                  <Icon
                    size={20}
                    className={
                      styles.icon
                    }
                    aria-hidden="true"
                  />

                  <span
                    className={
                      styles.label
                    }
                  >
                    {item.label}
                  </span>
                </a>
              );
            }

            return (
              <Tooltip
                key={
                  item.id
                }
              >
                <TooltipTrigger
                  asChild
                >
                  <a
                    href={
                      item.href
                    }
                    className={
                      className
                    }
                    onClick={(
                      e
                    ) =>
                      handleAnchorClick(
                        e,
                        item.id
                      )
                    }
                    aria-label={
                      item.label
                    }
                  >
                    <Icon
                      size={20}
                      className={
                        styles.icon
                      }
                      aria-hidden="true"
                    />

                    <span
                      className={cn(
                        styles.label,
                        styles.hidden
                      )}
                    >
                      {item.label}
                    </span>
                  </a>
                </TooltipTrigger>

                <TooltipContent
                  side="right"
                  sideOffset={8}
                >
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }


          /* ==============================================================
             Controlled
          ============================================================== */

          if (
            variant === "controlled"
          ) {
            if (!collapsed) {
              return (
                <button
                  key={
                    item.id
                  }
                  type="button"
                  className={
                    className
                  }
                  aria-current={
                    active
                      ? "step"
                      : undefined
                  }
                  onClick={() =>
                    handleControlledClick(
                      item.id
                    )
                  }
                >
                  <Icon
                    size={18}
                    className={
                      styles.icon
                    }
                    aria-hidden="true"
                  />

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

            return (
              <Tooltip
                key={
                  item.id
                }
              >
                <TooltipTrigger
                  asChild
                >
                  <button
                    type="button"
                    className={
                      className
                    }
                    aria-current={
                      active
                        ? "step"
                        : undefined
                    }
                    aria-label={
                      item.label
                    }
                    onClick={() =>
                      handleControlledClick(
                        item.id
                      )
                    }
                  >
                    <Icon
                      size={18}
                      className={
                        styles.icon
                      }
                      aria-hidden="true"
                    />

                    <span
                      className={cn(
                        styles.label,
                        styles.hidden
                      )}
                    >
                      {item.label}
                    </span>
                  </button>
                </TooltipTrigger>

                <TooltipContent
                  side="right"
                  sideOffset={8}
                >
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }


          /* ==============================================================
             Route
          ============================================================== */

          if (!collapsed) {
            return (
              <Link
                key={
                  item.id
                }
                href={
                  item.href
                }
                prefetch={
                  item.prefetch ??
                  false
                }
                className={
                  className
                }
                aria-current={
                  active
                    ? "page"
                    : undefined
                }
                onClick={
                  onNavigate
                }
              >
                <Icon
                  size={18}
                  className={
                    styles.icon
                  }
                  aria-hidden="true"
                />

                <span
                  className={
                    styles.label
                  }
                >
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Tooltip
              key={
                item.id
              }
            >
              <TooltipTrigger
                asChild
              >
                <Link
                  href={
                    item.href
                  }
                  prefetch={
                    item.prefetch ??
                    false
                  }
                  className={
                    className
                  }
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  aria-label={
                    item.label
                  }
                  onClick={
                    onNavigate
                  }
                >
                  <Icon
                    size={18}
                    className={
                      styles.icon
                    }
                    aria-hidden="true"
                  />

                  <span
                    className={cn(
                      styles.label,
                      styles.hidden
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              </TooltipTrigger>

              <TooltipContent
                side="right"
                sideOffset={8}
              >
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        }
      )}
    </nav>
  );
}