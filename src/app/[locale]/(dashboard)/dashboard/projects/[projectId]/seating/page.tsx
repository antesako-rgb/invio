import { getTranslations } from "next-intl/server";
import ProjectWorkspacePage from "@/features/projects/pages/ProjectWorkspacePage/ProjectWorkspacePage";
import SeatingPlans from "@/features/seating/components/SeatingPlans";
import { getSeatingPlans } from "@/features/seating/repositories/getSeatingPlans";
import { getSeatingTemplates } from "@/features/seating/templates/getSeatingTemplates";
export default async function Page({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const t = await getTranslations("Seating");
  if (process.env.PROJECT_GUESTS_ENABLED !== "true")
    return <ProjectWorkspacePage projectId={projectId}><p>{t("disabled")}</p></ProjectWorkspacePage>;
  const [plans, templates] = await Promise.all([getSeatingPlans(projectId), getSeatingTemplates()]);
  return <ProjectWorkspacePage projectId={projectId}><SeatingPlans projectId={projectId} plans={plans} templates={templates.map(({ id, name }) => ({ id, name }))} /></ProjectWorkspacePage>;
}
