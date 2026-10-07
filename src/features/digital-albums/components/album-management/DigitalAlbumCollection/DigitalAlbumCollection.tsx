import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge/badge";
import { ButtonLink } from "@/components/ui/button-link";
import type { DigitalAlbum } from "../../../types/digitalAlbum.types";
import styles from "./DigitalAlbumCollection.module.css";
export default async function DigitalAlbumCollection({ albums }: { albums: Pick<DigitalAlbum, "id" | "name" | "is_public">[] }) {
 const t = await getTranslations("Projects.products");
 return <>
   {!albums.length && <Card className={styles.card}><p>{t("noAlbums")}</p></Card>}
   <div className={styles.grid}>{albums.map(album => <Card key={album.id} className={styles.card}>
     <h2>{album.name}</h2><div><Badge variant={album.is_public ? "success" : "muted"}>{t(album.is_public ? "published" : "draft")}</Badge></div>
     <ButtonLink variant="secondary" href={`/dashboard/albums/${album.id}`}>{t("manageAlbum")}</ButtonLink>
   </Card>)}</div>
 </>;
}
