"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import EditorShell from "@/features/editor/components/EditorShell/EditorShell";
import EditorWorkspace from "@/features/editor/components/EditorWorkspace/EditorWorkspace";
import EditorMobileNavigation from "@/features/editor/components/EditorMobileNavigation/EditorMobileNavigation";
import EditorMobilePanel from "@/features/editor/components/EditorMobilePanel/EditorMobilePanel";
import { DrawerTitle, DrawerDescription } from "@/components/ui/drawer/Drawer";
import SideNavigation from "@/components/ui/side-navigation/SideNavigation";
import { getPhotoWallMaterialEditorNavigationItems } from "../../navigation/getPhotoWallMaterialEditorNavigationItems";
import type { PhotoWallMaterialEditorStep } from "../../types/photoWallMaterialEditor.types";

export default function PhotoWallMaterialEditor({ header, sidebar, children, activeStep, onStepChange }: {
  header: ReactNode; sidebar: ReactNode; children: ReactNode;
  activeStep: PhotoWallMaterialEditorStep;
  onStepChange: (step: PhotoWallMaterialEditorStep) => void;
}) {
  const t = useTranslations("PhotoWalls.editor");
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = getPhotoWallMaterialEditorNavigationItems(t);
  function navigate(id: string) {
    if (id === "content" || id === "design" || id === "qr") onStepChange(id);
  }
  return (
    <EditorShell header={header} mobileControls={
      <>
        <EditorMobileNavigation items={items} activeId={activeStep} ariaLabel={t("navigation.label")}
          onNavigate={id => { navigate(id); setMobileOpen(true); }} />
        <EditorMobilePanel open={mobileOpen} onOpenChange={setMobileOpen} handleOnly>
          <DrawerTitle className="sr-only">{t(`navigation.${activeStep}`)}</DrawerTitle>
          <DrawerDescription className="sr-only">{t("mobile.description")}</DrawerDescription>
          {sidebar}
        </EditorMobilePanel>
      </>
    }>
      <EditorWorkspace sidebar={sidebar} toolRail={
        <SideNavigation items={items} variant="controlled" appearance="rail" activeId={activeStep}
          onControlledNavigate={navigate} ariaLabel={t("navigation.label")} />
      }>{children}</EditorWorkspace>
    </EditorShell>
  );
}
