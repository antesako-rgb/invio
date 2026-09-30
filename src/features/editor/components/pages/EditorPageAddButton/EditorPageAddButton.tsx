"use client";

import {
  Plus,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import styles
  from "./EditorPageAddButton.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface EditorPageAddButtonProps {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}


/* ==========================================================================
   Editor Page Add Button
========================================================================== */

export default function EditorPageAddButton({
  label,
  disabled = false,
  onClick,
}: EditorPageAddButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className={
        styles.button
      }
      disabled={
        disabled
      }
      onClick={
        onClick
      }
    >
      <Plus
        aria-hidden="true"
      />

      {label}
    </Button>
  );
}