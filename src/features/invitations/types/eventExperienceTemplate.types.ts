import type {
  EventExperienceEditorContext,
} from "@/features/invitations/editor/types/eventExperienceEditor.types";

import type {
  EventExperienceRenderData,
  EventExperienceRenderMode,
} from "@/features/invitations/types/eventExperienceRenderer.types";

import type {
  EventExperienceTemplateConfig,
} from "@/features/invitations/types/eventExperienceTemplateConfig.types";


/* ==========================================================================
   Event Experience Template Props
========================================================================== */

export interface EventExperienceTemplateProps {
  data:
    EventExperienceRenderData;

  mode:
    EventExperienceRenderMode;

  editor?:
    EventExperienceEditorContext;
}


/* ==========================================================================
   Event Experience Template Component
========================================================================== */

export type EventExperienceTemplateComponent =
  React.ComponentType<
    EventExperienceTemplateProps
  >;


/* ==========================================================================
   Event Experience Template Definition
========================================================================== */

export interface EventExperienceTemplateDefinition {
  config:
    EventExperienceTemplateConfig;

  component:
    EventExperienceTemplateComponent;
}