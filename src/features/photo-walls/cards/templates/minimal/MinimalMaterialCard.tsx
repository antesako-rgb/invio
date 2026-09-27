import PhotoWallMaterialQrCode from "../../components/PhotoWallMaterialQrCode/PhotoWallMaterialQrCode";
import MaterialText from "../../../renderer/components/MaterialText";
import type { PhotoWallMaterialTemplateProps } from "../../../types/photoWallMaterialTemplate.types";
import styles from "./MinimalMaterialCard.module.css";

export default function MinimalMaterialCard({ data }: PhotoWallMaterialTemplateProps) {
  const { content, presentation, display } = data;
  return (
    <article className={styles.card}>
      <div className={styles.heading} data-material-region>
        <span className={styles.mark} aria-hidden="true" />
        <MaterialText field="hero.title" presentation={presentation} className={styles.title}>{content.hero.title}</MaterialText>
      </div>
      <div className={styles.qr}><PhotoWallMaterialQrCode value={data.photoWallUrl} /></div>
      <div className={styles.footer} data-material-region>
        <MaterialText field="description" presentation={presentation} className={styles.description}>{content.description}</MaterialText>
        <div className={styles.rule} aria-hidden="true" />
        <div className={styles.names}>
          <MaterialText field="hero.primary_name" presentation={presentation} className={styles.name}>{content.hero.primary_name}</MaterialText>
          {content.hero.primary_name && content.hero.secondary_name && <span>&amp;</span>}
          <MaterialText field="hero.secondary_name" presentation={presentation} className={styles.name}>{content.hero.secondary_name}</MaterialText>
        </div>
        <div className={styles.date}>
          <MaterialText field="date.start_date" presentation={presentation}>{display.date.formatted}</MaterialText>
          {display.date.hasDate && display.time.hasTime && <span>·</span>}
          <MaterialText field="time.start_time" presentation={presentation}>{display.time.text}</MaterialText>
        </div>
      </div>
    </article>
  );
}
