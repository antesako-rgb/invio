import "server-only";
import { randomUUID } from "crypto";
import { createServerClient } from "@/lib/supabase/server";
import { uploadToBunny } from "@/features/project-photos/storage/bunny";
import { optimizeImage } from "@/features/project-photos/storage/optimizeImage";
import { validateImage } from "@/features/project-photos/storage/validateImage";
import { storageUploadSchema, type StorageUploadInput } from "./storageLifecycle.schema";
import { finalizeStorageUpload, reserveStorageUpload } from "./storageLifecycleRepository";

async function retryOnce<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch {
    // The first request may have committed. Retry with the SAME reservation ID.
    return operation();
  }
}

export async function uploadProjectPhoto(input: StorageUploadInput, file: File) {
  const target = storageUploadSchema.parse(input);
  if (!(file instanceof File) || file.size === 0) throw new Error("Invalid image file");
  validateImage(file);
  let actorId: string | null = null;
  if (target.kind !== "photo-wall") {
    const client = await createServerClient();
    const { data: { user }, error } = await client.auth.getUser();
    if (error || !user) throw new Error("UNAUTHORIZED");
    actorId = user.id;
  }

  const id = randomUUID();
  // DB resolves the project, verifies membership/public availability, and
  // reserves the key BEFORE image processing or any external storage write.
  const reservation = await retryOnce(() => reserveStorageUpload({
    p_id: id, p_kind: target.kind, p_product_id: target.productId ?? null,
    p_public_id: target.publicId ?? null, p_actor_id: actorId,
  }));
  const buffer = await optimizeImage({ buffer: await file.arrayBuffer(), width: 1600, quality: 85 });
  const bytes = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
  if (Date.now() + 120_000 >= Date.parse(reservation.expires_at)) {
    throw new Error("Upload reservation expired");
  }
  await uploadToBunny(bytes, reservation.storage_key, "image/webp");
  // NEVER delete on an ambiguous finalization failure. Durable reservation records
  // Ambiguous uploads are retained for review; only finalized uploads enter
  // automatic cleanup. A committed finalization remains referenced.
  return retryOnce(() => finalizeStorageUpload({
    p_id: reservation.id, p_file_size: buffer.byteLength,
    p_description: target.description || null,
  }));
}
