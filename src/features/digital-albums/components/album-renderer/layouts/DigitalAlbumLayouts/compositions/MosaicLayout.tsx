import type { Parts } from "../types";
import styles from "../DigitalAlbumCompositions.module.css";

export default function MosaicLayout({ photo }: Parts) {
  return (<div className={styles.mosaic}>{[0, 1, 2, 3, 4].map((index) => <div key={index} className={index === 0 ? styles.lead : undefined}>{photo(index, false)}</div>)}</div>);
}
