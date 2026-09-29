import { CalendarDays, BookOpen, Plus, Images, Mail } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state/EmptyState";
import type { ProjectWithEventDetails } from "@/features/projects/types/project.types";
import { formatProjectEventDate } from "@/features/projects/utils/projectEventDisplay.utils";
import { getDashboardProducts } from "../../repositories/getDashboardProducts";
import styles from "./DashboardProjects.module.css";

export default async function DashboardProjects({ projects, limit = 3 }: { projects: ProjectWithEventDetails[]; limit?: number | null }) {
  const [t, locale] = await Promise.all([getTranslations("Projects.dashboard"), getLocale()]);
  const visible = limit === null ? projects : projects.slice(0, limit);
  const products = await getDashboardProducts(visible.map(project => project.id));
  const albumGroups = new Map<string, typeof products.albums>();
  for (const album of products.albums) {
    const group = albumGroups.get(album.project_id) ?? [];
    group.push(album); albumGroups.set(album.project_id, group);
  }
  const invitations = new Map(products.invitations.map(invitation => [invitation.project_id, invitation]));
  const walls = new Map(products.walls.map(wall => [wall.project_id, wall]));
  return <section className={styles.section}>
    <div className={styles.header}>
      <div><h2 className={styles.title}>{t("title")}</h2><p className={styles.description}>{t("description")}</p></div>
      <ButtonLink href="/dashboard/projects/new"><Plus aria-hidden="true" />{t("create")}</ButtonLink>
    </div>
    {projects.length === 0 && <EmptyState variant="card" icon={BookOpen} title={t("emptyTitle")} description={t("emptyDescription")}
      action={<ButtonLink href="/dashboard/projects/new">{t("create")}</ButtonLink>} />}
    <div className={styles.list}>
      {visible.map(project => {
        const details = project.project_event_details;
        const albums = albumGroups.get(project.id) ?? [];
        const wall = walls.get(project.id);
        const invitation = invitations.get(project.id);
        const directAlbum = !details && !wall && !invitation && albums.length === 1 ? albums[0] : null;
        const base = `/dashboard/projects/${project.id}`;
        return <article key={project.id} className={styles.card}>
          <div className={styles.icon}>{details ? <CalendarDays aria-hidden="true" /> : <BookOpen aria-hidden="true" />}</div>
          <div className={styles.content}>
            <h3>{project.name}</h3>
            {details ? <p className={styles.meta}>{formatProjectEventDate(details.start_date, locale)}{details.location_name && ` \u00b7 ${details.location_name}`}</p>
              : <p className={styles.meta}>{t(albums.length ? "albumContent" : "emptyContent")}</p>}
            <div className={styles.products}>
              {invitation && <span><Mail aria-hidden="true" />{t("invitation")}</span>}
              {wall && <span><Images aria-hidden="true" />{t("photoWall")}</span>}
              {albums.length > 0 && <span><BookOpen aria-hidden="true" />{t("albumCount", { count: albums.length })}</span>}
              {!wall && !invitation && !albums.length && <span>{t("noProducts")}</span>}
            </div>
          </div>
          <div className={styles.actions}>
            <ButtonLink href={directAlbum ? `/editor/album/${directAlbum.id}/uredi` : base} variant="outline">{t(directAlbum ? "openAlbum" : "open")}</ButtonLink>
            {directAlbum && <ButtonLink href={base} variant="ghost">{t("manage")}</ButtonLink>}
          </div>
        </article>;
      })}
    </div>
    {limit !== null && projects.length > limit && <div className={styles.footer}><ButtonLink href="/dashboard/projects" variant="ghost">{t("all")}</ButtonLink></div>}
  </section>;
}
