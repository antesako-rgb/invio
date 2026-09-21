"use client";

import type {
  ReactNode,
} from "react";

import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer/Drawer";


/* ==========================================================================
   Constants
========================================================================== */

const EDITOR_MOBILE_SNAP_POINTS = [
  0.23,
  0.90,
];

const EDITOR_MOBILE_DEFAULT_SNAP_POINT =
  0.23;


/* ==========================================================================
   Types
========================================================================== */

interface EditorMobilePanelProps {
  open:
    boolean;

  children:
    ReactNode;

  onOpenChange:
    (
      open:
        boolean
    ) => void;
}


/* ==========================================================================
   Editor Mobile Panel
========================================================================== */

export default function EditorMobilePanel({
  open,
  children,
  onOpenChange,
}: EditorMobilePanelProps) {
  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Drawer
      open={
        open
      }
      onOpenChange={
        onOpenChange
      }
      modal={false}
      snapPoints={
        EDITOR_MOBILE_SNAP_POINTS
      }
      defaultSnapPoint={
        EDITOR_MOBILE_DEFAULT_SNAP_POINT
      }
    >
      <DrawerContent>
        {children}
      </DrawerContent>
    </Drawer>
  );
}