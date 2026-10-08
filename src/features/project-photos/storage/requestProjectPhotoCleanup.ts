import "server-only";
import { z } from "zod";
import { requestStorageCleanup } from "./storageLifecycleRepository";

export async function requestProjectPhotoCleanup({ photoId }: { photoId: string }): Promise<void> {
  // Only called after an authorized unlink. Legacy IDs have no trusted private
  // object record and are deliberately retained by the DB cleanup contract.
  await requestStorageCleanup(z.string().uuid().parse(photoId));
}
