import { notFound } from "next/navigation";
import { z } from "zod";
import { getProject } from "@/features/projects/repositories/getProject";
import { getSeatingWorkspace } from "@/features/seating/repositories/getSeatingWorkspace";
import SeatingWorkspace from "@/features/seating/components/SeatingWorkspace";
export default async function Page({ params }: { params: Promise<{ projectId: string; planId: string }> }) {
  const { projectId, planId } = await params;
  if (process.env.PROJECT_GUESTS_ENABLED !== "true" || !z.string().uuid().safeParse(projectId).success || !z.string().uuid().safeParse(planId).success) notFound();
  const [project, data] = await Promise.all([getProject(projectId), getSeatingWorkspace(projectId, planId)]);
  if (!project || !data.current) notFound();
  return <SeatingWorkspace key={planId} projectId={projectId} initial={data} />;
}
