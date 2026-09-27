import type { Parts } from "../types";
import styles from "../DigitalAlbumCompositions.module.css";

export default function FourGridLayout({ photo }: Parts) {
  return (<div className={styles.fourGrid}>{[0, 1, 2, 3].map((index) => <div key={index}>{photo(index)}</div>)}</div>);
}
