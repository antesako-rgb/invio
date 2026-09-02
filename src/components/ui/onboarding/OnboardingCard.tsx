"use client";

import type {
  LucideIcon,
} from "lucide-react";

import {
  Check,
} from "lucide-react";

import type {
  ReactNode,
} from "react";

import {
  Button,
} from "@/components/ui/button";

import {
  ButtonLink,
} from "@/components/ui/button-link";

import {
  cn,
} from "@/lib/utils/utils";

import styles from "./OnboardingCard.module.css";


/* ==========================================================================
   Types
========================================================================== */

export interface OnboardingStep {
  label:
    string;

  completed?:
    boolean;

  active?:
    boolean;
}

interface OnboardingCardLinkAction {
  label:
    string;

  href:
    string;

  icon?:
    LucideIcon;

  onClick?:
    never;
}

interface OnboardingCardButtonAction {
  label:
    string;

  onClick:
    () => void;

  icon?:
    LucideIcon;

  href?:
    never;
}

type OnboardingCardAction =
  | OnboardingCardLinkAction
  | OnboardingCardButtonAction;

interface OnboardingCardProps {
  title:
    string;

  description:
    string;

  illustration?:
    ReactNode;

  steps:
    OnboardingStep[];

  action:
    OnboardingCardAction;

  secondaryAction?:
    OnboardingCardAction;

  variant?:
    | "default"
    | "compact";

  className?:
    string;
}


/* ==========================================================================
   Action
========================================================================== */

function OnboardingAction({
  action,
  secondary = false,
}: {
  action:
    OnboardingCardAction;

  secondary?:
    boolean;
}) {
  const ActionIcon =
    action.icon;

  const content = (
    <>
      {ActionIcon && (
        <ActionIcon
          size={18}
          aria-hidden="true"
        />
      )}

      {action.label}
    </>
  );

  if (
    "href" in action &&
    action.href
  ) {
    return (
      <ButtonLink
        href={
          action.href
        }
        variant={
          secondary
            ? "outline"
            : "default"
        }
      >
        {content}
      </ButtonLink>
    );
  }

  return (
    <Button
      type="button"
      variant={
        secondary
          ? "outline"
          : "default"
      }
      onClick={
        action.onClick
      }
    >
      {content}
    </Button>
  );
}


/* ==========================================================================
   Onboarding Card
========================================================================== */

export default function OnboardingCard({
  title,
  description,
  illustration,
  steps,
  action,
  secondaryAction,
  variant = "default",
  className,
}: OnboardingCardProps) {
  return (
    <section
      className={cn(
        styles.card,

        variant === "compact" &&
          styles.compact,

        className
      )}
    >
      {/* ====================================================================
          Steps
      ==================================================================== */}

      <div
        className={
          styles.steps
        }
      >
        {steps.map(
          (
            step,
            index
          ) => {
            const stepClass =
              step.completed
                ? styles.completed
                : step.active
                  ? styles.active
                  : styles.pending;

            return (
              <div
                key={
                  step.label
                }
                className={
                  styles.step
                }
              >
                <div
                  className={
                    stepClass
                  }
                >
                  {step.completed ? (
                    <Check
                      size={16}
                      aria-hidden="true"
                    />
                  ) : (
                    index + 1
                  )}
                </div>

                <span
                  className={
                    styles.stepLabel
                  }
                >
                  {step.label}
                </span>

                {index <
                  steps.length -
                    1 && (
                  <div
                    className={
                      step.completed
                        ? styles.lineCompleted
                        : styles.line
                    }
                  />
                )}
              </div>
            );
          }
        )}
      </div>

      {/* ====================================================================
          Content
      ==================================================================== */}

      <div
        className={
          styles.content
        }
      >
        {illustration && (
          <div
            className={
              styles.image
            }
          >
            {illustration}
          </div>
        )}

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

        {/* ==================================================================
            Actions
        ================================================================== */}

        <div
          className={
            styles.actions
          }
        >
          <OnboardingAction
            action={
              action
            }
          />

          {secondaryAction && (
            <OnboardingAction
              action={
                secondaryAction
              }
              secondary
            />
          )}
        </div>
      </div>
    </section>
  );
}