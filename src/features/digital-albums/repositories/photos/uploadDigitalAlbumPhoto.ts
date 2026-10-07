import { uploadProjectPhoto } from "@/features/project-photos/storage/uploadProjectPhoto";
import type { DigitalAlbumPhoto } from "../../types/digitalAlbumPhoto.types";

interface UploadDigitalAlbumPhotoInput {
  file: File;
  albumId: string;
  description?: string;
}

export async function uploadDigitalAlbumPhoto({ file, albumId, description }: UploadDigitalAlbumPhotoInput): Promise<DigitalAlbumPhoto> {
  const result = await uploadProjectPhoto({ kind: "digital-album", productId: albumId, description }, file);
  if (result.kind !== "digital-album") throw new Error("Invalid storage result");
  return result.relation;
}
