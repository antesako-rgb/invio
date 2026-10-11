"use client";

import {
  useTranslations,
} from "next-intl";

import EditorToolRail
  from "@/features/editor/components/EditorToolRail/EditorToolRail";

import {
  getDigitalAlbumEditorNavigationItems,
} from "@/features/digital-albums/editor/navigation/getDigitalAlbumEditorNavigationItems";

import type {
  DigitalAlbumEditorStep,
} from "@/features/digital-albums/editor/types/digitalAlbumEditor.types";

interface DigitalAlbumEditorToolRailProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  activeStep:
    DigitalAlbumEditorStep;

  onStepChange:
    (step: DigitalAlbumEditorStep) => void;
}

export default function DigitalAlbumEditorToolRail({
  collapsed,
  onToggleCollapsed,
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
      id === "templates" || id === "theme"
    ) {
      onStepChange(id);
    }
  }

  return (
    <EditorToolRail
      items={navigationItems}
      activeId={activeStep}
      collapsed={collapsed}
      onToggleCollapsed={onToggleCollapsed}
      onNavigate={handleNavigation}
      ariaLabel={t("navigation.label")}
    />
  );
}
