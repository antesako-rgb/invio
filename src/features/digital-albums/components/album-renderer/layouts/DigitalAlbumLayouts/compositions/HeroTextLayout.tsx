import type { Parts } from "../types";
import styles from "../DigitalAlbumCompositions.module.css";

export default function HeroTextLayout({ photo, text }: Parts) {
  return (<div className={styles.heroText}><div>{photo(0, false)}</div><div className={styles.copy} data-album-text-area>{text("title")}{text("text")}</div></div>);
}
