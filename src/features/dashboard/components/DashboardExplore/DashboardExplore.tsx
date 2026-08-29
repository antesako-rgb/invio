"use client";

import {
  ArrowRight,
  CircleHelp,
  LayoutTemplate,
  Search,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  Link,
} from "@/i18n/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

import styles from "./DashboardExplore.module.css";


/* ==========================================================================
   Dashboard Explore
========================================================================== */

export default function DashboardExplore() {
  const t =
    useTranslations(
      "Dashboard.overview"
    );


  /* ==========================================================================
     Items
  ========================================================================== */

  const items = [
    {
      id:
        "templates",

      tone:
        "violet",

      icon:
        LayoutTemplate,

      title:
        t(
          "explore.templates.title"
        ),

      description:
        t(
          "explore.templates.description"
        ),

      action:
        t(
          "explore.templates.action"
        ),

      href:
        "/dashboard/predlosci",
    },

    {
      id:
        "services",

      tone:
        "green",

      icon:
        Search,

      title:
        t(
          "explore.services.title"
        ),

      description:
        t(
          "explore.services.description"
        ),

      action:
        t(
          "explore.services.action"
        ),

      href:
        "/dashboard/usluge",
    },

    {
      id:
        "howItWorks",

      tone:
        "orange",

      icon:
        CircleHelp,

      title:
        t(
          "explore.howItWorks.title"
        ),

      description:
        t(
          "explore.howItWorks.description"
        ),

      action:
        t(
          "explore.howItWorks.action"
        ),

      href:
        "/kako-funkcionira",
    },
  ];


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <section
      className={
        styles.section
      }
    >
      <h2
        className={
          styles.heading
        }
      >
        {t(
          "explore.title"
        )}
      </h2>

      <div
        className={
          styles.grid
        }
      >
        {items.map(
          (item) => {
            const Icon =
              item.icon;

            return (
              <Card
                key={
                  item.id
                }
                asChild
                variant="interactive"
                shadow="xs"
                radius="lg"
              >
                <Link
                  href={
                    item.href
                  }
                  className={
                    styles.card
                  }
                  data-tone={
                    item.tone
                  }
                >
                  <CardContent
                    className={
                      styles.cardContent
                    }
                  >
                    <div
                      className={
                        styles.iconContainer
                      }
                    >
                      <Icon
                        className={
                          styles.icon
                        }
                        aria-hidden="true"
                      />
                    </div>

                    <div
                      className={
                        styles.content
                      }
                    >
                      <CardTitle
                        className={
                          styles.title
                        }
                      >
                        {item.title}
                      </CardTitle>

                      <CardDescription>
                        {
                          item.description
                        }
                      </CardDescription>
                    </div>

                    <span
                      className={
                        styles.action
                      }
                    >
                      {item.action}

                      <ArrowRight
                        className={
                          styles.arrow
                        }
                        aria-hidden="true"
                      />
                    </span>
                  </CardContent>
                </Link>
              </Card>
            );
          }
        )}
      </div>
    </section>
  );
}