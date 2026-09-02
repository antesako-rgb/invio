import * as React from "react";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { Label } from "@/components/ui/label";

import { cn } from "@/lib/utils/utils";

type SwitchProps =
  React.ComponentPropsWithoutRef<
    typeof SwitchPrimitive.Root
  >;

const Switch = React.forwardRef<
  React.ElementRef<
    typeof SwitchPrimitive.Root
  >,
  SwitchProps
>(function Switch(
  {
    className,
    ...props
  },
  ref
) {
  return (
    <SwitchPrimitive.Root
      ref={ref}
      data-slot="switch"
      className={cn(
        [
          "peer",
          "relative",
          "inline-flex",
          "h-6",
          "w-11",
          "shrink-0",
          "cursor-pointer",
          "items-center",
          "rounded-full",

          "border",
          "border-muted-foreground/40",
          "bg-muted-foreground/20",

          "transition-all",
          "duration-200",

          "outline-none",

          "focus-visible:border-ring",
          "focus-visible:ring-3",
          "focus-visible:ring-ring/50",

          "aria-invalid:border-destructive",
          "aria-invalid:ring-3",
          "aria-invalid:ring-destructive/20",

          "disabled:pointer-events-none",
          "disabled:opacity-50",

          "data-[checked]:border-success",
          "data-[checked]:bg-success",
        ],
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn([
          "pointer-events-none",
          "block",
          "size-5",
          "rounded-full",

          "bg-card",
          "shadow-md",

          "transition-all",
          "duration-200",

          "translate-x-0",
          "data-[checked]:translate-x-5",
        ])}
      />
    </SwitchPrimitive.Root>
  );
});

Switch.displayName = "Switch";

interface SwitchFieldProps
  extends SwitchProps {
  label: React.ReactNode;

  description?: React.ReactNode;

  className?: string;
}

function SwitchField({
  id,
  label,
  description,
  className,
  ...props
}: SwitchFieldProps) {
  const generatedId =
    React.useId();

  const switchId =
    id ?? generatedId;

  const descriptionId =
    description
      ? `${switchId}-description`
      : undefined;

  return (
    <div
      data-slot="switch-field"
      className={cn(
        "flex items-center justify-between gap-4",
        className
      )}
    >
      <div className="flex-1">
        <Label htmlFor={switchId}>
          {label}
        </Label>

        {description && (
          <p
            id={descriptionId}
            data-slot="switch-description"
            className="mt-1 text-sm text-muted-foreground"
          >
            {description}
          </p>
        )}
      </div>

      <Switch
        id={switchId}
        aria-describedby={
          descriptionId
        }
        {...props}
      />
    </div>
  );
}

SwitchField.displayName =
  "SwitchField";

export {
  Switch,
  SwitchField,
};