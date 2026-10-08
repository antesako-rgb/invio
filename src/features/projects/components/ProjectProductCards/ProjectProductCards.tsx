import { Armchair, ArrowRight, BookOpen, Images, Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button-link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge/badge";
import CreateAlbumDialog from "../CreateAlbumDialog/CreateAlbumDialog";
import type { DashboardProducts } from "@/features/dashboard/repositories/getDashboardProducts";
import styles from "./ProjectProductCards.module.css";

export default async function ProjectProductCards({ projectId, products, compact = false, canCreateAlbum = false }: {
  projectId: string;
  products: DashboardProducts;
  compact?: boolean;
  canCreateAlbum?: boolean;
}) {
  const t = await getTranslations("Projects.products");
  const seatingEnabled = process.env.PROJECT_GUESTS_ENABLED === "true";
  const base = `/dashboard/projects/${projectId}`;
  const invitations = products.invitations.filter(item => item.project_id === projectId);
  const albums = products.albums.filter(item => item.project_id === projectId);
  const wall = products.walls.find(item => item.project_id === projectId);
  const entries = [
    { id: "invitations", icon: Mail, description: invitations.length ? "invitationDescription" : "invitationEmpty", status: invitations.length ? t("invitationCount", { count: invitations.length }) : t("noInvitations"),
      href: `${base}/invitations${invitations.length ? "" : "/templates"}`, action: invitations.length ? "manageInvitations" : "createInvitation" },
    { id: "photoWall", icon: Images, description: wall ? (wall.is_public ? "wallPublishedHint" : "wallDraftHint") : "wallDescription", status: wall ? t(wall.is_public ? "published" : "draft") : t("noWall"),
      href: wall ? `/dashboard/photo-walls/${wall.id}` : `${base}/photo-wall`, action: "openWall" },
    { id: "seating", icon: Armchair, description: "seatingHint", status: t(seatingEnabled ? "seatingAvailable" : "comingSoon"),
      href: `${base}/seating`, action: seatingEnabled ? "openSeating" : "comingSoon" },
    { id: "albums", icon: BookOpen, description: "albumDescription", status: albums.length ? t("albumCount", { count: albums.length }) : t("noAlbums"),
      href: `${base}/albums`, action: albums.length ? "manageAlbums" : "createAlbum" },
  ] as const;

  return <div className={compact ? styles.compact : styles.grid}>
    {entries.map(({ id, icon: Icon, description, status, href, action }) => compact ? (
      id === "seating" && !seatingEnabled ? <Button key={id} disabled variant="secondary" className={styles.quickLink}>
        <Icon aria-hidden="true" />
        <span><span className={styles.label}>{t(id)}</span><span className={styles.status}>{status}</span></span>
      </Button> : <ButtonLink key={id} href={href} variant="ghost" className={styles.quickLink}>
        <Icon aria-hidden="true" />
        <span><span className={styles.label}>{t(id)}</span><span className={styles.status}>{status}</span></span>
      </ButtonLink>
    ) : (
      <Card key={id} className={`${styles.card} ${id === "seating" && !seatingEnabled ? styles.disabled : ""}`}>
        <span className={styles.icon}><Icon aria-hidden="true" /></span>
        <div className={styles.heading}>
          <h2>{t(id)}</h2>
          <Badge dot variant={id === "seating" ? "warning" : id === "photoWall" && wall ? (wall.is_public ? "success" : "info") : "muted"}>{status}</Badge>
        </div>
        <p className={styles.description}>{t(description)}</p>
        {id === "albums" && albums.length > 0 && <p className={styles.status}>{t("publishedCount", { count: albums.filter(album => album.is_public).length })}</p>}
        <div className={styles.action}>
          {id === "seating" ? (
            <Button disabled variant="secondary" size="sm">{t(action)}</Button>
          ) : id === "albums" && albums.length === 0 && canCreateAlbum ? (
            <CreateAlbumDialog projectId={projectId}>{t("createAlbum")}<ArrowRight aria-hidden="true" /></CreateAlbumDialog>
          ) : (
            <ButtonLink href={href} size="sm" variant={action === "createInvitation" ? "default" : "secondary"}>{t(id === "albums" && !canCreateAlbum ? "manageAlbums" : action)}<ArrowRight aria-hidden="true" /></ButtonLink>
          )}
        </div>
      </Card>
    ))}
  </div>;
}
