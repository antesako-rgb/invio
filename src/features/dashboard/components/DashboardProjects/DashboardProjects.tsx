import { ArrowRight, CalendarDays, BookOpen, Plus } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state/EmptyState";
import type { Project } from "@/features/projects/types/project.types";
import { formatProjectEventDate } from "@/features/projects/utils/projectEventDisplay.utils";
import { getDashboardProducts } from "../../repositories/getDashboardProducts";
import ProjectProductCards from "@/features/projects/components/ProjectProductCards/ProjectProductCards";
import styles from "./DashboardProjects.module.css";

export default async function DashboardProjects({ projects, limit = 3 }: { projects: Project[]; limit?: number | null }) {
  const [t, locale] = await Promise.all([getTranslations("Projects.dashboard"), getLocale()]);
  const visible = limit === null ? projects : projects.slice(0, limit);
  const products = await getDashboardProducts(visible.map(project => project.id));
  return <section className={styles.section}>
    <div className={styles.header}>
      <div><h2 className={styles.title}>{t("title")}</h2><p className={styles.description}>{t("description")}</p></div>
      <div className={styles.actions}>
        <ButtonLink href="/dashboard/projects/new/event"><Plus aria-hidden="true" />{t("newEvent")}</ButtonLink>
      </div>
    </div>
    {projects.length === 0 && <EmptyState variant="card" icon={BookOpen} title={t("emptyTitle")} description={t("emptyDescription")} />}
    <div className={styles.list}>
      {visible.map(project => {
        const base = `/dashboard/projects/${project.id}`;
        return <article key={project.id} className={styles.card}>
          <div className={styles.content}>
              <h3 className={styles.eventName}><CalendarDays aria-hidden="true" /><span>{project.name}</span></h3>
              <p className={styles.meta}>{formatProjectEventDate(project.start_date, locale)}{project.location_name && ` \u00b7 ${project.location_name}`}</p>
          </div>
          <div className={styles.cardAction}>
            <ButtonLink href={base} variant="secondary">{t("open")}<ArrowRight aria-hidden="true" /></ButtonLink>
          </div>
          <div className={styles.products}>
            <ProjectProductCards projectId={project.id} products={products} compact />
          </div>
        </article>;
      })}
    </div>
    {limit !== null && projects.length > limit && <div className={styles.footer}><ButtonLink href="/dashboard/projects" variant="ghost">{t("all")}</ButtonLink></div>}
  </section>;
}
