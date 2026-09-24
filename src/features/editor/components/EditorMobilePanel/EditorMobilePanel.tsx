"use client";

import type { ReactNode } from "react";

import { Drawer, DrawerContent } from "@/components/ui/drawer/Drawer";

/* ==========================================================================
   Constants
========================================================================== */

export const EDITOR_MOBILE_DEFAULT_SNAP_POINT = 0.23;
export const EDITOR_MOBILE_FULL_SNAP_POINT = 1;

const EDITOR_MOBILE_SNAP_POINTS = [
  EDITOR_MOBILE_DEFAULT_SNAP_POINT,
  EDITOR_MOBILE_FULL_SNAP_POINT,
];

/* ==========================================================================
   Types
========================================================================== */

interface EditorMobilePanelProps {
  snapPoint?: number;
  onSnapPointChange?: (snapPoint: number) => void;
  handleOnly?: boolean;
  open: boolean;

  children: ReactNode;

  onOpenChange: (open: boolean) => void;
}

/* ==========================================================================
   Editor Mobile Panel
========================================================================== */

export default function EditorMobilePanel({
  open,
  children,
  onOpenChange,
  snapPoint,
  onSnapPointChange,
  handleOnly,
}: EditorMobilePanelProps) {
  /* ==========================================================================
     Render
  ========================================================================== */

  return (
<Drawer
  open={open}
  onOpenChange={onOpenChange}
  modal={false}
  snapPoint={snapPoint}
  onSnapPointChange={(point) => {
    if (typeof point === "number") {
      onSnapPointChange?.(point);
    }
  }}
  snapPoints={EDITOR_MOBILE_SNAP_POINTS}
>
      <DrawerContent handleOnly={handleOnly}>{children}</DrawerContent>
    </Drawer>
  );
}
