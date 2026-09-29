"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createProject } from "../repositories/createProject";
import { createInitializedDigitalAlbum } from "@/features/digital-albums/services/createInitializedDigitalAlbum";

const schema = z.object({ name: z.string().trim().min(1).max(150), projectId: z.string().uuid().optional() }).strict();
type Result = { success: true; albumId: string; projectId: string } | { success: false; projectId?: string };

export async function createAlbumEntryAction(input: z.infer<typeof schema>): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { success: false };
  let projectId = parsed.data.projectId;
  try {
    if (!projectId) projectId = (await createProject({ p_name: parsed.data.name })).id;
    const album = await createInitializedDigitalAlbum(projectId, parsed.data.name);
    revalidatePath("/[locale]/dashboard", "layout");
    return { success: true, albumId: album.id, projectId };
  } catch {
    revalidatePath("/[locale]/dashboard", "layout");
    // Keep a successfully created neutral Project recoverable after a product failure.
    // The form retries with this ID, so it does not create another Project each time.
    return { success: false, projectId };
  }
}
