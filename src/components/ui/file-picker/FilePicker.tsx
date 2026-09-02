"use client";

import {
  useId,
  useRef,
  type ReactNode,
} from "react";

import { Camera } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FilePickerProps {
  accept?: string;
  label?: string;
  disabled?: boolean;

  children?: ReactNode;

  onSelect?: (file: File) => void;
}

export default function FilePicker({
  accept = "image/*",
  label = "Odaberi fotografiju",
  disabled = false,
  children,
  onSelect,
}: FilePickerProps) {
  const id = useId();

  const inputRef =
    useRef<HTMLInputElement>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    onSelect?.(file);

    e.target.value = "";
  }

  function openPicker() {
    if (!disabled) {
      inputRef.current?.click();
    }
  }

  return (
    <>
      <Input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled}
        onChange={handleChange}
      />

      {children ? (
        <div
          role="button"
          tabIndex={
            disabled ? -1 : 0
          }
          aria-disabled={disabled}
          onClick={openPicker}
          onKeyDown={(e) => {
            if (
              disabled
            ) {
              return;
            }

            if (
              e.key === "Enter" ||
              e.key === " "
            ) {
              e.preventDefault();

              openPicker();
            }
          }}
        >
          {children}
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={openPicker}
        >
          <Camera size={18} />

          {label}
        </Button>
      )}
    </>
  );
}