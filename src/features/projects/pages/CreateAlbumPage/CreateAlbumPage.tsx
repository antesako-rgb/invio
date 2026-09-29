import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container/Container";
import Page from "@/components/layout/PageContainer/Page";
import PageHeader from "@/components/ui/page-header/PageHeader";
import CreateAlbumForm from "../../components/CreateAlbumForm/CreateAlbumForm";

export default async function CreateAlbumPage({ projectId }: { projectId?: string }) {
  const t = await getTranslations("Projects.create");
  return <Container><Page>
    <PageHeader title={t("createAlbum")} description={t("albumDescription")} backHref={projectId ? `/dashboard/projects/${projectId}` : "/dashboard/projects/new"} backLabel={t("back")} />
    <CreateAlbumForm projectId={projectId} />
  </Page></Container>;
}
