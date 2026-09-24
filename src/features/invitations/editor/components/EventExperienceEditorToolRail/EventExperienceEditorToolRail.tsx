"use client";

import { useTranslations } from "next-intl";

import SideNavigation
  from "@/components/ui/side-navigation/SideNavigation";

import { getEventExperienceEditorNavigationItems }
  from "@/features/invitations/editor/navigation/getEventExperienceEditorNavigationItems";

import type { EventExperienceEditorStep }
  from "@/features/invitations/editor/types/eventExperienceEditor.types";

import type { EventExperienceTemplateFeaturesConfig }
  from "@/features/invitations/types/eventExperienceTemplateConfig.types";

import type { EventExperienceType }
  from "@/features/invitations/types/eventExperience.types";

interface EventExperienceEditorToolRailProps {
  type: EventExperienceType;
  features: EventExperienceTemplateFeaturesConfig;
  activeStep: EventExperienceEditorStep;
  onStepChange: (step: EventExperienceEditorStep) => void;
}

export default function EventExperienceEditorToolRail({
  type,
  features,
  activeStep,
  onStepChange,
}: EventExperienceEditorToolRailProps) {
  const t = useTranslations("EventExperiences.editor");

  const hasDetails = type === "invitation" && features.details;
  const hasRsvp = type === "invitation" && features.rsvp;

  const navigationItems = getEventExperienceEditorNavigationItems(t, {
    hasDetails,
    hasRsvp,
  }).filter((item) => item.id !== "preview");

  function handleNavigation(id: string) {
    if (
      id === "design" ||
      (id === "details" && hasDetails) ||
      (id === "rsvp" && hasRsvp)
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
