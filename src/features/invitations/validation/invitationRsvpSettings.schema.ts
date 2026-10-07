import { z } from "zod";

export const invitationRsvpSettingsSchema = z.object({
  p_invitation_id: z.string().uuid(),
  p_generic_rsvp_enabled: z.boolean(),
  p_generic_rsvp_max_guests: z.number().int().min(1),
  p_generic_rsvp_capacity: z.number().int().min(1).nullable(),
}).strict();
