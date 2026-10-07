import { CalendarDays, MapPin, Pencil, Settings } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import BackLink from "@/components/ui/back-link/BackLink";
import { ButtonLink } from "@/components/ui/button-link";
import type { Project } from "../../types/project.types";
import { formatProjectEventDate } from "@/features/projects/utils/projectEventDisplay.utils";
import styles from "./ProjectHeader.module.css";

export default async function ProjectHeader({ project, isOwner }: { project: Project; isOwner: boolean }) {
  const [t, locale] = await Promise.all([getTranslations("Projects"), getLocale()]);
  const base = `/dashboard/projects/${project.id}`;
  return <header className={styles.header}>
    <BackLink href="/dashboard/projects" label={t("allContent")} />
    <div className={styles.main}>
      <div className={styles.content}>
        <h1 className={styles.title}>{project.name}</h1>
        <div className={styles.meta}>
          <span><CalendarDays aria-hidden="true" />{formatProjectEventDate(project.start_date, locale)}{project.start_time && ` \u00b7 ${project.start_time.slice(0, 5)}`}</span>
          {project.location_name && <span><MapPin aria-hidden="true" />{project.location_name}</span>}
        </div>
      </div>
      <div className={styles.actions}>
        {isOwner && <ButtonLink href={`${base}/event`} variant="secondary" size="sm"><Pencil aria-hidden="true" />{t("editEvent")}</ButtonLink>}
        {isOwner && <ButtonLink href={`${base}/settings`} variant="outline" size="sm"><Settings aria-hidden="true" />{t("navigation.settings")}</ButtonLink>}
      </div>
    </div>
  </header>;
}
