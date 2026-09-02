"use client";

import type {
  ReactNode,
} from "react";

import {
  useState,
} from "react";

import {
  ChevronDown,
} from "lucide-react";

import styles
  from "./InvitationStatusCard.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationStatusCardMobileToggleProps {
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
   Invitation Status Card Mobile Toggle
========================================================================== */

export default function InvitationStatusCardMobileToggle({
  title,
  status,
  isPublished,
  children,
}: InvitationStatusCardMobileToggleProps) {
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
          size={20}
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