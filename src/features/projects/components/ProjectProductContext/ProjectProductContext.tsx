import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import BackLink from "@/components/ui/back-link/BackLink";
import { getProject } from "../../repositories/getProject";

export default async function ProjectProductContext({ projectId }: { projectId: string }) {
  const [project, t] = await Promise.all([getProject(projectId), getTranslations("Projects")]);
  if (!project) notFound();
  return <BackLink href={`/dashboard/projects/${projectId}`} label={t("backToContent", { name: project.name })} />;
}
