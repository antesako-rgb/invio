"use client";

import * as React
  from "react";

import {
  Button,
  type ButtonProps,
} from "@/components/ui/button";

import styles
  from "./EditorPageActionButton.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface EditorPageActionButtonProps
  extends Omit<
    ButtonProps,
    "variant" | "size"
  > {
  visibility?:
    | "hover"
    | "always";
}


/* ==========================================================================
   Editor Page Action Button
========================================================================== */

const EditorPageActionButton =
  React.forwardRef<
    HTMLButtonElement,
    EditorPageActionButtonProps
  >(function EditorPageActionButton(
    {
      className,
      visibility = "hover",
      ...props
    },
    ref
  ) {
    return (
      <Button
        ref={
          ref
        }
        type="button"
        variant="ghost"
        size="icon-xs"
        className={[
          styles.button,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        data-visibility={
          visibility
        }
        {...props}
      />
    );
  });

EditorPageActionButton.displayName =
  "EditorPageActionButton";


/* ==========================================================================
   Export
========================================================================== */

export default EditorPageActionButton;