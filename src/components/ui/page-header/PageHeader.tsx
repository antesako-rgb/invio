import type {
  ReactNode,
} from "react";

import BackLink
  from "@/components/ui/back-link/BackLink";

import styles from "./PageHeader.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface PageHeaderProps {
  title:
    ReactNode;

  description?:
    ReactNode;

  backHref?:
    string;

  backLabel?:
    string;

  actions?:
    ReactNode;

  className?:
    string;
}


/* ==========================================================================
   Page Header
========================================================================== */

export default function PageHeader({
  title,
  description,
  backHref,
  backLabel,
  actions,
  className,
}: PageHeaderProps) {
  const hasBack =
    backHref &&
    backLabel;


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <header
      className={
        `${styles.header} ${
          className ?? ""
        }`
      }
    >
      {hasBack && (
        <BackLink
          href={
            backHref
          }
          label={
            backLabel
          }
        />
      )}

      <div
        className={
          styles.main
        }
      >
        <div
          className={
            styles.content
          }
        >
          <h1
            className={
              styles.title
            }
          >
            {title}
          </h1>

          {description && (
            <p
              className={
                styles.description
              }
            >
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div
            className={
              styles.actions
            }
          >
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}