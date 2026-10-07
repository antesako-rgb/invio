import { isProjectEventType } from "@/features/projects/types/projectEvent.types";
import { createServerClient } from "@/lib/supabase/server";
import type { InvitationTemplate } from "../../types/invitationTemplate.types";
import { assertInvitationVersion, parseInvitationDocument } from "../../utils/parseInvitationDocument";

export async function getInvitationTemplates(): Promise<InvitationTemplate[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase.from("invitation_templates").select("*")
    .eq("is_active", true).order("sort_order").order("id");
  if (error) throw error;
  return data.map(template => {
    if (template.event_type !== null && !isProjectEventType(template.event_type)) throw new Error("Unsupported template event type");
    assertInvitationVersion(template.document_version);
    return { ...template, event_type: template.event_type, document: parseInvitationDocument(template.document) };
  });
}
