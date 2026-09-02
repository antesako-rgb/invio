"use client";

import { useState } from "react";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import ConfirmDialog from "./ConfirmDialog";

interface DeleteButtonProps {
  title: string;

  description?: React.ReactNode;

  confirmText?: string;

  loading?: boolean;

  disabled?: boolean;

  onDelete: () => void | Promise<void>;
}

export default function DeleteButton({
  title,
  description,
  confirmText = "Obriši",
  loading = false,
  disabled = false,
  onDelete,
}: DeleteButtonProps) {
  const [open, setOpen] =
    useState(false);

  async function handleDelete() {
    await onDelete();

    setOpen(false);
  }

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        disabled={disabled || loading}
        onClick={() => setOpen(true)}
      >
        <Trash2 />

        Obriši
      </Button>

      <ConfirmDialog
        open={open}
        title={title}
        description={description}
        confirmText={confirmText}
        loading={loading}
        variant="danger"
        onConfirm={handleDelete}
        onClose={() => setOpen(false)}
      />
    </>
  );
}