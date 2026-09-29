import type { ProjectWithEventDetails } from "@/features/projects/types/project.types";
import { isProjectEventType, type ProjectEvent } from "../types/projectEvent.types";

// Form projection of actual Project event details; neutral projects remain neutral.
export function mapProjectEvent(project: ProjectWithEventDetails): ProjectEvent | null {
  const details = project.project_event_details;
  if (!details) return null;
  if (!isProjectEventType(details.type)) throw new Error(`Unsupported event type: ${details.type}`);
  return {
    id: project.id, owner_id: project.owner_id, name: project.name,
    created_at: project.created_at, updated_at: project.updated_at,
    type: details.type, custom_type: details.type === "other" ? details.custom_type : null,
    start_date: details.start_date, start_time: details.start_time,
    location_name: details.location_name, location_address: details.location_address,
  };
}
