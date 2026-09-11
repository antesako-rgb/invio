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
  from "./EventExperiencePublicLinkCard.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperiencePublicLinkCardMobileToggleProps {
  title:
    string;

  status:
    string;

  isActive:
    boolean;

  children:
    ReactNode;
}


/* ==========================================================================
   Event Experience Public Link Card Mobile Toggle
========================================================================== */

export default function EventExperiencePublicLinkCardMobileToggle({
  title,
  status,
  isActive,
  children,
}: EventExperiencePublicLinkCardMobileToggleProps) {
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
            data-active={
              isActive
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