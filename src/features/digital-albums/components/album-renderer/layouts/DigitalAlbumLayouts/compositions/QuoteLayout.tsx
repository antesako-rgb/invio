import type { Parts } from "../types";
import styles from "../DigitalAlbumCompositions.module.css";

export default function QuoteLayout({
  text,
}: Parts) {
  return (
    <div
      data-album-text-area
      className={
        styles.quoteBlock
      }
    >
      <span
        className={
          styles.quoteMark
        }
        aria-hidden="true"
      >
        &#8220;
      </span>

      {text(
        "text"
      )}

      <span
        className={
          styles.rule
        }
      />

      {text(
        "subtitle"
      )}
    </div>
  );
}
