"use client";

import {
  ChevronDown,
} from "lucide-react";

import {
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import styles
  from "./ManagementStatusCard.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface ManagementStatusCardMobileToggleProps {
  title:
    string;

  status:
    string;

  isPublished:
    boolean;

  children:
    ReactNode;
}


/* ==========================================================================
   Management Status Card Mobile Toggle
========================================================================== */

export default function ManagementStatusCardMobileToggle({
  title,
  status,
  isPublished,
  children,
}: ManagementStatusCardMobileToggleProps) {
  const [
    isOpen,
    setIsOpen,
  ] =
    useState(false);


  /* ==========================================================================
     Toggle
  ========================================================================== */

  function handleToggle() {
    setIsOpen(
      (current) =>
        !current
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <>
      <button
        type="button"
        className={
          styles.mobileToggle
        }
        aria-expanded={
          isOpen
        }
        onClick={
          handleToggle
        }
      >
        <div
          className={
            styles.mobileToggleContent
          }
        >
          <strong>
            {title}
          </strong>

          <span
            className={
              styles.mobileStatus
            }
            data-published={
              isPublished
                ? "true"
                : "false"
            }
          >
            <span
              className={
                styles.mobileStatusDot
              }
              aria-hidden="true"
            />

            {status}
          </span>
        </div>

        <ChevronDown
          size={
            20
          }
          aria-hidden="true"
          className={
            styles.mobileChevron
          }
          data-open={
            isOpen
              ? "true"
              : "false"
          }
        />
      </button>

      <div
        className={
          styles.mobileCollapsible
        }
        data-open={
          isOpen
            ? "true"
            : "false"
        }
      >
        {children}
      </div>
    </>
  );
}