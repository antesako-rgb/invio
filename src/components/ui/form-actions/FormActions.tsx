"use client";

import type {
  ReactNode,
} from "react";

import {
  cn,
} from "@/lib/utils/utils";

import {
  Button,
} from "@/components/ui/button";

import styles from "./FormActions.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface FormActionsProps {
  isSubmitting?:
    boolean;

  submitDisabled?:
    boolean;

  showSubmit?:
    boolean;

  onCancel?:
    () => void;

  cancelLabel?:
    string;

  submitLabel:
    string;

  children?:
    ReactNode;

  className?:
    string;

  sticky?:
    boolean;
}


/* ==========================================================================
   Form Actions
========================================================================== */

export default function FormActions({
  isSubmitting = false,
  submitDisabled = false,
  showSubmit = true,
  onCancel,
  cancelLabel,
  submitLabel,
  children,
  className,
  sticky = false,
}: FormActionsProps) {
  return (
    <div
      className={cn(
        styles.actions,
        sticky &&
          styles.sticky,
        className
      )}
    >
      {children}

      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={
            onCancel
          }
          disabled={
            isSubmitting
          }
        >
          {cancelLabel}
        </Button>
      )}

      {showSubmit && (
        <Button
          type="submit"
          loading={
            isSubmitting
          }
          disabled={
            submitDisabled
          }
        >
          {submitLabel}
        </Button>
      )}
    </div>
  );
}