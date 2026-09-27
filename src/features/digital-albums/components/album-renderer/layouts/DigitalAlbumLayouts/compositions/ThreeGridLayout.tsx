import type { Parts } from "../types";
import styles from "../DigitalAlbumCompositions.module.css";

export default function ThreeGridLayout({ photo }: Parts) {
  return (<div className={styles.threeGrid}><div className={styles.wide}>{photo(0)}</div><div>{photo(1)}</div><div>{photo(2)}</div></div>);
}
