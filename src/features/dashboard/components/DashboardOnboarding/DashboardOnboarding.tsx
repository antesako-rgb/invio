import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Camera,
  LayoutGrid,
  Mail,
} from "lucide-react";

import {
  getTranslations,
} from "next-intl/server";

import {
  ButtonLink,
} from "@/components/ui/button-link";

import {
  EmptyState,
} from "@/components/ui/empty-state/EmptyState";

import styles from "./DashboardOnboarding.module.css";


/* ==========================================================================
   Products
========================================================================== */

const products = [
  {
    key: "photoWall",
    icon: Camera,
    upcoming: false,
  },
  {
    key: "albums",
    icon: BookOpen,
    upcoming: false,
  },
  {
    key: "invitations",
    icon: Mail,
    upcoming: false,
  },
  {
    key: "seating",
    icon: LayoutGrid,
    upcoming: true,
  },
] as const;


/* ==========================================================================
   Dashboard Onboarding
========================================================================== */

export default async function DashboardOnboarding() {
  const t =
    await getTranslations(
      "Dashboard.onboarding"
    );

  return (
    <div className={styles.onboarding}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>
          {t("eyebrow")}
        </p>

        <h1>
          {t("title")}{" "}
          <span aria-hidden="true">
            {"\u{1F44B}"}
          </span>
        </h1>

        <p className={styles.intro}>
          {t("description")}
        </p>
      </header>

      <EmptyState
        variant="card"
        icon={CalendarDays}
        title={t("event.title")}
        description={t("event.description")}
        action={
          <ButtonLink
            href="/dashboard/projects/new/event"
          >
            {t("event.action")}

            <ArrowRight aria-hidden="true" />
          </ButtonLink>
        }
      />

      <section
        className={styles.ecosystem}
        aria-label={t("productsTitle")}
      >
        <ul className={styles.products}>
          {products.map(
            ({
              key,
              icon: Icon,
              upcoming,
            }) => (
              <li
                key={key}
                className={styles.product}
              >
                <span className={styles.productIcon}>
                  <Icon aria-hidden="true" />
                </span>

                <div className={styles.productHeading}>
                  <h3>
                    {t(`products.${key}.title`)}
                  </h3>

                  {upcoming && (
                    <span className={styles.upcoming}>
                      {t("comingSoon")}
                    </span>
                  )}
                </div>

                <p>
                  {t(`products.${key}.description`)}
                </p>
              </li>
            )
          )}
        </ul>
      </section>
    </div>
  );
}