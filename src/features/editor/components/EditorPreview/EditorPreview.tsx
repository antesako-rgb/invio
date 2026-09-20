"use client";

import type {
  ReactNode,
} from "react";

import {
  X,
} from "lucide-react";

import styles
  from "./EditorPreview.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface EditorPreviewProps {
  children:
    ReactNode;

  closeLabel:
    string;

  onClose:
    () => void;
}


/* ==========================================================================
   Editor Preview
========================================================================== */

export default function EditorPreview({
  children,
  closeLabel,
  onClose,
}: EditorPreviewProps) {
  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={
        styles.root
      }
      data-editor-preview
    >
      {/* ====================================================================
          Close
      ==================================================================== */}

      <button
        type="button"
        className={
          styles.close
        }
        onClick={
          onClose
        }
        aria-label={
          closeLabel
        }
      >
        <X
          size={20}
          aria-hidden="true"
        />
      </button>


      {/* ====================================================================
          Content
      ==================================================================== */}

      <div
        className={
          styles.content
        }
      >
        {children}
      </div>
    </div>
  );
}