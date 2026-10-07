import type { z } from "zod";
import type { genericGuestSchema, submitGenericRsvpSchema, genericRsvpSuccessSchema } from "../validation/genericRsvp.schema";
export type GenericRsvpGuest = z.infer<typeof genericGuestSchema>;
export type SubmitGenericRsvpInput = z.infer<typeof submitGenericRsvpSchema>;
export type GenericRsvpSuccess = z.infer<typeof genericRsvpSuccessSchema>;
