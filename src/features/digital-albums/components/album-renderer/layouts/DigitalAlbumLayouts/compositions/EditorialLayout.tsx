import type { Parts } from "../types";
import styles from "../DigitalAlbumCompositions.module.css";

export default function EditorialLayout({
  photo,
  text,
}: Parts) {
  return (
    <>
      {text(
        "title"
      )}

      <div
        className={
          styles.essayPhoto
        }
      >
        {photo(
          0,
          false,
        )}
      </div>

      <div
        data-album-text-area
        className={
          styles.essayText
        }
      >
        {text(
          "text"
        )}
      </div>
    </>
  );
}
