import { BookOpen, Images, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge/badge";
import type { ProjectWithEventDetails } from "../../types/project.types";
import type { PhotoWall } from "@/features/photo-walls/types/photoWall.types";
import type { DigitalAlbum } from "@/features/digital-albums/types/digitalAlbum.types";
import CreatePhotoWallButton from "../CreatePhotoWallButton/CreatePhotoWallButton";
import InvitationProjectCard from "@/features/invitations/components/InvitationProjectCard/InvitationProjectCard";
import styles from "./ProjectProducts.module.css";

export default async function ProjectProducts({ project, photoWall, digitalAlbums, isOwner }: {
  project: ProjectWithEventDetails; photoWall: PhotoWall | null; digitalAlbums: DigitalAlbum[]; isOwner: boolean;
}) {
  const t = await getTranslations("Projects.products");
  const base = `/dashboard/projects/${project.id}`;
  return <div className={styles.sections}>
    <InvitationProjectCard projectId={project.id} isEvent={Boolean(project.project_event_details)} isOwner={isOwner} />
    {(project.project_event_details || photoWall) && <section className={styles.section}>
      <div className={styles.heading}><h2><Images aria-hidden="true" />{t("photoWall")}</h2></div>
      <p>{t("wallDescription")}</p>
      {photoWall ? <ButtonLink href={`${base}/photo-wall`} variant="outline">{t("openWall")}</ButtonLink>
        : isOwner ? <CreatePhotoWallButton projectId={project.id} /> : <p>{t("noWall")}</p>}
    </section>}
    <section id="albums" className={styles.section}>
      <div className={styles.heading}>
        <h2><BookOpen aria-hidden="true" />{t("albums")}</h2>
        {isOwner && <ButtonLink href={`${base}/albums/new`}><Plus aria-hidden="true" />{t("newAlbum")}</ButtonLink>}
      </div>
      {digitalAlbums.length === 0 ? <p>{t("noAlbums")}</p> : <div className={styles.albums}>
        {digitalAlbums.map(album => <article key={album.id} className={styles.album}>
          <div className={styles.albumHeading}><h3>{album.name}</h3><Badge variant={album.is_public ? "success" : "muted"}>{t(album.is_public ? "published" : "draft")}</Badge></div>
          <div className={styles.actions}>
            <ButtonLink href={`/editor/album/${album.id}/uredi`} variant="outline">{t("editAlbum")}</ButtonLink>
            <ButtonLink href={`${base}/albums/${album.id}`} variant="ghost">{t("manageAlbum")}</ButtonLink>
          </div>
        </article>)}
      </div>}
    </section>
  </div>;
}
