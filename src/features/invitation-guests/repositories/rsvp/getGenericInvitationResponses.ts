import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { rsvpAnswersSchema, personalizedRsvpStatusSchema } from "@/features/invitations/validation/publicRsvp.schema";
import type { GenericInvitationResponse } from "../../types/invitationResponse.types";
const schema = z.array(z.object({
  id: z.string().uuid(),
  submitted_at: z.string(),
  rsvp_response_guests: z.array(z.object({
    id: z.string().uuid(),
    first_name: z.string().min(1),
    last_name: z.string().nullable(),
    status: personalizedRsvpStatusSchema,
    answers: rsvpAnswersSchema
  }))
}));

export async function getGenericInvitationResponses(invitationId: string): Promise<GenericInvitationResponse[]> {
  const db = await createServerClient();
  const { data, error } = await db.from("rsvp_responses")
    .select("id,submitted_at,rsvp_response_guests(id,first_name,last_name,status,answers)")
    .eq("invitation_id", invitationId).eq("response_type", "generic")
    .order("submitted_at", {
      ascending: false
    }).order("id");
  if (error) throw error;
  return schema.parse(data).map(response => ({
    id: response.id,
    submitted_at: response.submitted_at,
    guests: response.rsvp_response_guests.sort((a, b) => a.id.localeCompare(b.id))
  }));
}
