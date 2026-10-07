import { uploadProjectPhoto } from "@/features/project-photos/storage/uploadProjectPhoto";
import type { PhotoWallPhoto, UploadPhotoWallPhotoInput } from "../../types/photoWallPhoto.types";

export async function uploadPhotoWallPhoto({ publicId, file, description }: UploadPhotoWallPhotoInput): Promise<PhotoWallPhoto> {
  const result = await uploadProjectPhoto({ kind: "photo-wall", publicId, description }, file);
  if (result.kind !== "photo-wall") throw new Error("Invalid storage result");
  return result.photo;
}
