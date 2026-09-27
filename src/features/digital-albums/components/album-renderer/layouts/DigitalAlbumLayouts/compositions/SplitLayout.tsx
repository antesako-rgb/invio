import type { Parts } from "../types";
import styles from "../DigitalAlbumCompositions.module.css";

export default function SplitLayout({ photo, text }: Parts) {
  return (<div className={styles.split}><div>{photo(0)}</div><div className={styles.copy} data-album-text-area>{text("title")}{text("text")}</div></div>);
}
