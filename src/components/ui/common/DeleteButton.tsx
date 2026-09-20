"use client";

import {
  useState,
} from "react";

import {
  Trash2,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import ConfirmDialog
  from "./ConfirmDialog";


/* ==========================================================================
   Types
========================================================================== */

interface DeleteButtonProps {
  title:
    string;

  description?:
    React.ReactNode;

  confirmText?:
    string;

  loading?:
    boolean;

  disabled?:
    boolean;

  display?:
    "default" | "icon";

  ariaLabel?:
    string;

  onDelete:
    () => void | Promise<void>;
}


/* ==========================================================================
   Delete Button
========================================================================== */

export default function DeleteButton({
  title,
  description,
  confirmText = "Obriši",
  loading = false,
  disabled = false,
  display = "default",
  ariaLabel = "Obriši",
  onDelete,
}: DeleteButtonProps) {
  /* ==========================================================================
     State
  ========================================================================== */

  const [
    open,
    setOpen,
  ] =
    useState(false);


  /* ==========================================================================
     Delete
  ========================================================================== */

  async function handleDelete() {
    await onDelete();

    setOpen(
      false
    );
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <>
<Button
  type="button"
  variant={
    display === "icon"
      ? "outline"
      : "destructive"
  }
  size={
    display === "icon"
      ? "icon"
      : "sm"
  }
className={
  display === "icon"
    ? [
        "size-8",
        "border-destructive/20",
        "bg-white",
        "text-destructive",
        "shadow-[0_0.25rem_1rem_rgb(0_0_0/0.12)]",
        "hover:border-destructive/30",
       "hover:bg-destructive/10",
        "hover:text-destructive",
      ].join(" ")
    : undefined
}

  disabled={
    disabled ||
    loading
  }
  aria-label={
    display === "icon"
      ? ariaLabel
      : undefined
  }
  onClick={
    () =>
      setOpen(
        true
      )
  }
>
  <Trash2
    className={
      display === "icon"
        ? "size-4"
        : undefined
    }
    aria-hidden="true"
  />

  {display ===
    "default" && (
    <span>
      Obriši
    </span>
  )}
</Button>

      <ConfirmDialog
        open={
          open
        }
        title={
          title
        }
        description={
          description
        }
        confirmText={
          confirmText
        }
        loading={
          loading
        }
        variant="danger"
        onConfirm={
          handleDelete
        }
        onClose={
          () =>
            setOpen(
              false
            )
        }
      />
    </>
  );
}