"use client";

import { useSyncExternalStore, type ComponentType, type ReactNode } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet/Sheet";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer/Drawer";
import styles from "./InvitationGuests.module.css";

export type GuestSurfaceFooter = ComponentType<{ children: ReactNode; className?: string }>;
const media = "(max-width: 767px)";
function subscribe(callback: () => void) {
  const query = window.matchMedia(media);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const snapshot = () => window.matchMedia(media).matches;
const serverSnapshot = () => false;

export default function GuestManagementSurface({ open, busy, title, description, onClose, children }: {
  open: boolean; busy: boolean; title: string; description: string; onClose: () => void;
  children: (Footer: GuestSurfaceFooter) => ReactNode;
}) {
  const mobile = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const t = useTranslations("InvitationGuests");
  if (mobile) return <Drawer open={open} onOpenChange={(next, details) => { if (busy) details.cancel(); else if (!next) onClose(); }}>
    <DrawerContent handleOnly showCloseButton={false} className={styles.drawer}>
      <DrawerHeader><DrawerTitle>{title}</DrawerTitle><DrawerDescription>{description}</DrawerDescription></DrawerHeader>
      {children(DrawerFooter)}
      <DrawerClose disabled={busy} render={<Button variant="ghost" size="icon" className={styles.surfaceClose} aria-label={t("close")} />}><X aria-hidden="true" /></DrawerClose>
    </DrawerContent>
  </Drawer>;
  return <Sheet open={open} onOpenChange={(next, details) => { if (busy) details.cancel(); else if (!next) onClose(); }}>
    <SheetContent side="right" showCloseButton={false} className={styles.sheet}>
      <SheetHeader><SheetTitle>{title}</SheetTitle><SheetDescription>{description}</SheetDescription></SheetHeader>
      {children(SheetFooter)}
      <SheetClose disabled={busy} render={<Button variant="ghost" size="icon" className={styles.surfaceClose} aria-label={t("close")} />}><X aria-hidden="true" /></SheetClose>
    </SheetContent>
  </Sheet>;
}
