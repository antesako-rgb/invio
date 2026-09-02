import {
  Check,
} from "lucide-react";

import styles
  from "./Stepper.module.css";


/* ==========================================================================
   Types
========================================================================== */

export interface StepperStep {
  label:
    string;

  completed?:
    boolean;

  active?:
    boolean;
}

interface StepperProps {
  steps:
    StepperStep[];
}


/* ==========================================================================
   Stepper
========================================================================== */

export default function Stepper({
  steps,
}: StepperProps) {
  return (
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
                steps.length - 1 && (
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
  );
}