import type { Parts } from "../types";
import styles from "../DigitalAlbumCompositions.module.css";

export default function TwoPhotosLayout({
  photo,
}: Parts) {
  return (
    <div
      className={
        styles.stack
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
