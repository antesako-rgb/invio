import type {
  ReactNode,
} from "react";

import BackLink
  from "@/components/ui/back-link/BackLink";

import styles
  from "./ManagementHeader.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface ManagementHeaderProps {
  heading:
    ReactNode;

  status?:
    ReactNode;

  meta?:
    ReactNode;

  actions?:
    ReactNode;

  backHref?:
    string;

  backLabel?:
    string;
}


/* ==========================================================================
   Management Header
========================================================================== */

export default function ManagementHeader({
  heading,
  status,
  meta,
  actions,
  backHref,
  backLabel,
}: ManagementHeaderProps) {
  /* ==========================================================================
     Back
  ========================================================================== */

  const hasBack =
    backHref &&
    backLabel;


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <header
      className={
        styles.root
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
          <div
            className={
              styles.heading
            }
          >
            {heading}
            {status}
          </div>

          {meta && (
            <div
              className={
                styles.meta
              }
            >
              {meta}
            </div>
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