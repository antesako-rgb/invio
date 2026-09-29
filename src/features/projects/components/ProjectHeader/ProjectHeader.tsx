import { CalendarDays, MapPin, Pencil, UsersRound, Settings } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import BackLink from "@/components/ui/back-link/BackLink";
import { ButtonLink } from "@/components/ui/button-link";
import type { ProjectWithEventDetails } from "../../types/project.types";
import { formatProjectEventDate } from "@/features/projects/utils/projectEventDisplay.utils";
import styles from "./ProjectHeader.module.css";

export default async function ProjectHeader({ project, isOwner }: { project: ProjectWithEventDetails; isOwner: boolean }) {
  const [t, locale] = await Promise.all([getTranslations("Projects"), getLocale()]);
  const details = project.project_event_details;
  const base = `/dashboard/projects/${project.id}`;
  return <header className={styles.header}>
    <BackLink href="/dashboard/projects" label={t("allContent")} />
    <div className={styles.main}>
      <div className={styles.content}>
        <h1 className={styles.title}>{project.name}</h1>
        {details && <div className={styles.meta}>
          <span><CalendarDays aria-hidden="true" />{formatProjectEventDate(details.start_date, locale)}{details.start_time && ` \u00b7 ${details.start_time.slice(0, 5)}`}</span>
          {details.location_name && <span><MapPin aria-hidden="true" />{details.location_name}</span>}
        </div>}
      </div>
      <div className={styles.actions}>
        {details && isOwner && <ButtonLink href={`${base}/event`} variant="outline"><Pencil aria-hidden="true" />{t("editEvent")}</ButtonLink>}
        <ButtonLink href={`${base}/collaborators`} variant="outline"><UsersRound aria-hidden="true" />{t("navigation.collaborators")}</ButtonLink>
        {isOwner && <ButtonLink href={`${base}/settings`} variant="ghost"><Settings aria-hidden="true" />{t("navigation.settings")}</ButtonLink>}
      </div>
    </div>
  </header>;
}
