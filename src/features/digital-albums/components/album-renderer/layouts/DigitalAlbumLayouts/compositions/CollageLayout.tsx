import type { Parts } from "../types";
import styles from "../DigitalAlbumCompositions.module.css";

export default function CollageLayout({
  photo,
  text,
}: Parts) {
  return (
    <div
      className={
        styles.collageGrid
      }
    >
      <div
        className={
          styles.collageLead
        }
      >
        {photo(0)}
      </div>

      <div>
        {photo(1)}
      </div>

      <div>
        {photo(2)}
      </div>

      <div
        data-album-text-area
        className={
          styles.collageText
        }
      >
        {text(
          "subtitle"
        )}

        {text(
          "title"
        )}
      </div>
    </div>
  );
}
