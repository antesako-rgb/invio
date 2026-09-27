import type { Parts } from "../types";
import styles from "../DigitalAlbumCompositions.module.css";

export default function ClosingLayout({
  text,
}: Parts) {
  return (
    <div
      data-album-text-area
      className={
        styles.closingBlock
      }
    >
      <span
        className={
          styles.rule
        }
      />

      {text(
        "title"
      )}

      {text(
        "text"
      )}

      {text(
        "date"
      )}
    </div>
  );
}
