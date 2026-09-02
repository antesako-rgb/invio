"use client";

import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ResetButtonProps {
  onReset: () => void;
  disabled?: boolean;
  label?: string;
}

export default function ResetButton({
  onReset,
  disabled = false,
  label = "Resetiraj obrazac",
}: ResetButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      disabled={disabled}
      onClick={onReset}
    >
      <RotateCcw />

      {label}
    </Button>
  );
}