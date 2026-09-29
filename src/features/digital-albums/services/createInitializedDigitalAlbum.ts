import "server-only";
import { requireProjectOwner } from "@/features/projects/repositories/requireProjectOwner";
import { createDigitalAlbum } from "../repositories/album/createDigitalAlbum";
import { deleteDigitalAlbum } from "../repositories/album/deleteDigitalAlbum";
import { updateDigitalAlbumDocument } from "../repositories/album/updateDigitalAlbumDocument";
import { createDefaultDigitalAlbumDocument } from "../document/createDefaultDigitalAlbumDocument";

// Entry-point provisioning only. The existing editor and starter model are unchanged.
export async function createInitializedDigitalAlbum(projectId: string, name: string) {
  const project = await requireProjectOwner(projectId);
  const album = await createDigitalAlbum({ p_project_id: project.id, p_name: name });
  try {
    return await updateDigitalAlbumDocument({
      albumId: album.id,
      document: createDefaultDigitalAlbumDocument({
        eventName: project.project_event_details ? project.name : name,
        eventDate: project.project_event_details?.start_date ?? "",
      }),
      documentVersion: 2,
      documentRevision: album.document_revision,
    });
  } catch (error) {
    // This album has not been exposed to the editor or received any uploads yet.
    // Roll back only the newly created album, never its Project or sibling products.
    try { await deleteDigitalAlbum(album.id); }
    catch { console.error("New album initialization cleanup failed.", { albumId: album.id, projectId }); }
    throw error;
  }
}
