import { uploadProjectPhoto } from "@/features/project-photos/storage/uploadProjectPhoto";

export async function uploadInvitationPhoto(invitationId: string, file: File, description = "") {
  const result = await uploadProjectPhoto({ kind: "invitation", productId: invitationId, description }, file);
  if (result.kind !== "invitation") throw new Error("Invalid storage result");
  return result.relation;
}
