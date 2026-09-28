"use client";

import { useLayoutEffect, useMemo, useRef, type ComponentProps, type ReactNode } from "react";

import { Drawer, DrawerContent } from "@/components/ui/drawer/Drawer";

/* ==========================================================================
   Constants
========================================================================== */

export const EDITOR_MOBILE_DEFAULT_SNAP_POINT = 0.23;
export const EDITOR_MOBILE_FULL_SNAP_POINT = 1;

/* ==========================================================================
   Types
========================================================================== */

export type EditorMobilePanelChangeDetails = Parameters<
  NonNullable<ComponentProps<typeof Drawer>["onOpenChange"]>
>[1];

interface EditorMobilePanelProps {
  defaultSnapPoint?: number;
  scrollResetKey?: string;
  snapPoint?: number;
  onSnapPointChange?: (snapPoint: number) => void;
  handleOnly?: boolean;
  open: boolean;

  children: ReactNode;

  onOpenChange: ComponentProps<typeof Drawer>["onOpenChange"];
}

/* ==========================================================================
   Editor Mobile Panel
========================================================================== */

export default function EditorMobilePanel({
  defaultSnapPoint = EDITOR_MOBILE_DEFAULT_SNAP_POINT,
  scrollResetKey,
  open,
  children,
  onOpenChange,
  snapPoint,
  onSnapPointChange,
  handleOnly,
}: EditorMobilePanelProps) {
  const snapPoints = useMemo(() => [defaultSnapPoint, EDITOR_MOBILE_FULL_SNAP_POINT], [defaultSnapPoint]);
  const content = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (open && scrollResetKey !== undefined && content.current) content.current.scrollTop = 0;
  }, [open, scrollResetKey]);
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
      snapPoints={snapPoints}
    >
      <DrawerContent contentRef={content} initialFocus={scrollResetKey !== undefined ? false : undefined} handleOnly={handleOnly}>{children}</DrawerContent>
    </Drawer>
  );
}
