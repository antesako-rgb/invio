import "server-only";
import { deleteProject } from "../repositories/deleteProject";

export async function deleteProjectWithStorage(projectId: string): Promise<void> {
  // Owner authorization remains in delete_project. The private ledger survives
  // cascades; the scheduled sweep queues only proven, unreferenced objects.
  await deleteProject({ p_project_id: projectId });
}
