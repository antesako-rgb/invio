"use client";

import {
  useState,
} from "react";

import DangerZone
  from "@/components/ui/danger-zone/DangerZone";


/* ==========================================================================
   Types
========================================================================== */

interface ManagementDeleteDangerZoneProps {
  title:
    string;

  description:
    string;

  buttonText:
    string;

  confirmTitle:
    string;

  confirmDescription:
    string;

  confirmText:
    string;

  cancelText:
    string;

  onDelete:
    () => Promise<void>;
}


/* ==========================================================================
   Management Delete Danger Zone
========================================================================== */

export default function ManagementDeleteDangerZone({
  title,
  description,
  buttonText,
  confirmTitle,
  confirmDescription,
  confirmText,
  cancelText,
  onDelete,
}: ManagementDeleteDangerZoneProps) {
  /* ==========================================================================
     State
  ========================================================================== */

  const [
    isDeleting,
    setIsDeleting,
  ] =
    useState(false);


  /* ==========================================================================
     Delete
  ========================================================================== */

  async function handleDelete() {
    if (isDeleting) {
      return;
    }

    setIsDeleting(
      true
    );

    try {
      await onDelete();
    } finally {
      setIsDeleting(
        false
      );
    }
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <DangerZone
      title={
        title
      }
      description={
        description
      }
      buttonText={
        buttonText
      }
      tone="danger"
      confirmTitle={
        confirmTitle
      }
      confirmDescription={
        confirmDescription
      }
      confirmText={
        confirmText
      }
      cancelText={
        cancelText
      }
      loading={
        isDeleting
      }
      onConfirm={
        handleDelete
      }
    />
  );
}