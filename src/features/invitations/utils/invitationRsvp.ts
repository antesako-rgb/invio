import { z } from "zod";
import type { InvitationDocumentPage, InvitationRsvpConfiguration, RsvpAttendance } from "../types/invitationDocument.types";
import type { Json } from "@/lib/supabase/database.types";

export const invitationRsvpSchema = z.object({
  attendance: z.object({ label: z.string().max(10000), attendingLabel: z.string().max(10000), notAttendingLabel: z.string().max(10000) }).strict(),
  questions: z.array(z.object({ id: z.string().uuid(), type: z.enum(["short_text", "long_text", "choice"]), label: z.string().trim().min(1).max(10000), required: z.boolean(), options: z.array(z.object({ id: z.string().uuid(), label: z.string().trim().min(1).max(10000) }).strict()).optional() }).strict().refine(question => question.type !== "choice" || !!question.options?.length, "Choice requires options").refine(question => !question.options || new Set(question.options.map(option => option.id)).size === question.options.length, "Duplicate option ID")),
}).strict();

export function getInvitationRsvp(page: InvitationDocumentPage | undefined, defaults: RsvpAttendance): InvitationRsvpConfiguration {
  return { attendance: {
    label: page?.rsvp?.attendance.label.trim() || defaults.label,
    attendingLabel: page?.rsvp?.attendance.attendingLabel.trim() || defaults.attendingLabel,
    notAttendingLabel: page?.rsvp?.attendance.notAttendingLabel.trim() || defaults.notAttendingLabel,
  }, questions: page?.rsvp?.questions ?? [] };
}

export function validateInvitationRsvpAnswers(questions: InvitationRsvpConfiguration["questions"], guests: { invitation_guest_id: string; status: "attending" | "not_attending"; answers: Record<string, Json> }[]) {
  return guests.map(guest => {
    if (guest.status === "not_attending") return { ...guest, answers: {} };
    for (const question of questions) {
      const value = guest.answers[question.id];
      if (value !== undefined && typeof value !== "string") throw new Error("Invalid RSVP answer");
      if (question.type === "choice" && value && !question.options?.some(option => option.id === value)) throw new Error("Invalid choice");
      if (question.required && (typeof value !== "string" || !value.trim())) throw new Error("Required RSVP answer missing");
    }
    return guest;
  });
}
