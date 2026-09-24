"use client";

import {
  useTranslations,
} from "next-intl";

import SideNavigation
  from "@/components/ui/side-navigation/SideNavigation";

import {
  getDigitalAlbumEditorNavigationItems,
} from "@/features/digital-albums/editor/navigation/getDigitalAlbumEditorNavigationItems";

import type {
  DigitalAlbumEditorStep,
} from "@/features/digital-albums/editor/types/digitalAlbumEditor.types";

interface DigitalAlbumEditorToolRailProps {
  activeStep:
    DigitalAlbumEditorStep;

  onStepChange:
    (step: DigitalAlbumEditorStep) => void;
}

export default function DigitalAlbumEditorToolRail({
  activeStep,
  onStepChange,
}: DigitalAlbumEditorToolRailProps) {
  const t =
    useTranslations("DigitalAlbumEditor");

  const navigationItems =
    getDigitalAlbumEditorNavigationItems(t);

  function handleNavigation(id: string) {
    if (
      id === "photos" ||
      id === "pages" ||
      id === "design"
    ) {
      onStepChange(id);
    }
  }

  return (
    <SideNavigation
      items={navigationItems}
      variant="controlled"
      appearance="rail"
      activeId={activeStep}
      onControlledNavigate={handleNavigation}
      ariaLabel={t("navigation.label")}
    />
  );
}
