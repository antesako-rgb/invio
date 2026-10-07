import { z } from "zod";
import type { Json } from "@/lib/supabase/database.types";
import { recipientTokenSchema } from "@/features/invitation-guests/validation/recipientToken.schema";
import { parseInvitationDocument } from "../utils/parseInvitationDocument";

const jsonValue: z.ZodType<Json> = z.lazy(() => z.union([z.string(), z.number().finite(), z.boolean(), z.null(), z.array(jsonValue), z.record(jsonValue)]));
export const rsvpAnswersSchema = z.record(jsonValue);
export const personalizedRsvpStatusSchema = z.enum(["attending", "not_attending"]);
export const personalizedRsvpSuccessSchema = z.object({ success: z.literal(true), submitted_at: z.string().datetime({ offset: true }) });
export const publicRsvpSchema = z.object({
  invitation: z.object({ public_id: z.string().min(1), name: z.string(), document_version: z.literal(1), document: z.record(z.unknown()).transform(parseInvitationDocument) }),
  photos: z.array(z.object({ id: z.string().uuid(), image_path: z.string().min(1), description: z.string().nullable() })),
  recipient: z.object({ has_response: z.boolean(), submitted_at: z.string().nullable() }),
  guests: z.array(z.object({
    invitation_guest_id: z.string().uuid(), first_name: z.string().trim().min(1).max(100), last_name: z.string().nullable(),
    is_primary: z.boolean(), status: personalizedRsvpStatusSchema.nullable(), answers: rsvpAnswersSchema.nullable(),
  })).min(1),
});
export const submitPersonalizedRsvpGuestSchema = z.object({
  invitation_guest_id: z.string().uuid(), status: personalizedRsvpStatusSchema, answers: rsvpAnswersSchema,
}).strict();
export const submitPersonalizedRsvpSchema = z.object({
  p_token: recipientTokenSchema,
  p_guests: z.array(submitPersonalizedRsvpGuestSchema).min(1).refine(guests => new Set(guests.map(guest => guest.invitation_guest_id)).size === guests.length),
}).strict();
