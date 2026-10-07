import "server-only";
import type { Database } from "@/lib/supabase/database.types";
import { createAdminClient } from "@/lib/supabase/admin";
import { cleanupJobsSchema, finalizedPhotoSchema, reservationSchema } from "./storageLifecycle.schema";

type Functions = Database["public"]["Functions"];
type ReserveInput = Omit<Functions["storage_reserve_upload"]["Args"],
  "p_product_id" | "p_public_id" | "p_actor_id"> & {
  p_product_id: string | null;
  p_public_id: string | null;
  p_actor_id: string | null;
};
type FinalizeInput = Omit<Functions["storage_finalize_upload"]["Args"], "p_description"> & {
  p_description: string | null;
};

export async function reserveStorageUpload(args: ReserveInput) {
  // The generator does not express nullable SQL input arguments.
  const { data, error } = await createAdminClient().rpc("storage_reserve_upload", {
    ...args,
    p_product_id: args.p_product_id!,
    p_public_id: args.p_public_id!,
    p_actor_id: args.p_actor_id!,
  });
  if (error) throw error;
  const reservation = reservationSchema.parse(data);
  if (reservation.id !== args.p_id) throw new Error("Reservation identity mismatch");
  return reservation;
}

export async function finalizeStorageUpload(args: FinalizeInput) {
  const { data, error } = await createAdminClient().rpc("storage_finalize_upload", {
    ...args,
    p_description: args.p_description!,
  });
  if (error) throw error;
  const result = finalizedPhotoSchema.parse(data);
  const id = result.kind === "photo-wall" ? result.photo.id : result.relation.photo_id;
  if (id !== args.p_id) throw new Error("Finalized photo identity mismatch");
  return result;
}

export async function requestStorageCleanup(photoId: string) {
  const { error } = await createAdminClient().rpc("storage_request_cleanup", { p_photo_id: photoId });
  if (error) throw error;
}

export async function claimStorageCleanup(limit = 10) {
  const { data, error } = await createAdminClient().rpc("storage_claim_cleanup", { p_limit: limit });
  if (error) throw error;
  return cleanupJobsSchema.parse(data);
}

export async function finishStorageCleanup(id: string, leaseToken: string, success: boolean) {
  const { error } = await createAdminClient().rpc("storage_finish_cleanup", {
    p_id: id, p_lease_token: leaseToken, p_success: success,
  });
  if (error) throw error;
}
