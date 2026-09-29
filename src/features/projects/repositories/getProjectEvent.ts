import { getProject } from "@/features/projects/repositories/getProject";
import { mapProjectEvent } from "./mapProjectEvent";

// ProjectEvent Details forms consume a flattened view of the Project and its real event details.
export async function getProjectEvent(projectId: string) {
  const project = await getProject(projectId);
  return project ? mapProjectEvent(project) : null;
}
