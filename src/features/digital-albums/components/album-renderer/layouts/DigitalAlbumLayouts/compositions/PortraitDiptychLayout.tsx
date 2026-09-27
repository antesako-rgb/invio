import type { Parts } from "../types";
import styles from "../DigitalAlbumCompositions.module.css";

export default function PortraitDiptychLayout({
  photo,
}: Parts) {
  return (
    <div
      className={
        styles.diptych
      }
    >
      {photo(
        0
      )}

      {photo(
        1
      )}
    </div>
  );
}
