import {
  Check,
  CircleAlert,
  LoaderCircle,
} from "lucide-react";

import styles
  from "./EditorSaveStatus.module.css";


/* ==========================================================================
   Types
========================================================================== */

export type EditorSaveStatusValue =
  | "saving"
  | "saved"
  | "error";

interface EditorSaveStatusProps {
  status:
    EditorSaveStatusValue;

  savingLabel:
    string;

  savedLabel:
    string;

  errorLabel:
    string;
}


/* ==========================================================================
   Editor Save Status
========================================================================== */

export default function EditorSaveStatus({
  status,
  savingLabel,
  savedLabel,
  errorLabel,
}: EditorSaveStatusProps) {
  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={
        styles.root
      }
      data-status={
        status
      }
      role="status"
      aria-live="polite"
    >
      {status === "saving" && (
        <>
          <LoaderCircle
            size={16}
            className={
              styles.spinner
            }
            aria-hidden="true"
          />

          <span>
            {savingLabel}
          </span>
        </>
      )}

      {status === "saved" && (
        <>
          <Check
            size={16}
            aria-hidden="true"
          />

          <span>
            {savedLabel}
          </span>
        </>
      )}

      {status === "error" && (
        <>
          <CircleAlert
            size={16}
            aria-hidden="true"
          />

          <span>
            {errorLabel}
          </span>
        </>
      )}
    </div>
  );
}