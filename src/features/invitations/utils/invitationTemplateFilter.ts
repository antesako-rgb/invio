import type { ProjectEventType } from "@/features/projects/types/projectEvent.types";
export type InvitationTemplateFilter = ProjectEventType | "all";
type ClassifiedTemplate = { event_type: ProjectEventType | null };
export function filterInvitationTemplates<T extends ClassifiedTemplate>(templates: T[], filter: InvitationTemplateFilter): T[] {
  return templates.filter(template => filter === "all" || template.event_type === null || template.event_type === filter);
}
