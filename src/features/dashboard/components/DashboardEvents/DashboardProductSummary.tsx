import {
  BookImage,
  Check,
  Circle,
  Images,
  Pencil,
} from "lucide-react";

import {
  getTranslations,
} from "next-intl/server";

import {
  Badge,
} from "@/components/ui/badge/badge";

import {
  ButtonLink,
} from "@/components/ui/button-link";

import type {
  DashboardProduct,
} from "../../repositories/getDashboardProducts";

import styles from "./DashboardEvents.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface DashboardProductSummaryProps {
  kind:
    | "photoWall"
    | "album";

  eventId:
    string;

  product:
    DashboardProduct | null;
}


/* ==========================================================================
   Dashboard Product Summary
========================================================================== */

export default async function DashboardProductSummary({
  kind,
  eventId,
  product,
}: DashboardProductSummaryProps) {
  const t =
    await getTranslations(
      "Dashboard.overview.events.products"
    );

  const Icon =
    kind === "photoWall"
      ? Images
      : BookImage;

  const status =
    !product
      ? "missing"
      : product.is_public
        ? "published"
        : "draft";

  const StatusIcon =
    status === "published"
      ? Check
      : status === "draft"
        ? Pencil
        : Circle;

  const href =
    kind === "photoWall"
      ? `/dashboard/dogadaji/${eventId}/photo-wall`
      : `/dashboard/dogadaji/${eventId}/albumi`;

  return (
    <section
      className={
        styles.product
      }
      aria-label={
        t(
          `${kind}.title`
        )
      }
    >
      <div
        className={
          styles.productHeading
        }
      >
        <Icon
          aria-hidden="true"
        />

        <h4>
          {t(
            `${kind}.title`
          )}
        </h4>
      </div>

      <Badge
        variant={
          status === "published"
            ? "success"
            : status === "draft"
              ? "warning"
              : "muted"
        }
      >
        <StatusIcon
          size={
            14
          }
          aria-hidden="true"
        />

        {t(
          status === "missing"
            ? `${kind}.missing`
            : status
        )}
      </Badge>

      <ButtonLink
        className={
          styles.productAction
        }
        size="lg"
        variant="outline"
        href={
          href
        }
      >
        {t(
          `${kind}.edit`
        )}
      </ButtonLink>
    </section>
  );
}