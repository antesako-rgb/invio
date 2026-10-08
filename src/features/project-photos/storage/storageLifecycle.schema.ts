import { z } from "zod";
import { storageKeySchema } from "@/features/project-photos/storage/storageKey.schema";

export const storageUploadSchema = z.object({
  kind: z.enum(["invitation", "digital-album", "photo-wall"]),
  productId: z.string().uuid().optional(),
  publicId: z.string().trim().min(1).max(150).optional(),
  description: z.string().trim().max(300).nullable().optional(),
}).strict().superRefine((input, context) => {
  if (input.kind === "photo-wall" ? !input.publicId || input.productId : !input.productId || input.publicId) {
    context.addIssue({ code: "custom", message: "Invalid upload target" });
  }
});

export type StorageUploadInput = z.infer<typeof storageUploadSchema>;

export const reservationSchema = z.object({
  id: z.string().uuid(),
  storage_key: storageKeySchema,
  expires_at: z.string().datetime({ offset: true }),
}).refine(value => value.storage_key.endsWith(`/${value.id}.webp`), "Reservation key mismatch");

const relationSchema = z.object({
  photo_id: z.string().uuid(),
  created_at: z.string(),
  description: z.string().nullable(),
});

export const finalizedPhotoSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("invitation"), relation: relationSchema.extend({ invitation_id: z.string().uuid() }) }),
  z.object({ kind: z.literal("digital-album"), relation: relationSchema.extend({ album_id: z.string().uuid() }) }),
  z.object({
    kind: z.literal("photo-wall"),
    photo: z.object({
      id: z.string().uuid(), photoWallId: z.string().uuid(),
      imagePath: storageKeySchema, fileSize: z.number().int().positive(),
      description: z.string().nullable(), isFavorite: z.boolean(), createdAt: z.string(),
    }),
  }),
]);

export const cleanupJobsSchema = z.array(z.object({
  // Missing proof from the old claim RPC fails closed before any Bunny DELETE.
  finalized: z.literal(true),
  object_id: z.string().uuid(),
  storage_key: storageKeySchema,
  lease_token: z.string().uuid(),
}).refine(value => value.storage_key.endsWith(`/${value.object_id}.webp`), "Cleanup key mismatch"));
