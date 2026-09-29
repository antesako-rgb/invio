"use server";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions/actionResult";
import { deleteDigitalAlbumWithStorage } from "../../services/deleteDigitalAlbumWithStorage";

export async function deleteDigitalAlbumAction(albumId: string): Promise<ActionResult> {
  try {
    await deleteDigitalAlbumWithStorage(albumId);
    revalidatePath("/[locale]/dashboard", "layout");
    return { success: true };
  } catch (error) {
    revalidatePath("/[locale]/dashboard", "layout");
    return { success: false, message: error instanceof Error ? error.message : "Album deletion failed." };
  }
}
