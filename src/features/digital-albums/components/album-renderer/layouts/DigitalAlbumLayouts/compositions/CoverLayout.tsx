import type { Parts } from "../types";
import styles from "../DigitalAlbumCompositions.module.css";

export default function CoverLayout({
  photo,
  text,
}: Parts) {
  return (
    <>
      {photo(
        0,
        false,
      )}

      <div
        className={
          styles.coverShade
        }
      />

      <div
        data-album-text-area
        className={
          styles.coverText
        }
      >
        {text(
          "date"
        )}

        {text(
          "title"
        )}

        {text(
          "subtitle"
        )}
      </div>
    </>
  );
}
