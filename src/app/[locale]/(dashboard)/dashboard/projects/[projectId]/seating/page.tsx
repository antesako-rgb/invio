import { getTranslations } from "next-intl/server";
import ProjectWorkspacePage from "@/features/projects/pages/ProjectWorkspacePage/ProjectWorkspacePage";
import { EmptyState } from "@/components/ui/empty-state/EmptyState";
import { Armchair } from "lucide-react";
export default async function Page({ params }: { params: Promise<{ projectId: string }> }) {
 const { projectId } = await params; const t = await getTranslations("Projects.products");
 return <ProjectWorkspacePage projectId={projectId}><EmptyState variant="card" icon={Armchair} title={t("seating")} description={t("seatingHint")} /></ProjectWorkspacePage>;
}
