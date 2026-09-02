"use client";

import type { ReactNode } from "react";

import { TriangleAlert } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type ConfirmDialogVariant =
  | "default"
  | "danger";

interface ConfirmDialogProps {
  open: boolean;

  title: string;

  description?: ReactNode;

  confirmText?: string;

  cancelText?: string;

  loading?: boolean;

  variant?: ConfirmDialogVariant;

  onConfirm: () => void | Promise<void>;

  onClose: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Potvrdi",
  cancelText = "Odustani",
  loading = false,
  variant = "default",
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  async function handleConfirm() {
    await onConfirm();
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(value) => {
        if (!value && !loading) {
          onClose();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          {variant === "danger" && (
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <TriangleAlert className="size-5" />
            </AlertDialogMedia>
          )}

          <AlertDialogTitle
            className={
              variant === "danger"
                ? "text-destructive"
                : undefined
            }
          >
            {title}
          </AlertDialogTitle>

          {description && (
            <AlertDialogDescription>
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={loading}
          >
            {cancelText}
          </AlertDialogCancel>

          <AlertDialogAction
            variant={
              variant === "danger"
                ? "destructive"
                : "default"
            }
            disabled={loading}
            onClick={handleConfirm}
          >
            {loading
              ? "Molimo pričekajte..."
              : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}