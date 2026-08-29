import {
  Store,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  Card,
} from "@/components/ui/card";

import {
  ButtonLink,
} from "@/components/ui/button-link";

import styles from "./DashboardBusinessCta.module.css";


/* ==========================================================================
   Dashboard Business CTA
========================================================================== */

export default function DashboardBusinessCta() {
  const t =
    useTranslations(
      "Dashboard.overview"
    );


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Card
      asChild
      shadow="xs"
      radius="xl"
      className={
        styles.card
      }
    >
      <section>
        <div
          className={
            styles.iconContainer
          }
        >
          <Store
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
          <div
            className={
              styles.text
            }
          >
            <h2
              className={
                styles.title
              }
            >
              {t(
                "business.title"
              )}
            </h2>

            <p
              className={
                styles.description
              }
            >
              {t(
                "business.description"
              )}
            </p>
          </div>

          <ButtonLink
            href="/dashboard/poslovanje"
            variant="outline"
            size="sm"
          >
            {t(
              "business.action"
            )}
          </ButtonLink>
        </div>
      </section>
    </Card>
  );
}