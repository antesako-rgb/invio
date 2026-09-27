import PhotoWallMaterialQrCode from "../../../../components/PhotoWallMaterialQrCode/PhotoWallMaterialQrCode";
import MaterialText from "../../../../../renderer/components/MaterialText";
import type { PhotoWallMaterialTemplateProps } from "../../../../../types/photoWallMaterialTemplate.types";
import styles from "./GardenGraceMaterialCard.module.css";

export default function GardenGraceMaterialCard({ data }: PhotoWallMaterialTemplateProps) {
  const { content, presentation, display } = data;
  const text = (field: Parameters<typeof MaterialText>[0]["field"], value: string | null, className: string) =>
    value ? <MaterialText field={field} presentation={presentation} className={className}>{value}</MaterialText> : null;
  return (
    <article className={styles.card}>
      <div className={styles.frame} aria-hidden="true" />
      <div className={styles.top} data-material-region>
        <div className={styles.ornament} aria-hidden="true">✧</div>
        {text("hero.title", content.hero.title, styles.title)}
        {text("hero.subtitle", content.hero.subtitle, styles.subtitle)}
        {text("description", content.description, styles.description)}
      </div>
      <div className={styles.qr}><PhotoWallMaterialQrCode value={data.photoWallUrl} /></div>
      <div className={styles.bottom} data-material-region>
        <div className={styles.names}>
          {text("hero.primary_name", content.hero.primary_name, styles.name)}
          {content.hero.primary_name && content.hero.secondary_name && <span className={styles.ampersand}>&amp;</span>}
          {text("hero.secondary_name", content.hero.secondary_name, styles.name)}
        </div>
        {text("date.start_date", display.date.formatted, styles.date)}
      </div>
    </article>
  );
}
