import { z } from "zod";
import type { RsvpQuestion } from "../types/invitationDocument.types";
import { personalizedRsvpStatusSchema } from "./publicRsvp.schema";

export const genericGuestSchema = z.object({
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().max(100).nullable().transform(value => value || null),
  status: personalizedRsvpStatusSchema,
  answers: z.record(z.string()),
}).strict().transform(guest => ({ ...guest, answers: guest.status === "not_attending" ? {} : guest.answers }));
export const submitGenericRsvpSchema = z.object({ p_public_id: z.string().trim().min(1).max(150), p_guests: z.array(genericGuestSchema).min(1) }).strict();
export const genericRsvpSuccessSchema = z.object({ success: z.literal(true), submitted_at: z.string().datetime({ offset: true }) });
export function validateGenericAnswers(questions: RsvpQuestion[], guests: z.infer<typeof genericGuestSchema>[]) {
  return guests.map(guest => {
    if (guest.status === "not_attending") return { ...guest, answers: {} };
    const answers: Record<string, string> = {};
    for (const question of questions) {
      const value = guest.answers[question.id] ?? "";
      if (question.type === "choice" && value && !question.options?.some(option => option.id === value)) throw new Error("Invalid choice");
      if (question.required && !value.trim()) throw new Error("Required answer missing");
      answers[question.id] = value;
    }
    return { ...guest, answers };
  });
}
