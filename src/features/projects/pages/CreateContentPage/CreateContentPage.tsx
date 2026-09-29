import { BookOpen, CalendarDays } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container/Container";
import Page from "@/components/layout/PageContainer/Page";
import PageHeader from "@/components/ui/page-header/PageHeader";
import { Link } from "@/i18n/navigation";
import styles from "./CreateContentPage.module.css";

export default async function CreateContentPage() {
  const t = await getTranslations("Projects.create");
  return <Container><Page>
    <PageHeader title={t("title")} description={t("description")} backHref="/dashboard/projects" backLabel={t("back")} />
    <div className={styles.choices}>
      <Link href="/dashboard/projects/new/event" className={styles.choice}><CalendarDays aria-hidden="true" /><h2>{t("event")}</h2><p>{t("eventDescription")}</p></Link>
      <Link href="/dashboard/projects/new/album" className={styles.choice}><BookOpen aria-hidden="true" /><h2>{t("album")}</h2><p>{t("albumDescription")}</p></Link>
    </div>
  </Page></Container>;
}
