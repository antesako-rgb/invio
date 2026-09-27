import type { Parts } from "../types";
import styles from "../DigitalAlbumCompositions.module.css";

export default function PortraitPairTextLayout({ photo, text }: Parts) {
  return (<div className={styles.pairText}><div className={styles.copy} data-album-text-area>{text("title")}{text("subtitle")}</div><div className={styles.pair}>{photo(0)}{photo(1)}</div></div>);
}
