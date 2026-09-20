"use client";

import type {
  ReactNode,
} from "react";

import styles
  from "./PhotoUploadSource.module.css";


/* ==========================================================================
   Types
========================================================================== */

type PhotoUploadSourceVariant =
  | "default"
  | "cards";

interface PhotoUploadSourceAction {
  id:
    string;

  icon:
    ReactNode;

  title:
    string;

  description:
    string;

  onClick:
    () => void;
}

interface PhotoUploadSourceProps {
  title:
    string;

  description:
    string;

  actions:
    PhotoUploadSourceAction[];

  variant?:
    PhotoUploadSourceVariant;

  disabled?:
    boolean;
}


/* ==========================================================================
   Photo Upload Source
========================================================================== */

export default function PhotoUploadSource({
  title,
  description,
  actions,
  variant = "default",
  disabled = false,
}: PhotoUploadSourceProps) {
  return (
    <div
      className={
        styles.root
      }
      data-variant={
        variant
      }
    >
      {/* ====================================================================
          Header
      ==================================================================== */}

      <div
        className={
          styles.header
        }
      >
        <h2
          className={
            styles.title
          }
        >
          {title}
        </h2>

        <p
          className={
            styles.description
          }
        >
          {description}
        </p>
      </div>


      {/* ====================================================================
          Actions
      ==================================================================== */}

      <div
        className={
          styles.actions
        }
      >
        {actions.map(
          (action) => (
            <button
              key={
                action.id
              }
              type="button"
              className={
                styles.action
              }
              disabled={
                disabled
              }
              onClick={
                action.onClick
              }
            >
              <span
                className={
                  styles.actionIcon
                }
                aria-hidden="true"
              >
                {action.icon}
              </span>

              <span
                className={
                  styles.actionContent
                }
              >
                <span
                  className={
                    styles.actionTitle
                  }
                >
                  {action.title}
                </span>

                <span
                  className={
                    styles.actionDescription
                  }
                >
                  {action.description}
                </span>
              </span>
            </button>
          )
        )}
      </div>
    </div>
  );
}