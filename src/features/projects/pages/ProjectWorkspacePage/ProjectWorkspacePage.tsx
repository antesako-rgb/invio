import { notFound } from "next/navigation";
import Container from "@/components/layout/Container/Container";
import Page from "@/components/layout/PageContainer/Page";
import ProjectHeader from "../../components/ProjectHeader/ProjectHeader";
import ProjectProducts from "../../components/ProjectProducts/ProjectProducts";
import { getProjectWorkspaceData } from "../../repositories/getProjectWorkspaceData";

export default async function ProjectWorkspacePage({ projectId }: { projectId: string }) {
  const data = await getProjectWorkspaceData(projectId);
  if (!data) notFound();
  return <Container><Page>
    <ProjectHeader project={data.project} isOwner={data.isOwner} />
    <ProjectProducts {...data} />
  </Page></Container>;
}
