import type { ProjectEventType } from "@/features/projects/types/projectEvent.types";
import type { Tables } from "@/lib/supabase/database.types";
import type { InvitationDocument } from "./invitationDocument.types";
export type InvitationTemplate = Omit<Tables<"invitation_templates">, "document" | "event_type"> & { document: InvitationDocument; event_type: ProjectEventType | null };
