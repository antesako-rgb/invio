import { createServerClient } from "@/lib/supabase/server";
import { z } from "zod";
import { PROJECT_EVENT_TYPES, type ProjectEvent, type UpdateProjectEventInput } from "../types/projectEvent.types";
import { mapProjectEvent } from "./mapProjectEvent";

const schema = z.object({
  p_project_id: z.string().uuid(), p_name: z.string().trim().min(1).max(150),
  p_type: z.enum(PROJECT_EVENT_TYPES), p_start_date: z.string().date(),
  p_custom_type: z.string().trim().max(100).nullable(),
  p_start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/).nullable(),
  p_location_name: z.string().trim().max(150).nullable(),
  p_location_address: z.string().trim().max(250).nullable(),
}).refine(value => value.p_type !== "other" || Boolean(value.p_custom_type), { message: "Custom event type is required." });

export async function updateProjectEvent(input: UpdateProjectEventInput): Promise<ProjectEvent> {
  const value = schema.parse(input);
  const supabase = await createServerClient();
  // Authorize through the owner-only root RPC first. Details retain their own RLS.
  // These are two operations: the database exposes no atomic combined update RPC.
  const { data: project, error } = await supabase.rpc("update_project", {
    p_project_id: value.p_project_id, p_name: value.p_name,
  });
  if (error) throw error;
  if (!project) throw new Error("Project RPC returned no project.");
  const { data: details, error: detailsError } = await supabase.from("project_event_details")
    .update({ type: value.p_type, start_date: value.p_start_date,
      custom_type: value.p_type === "other" ? value.p_custom_type : null,
      start_time: value.p_start_time, location_name: value.p_location_name,
      location_address: value.p_location_address })
    .eq("project_id", project.id).select("*").single();
  if (detailsError) throw detailsError;
  const event = mapProjectEvent({ ...project, project_event_details: details });
  if (!event) throw new Error("ProjectEvent details not found.");
  return event;
}
