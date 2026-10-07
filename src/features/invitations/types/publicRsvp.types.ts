import type { z } from "zod";
import type { publicRsvpSchema, submitPersonalizedRsvpSchema, personalizedRsvpStatusSchema, rsvpAnswersSchema } from "../validation/publicRsvp.schema";

export type PublicRsvp = z.infer<typeof publicRsvpSchema>;
export type SubmitPersonalizedRsvpInput = z.infer<typeof submitPersonalizedRsvpSchema>;

export type RsvpStatus = z.infer<typeof personalizedRsvpStatusSchema>;
export type RsvpAnswersObject = z.infer<typeof rsvpAnswersSchema>;
