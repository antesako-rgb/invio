import { ProjectNavigationBridge } from "@/components/navigation/ProjectNavigationContext";
import { notFound } from "next/navigation";
import BackLink from "@/components/ui/back-link/BackLink";
import { getProject } from "../../repositories/getProject";
export default async function ProjectProductContext({ projectId, product }: { projectId: string; product?: "invitations" | "albums" | "photo-wall" }) {
 const project = await getProject(projectId);
 if (!project) notFound();
 return <><ProjectNavigationBridge projectId={projectId} /><BackLink href={`/dashboard/projects/${projectId}${product ? `/${product}` : ""}`} label={project.name} /></>;
}
