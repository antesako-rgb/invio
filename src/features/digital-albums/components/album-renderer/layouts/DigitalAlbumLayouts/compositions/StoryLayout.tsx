import type { Parts } from "../types";
import styles from "../DigitalAlbumCompositions.module.css";

export default function StoryLayout({
  text,
}: Parts) {
  return (
    <>
      <div
        data-album-text-area
        className={
          styles.chapterHeading
        }
      >
        {text(
          "subtitle"
        )}

        {text(
          "title"
        )}

        <span
          className={
            styles.rule
          }
        />

        {text(
          "date"
        )}
      </div>

      <div
        data-album-text-area
        className={
          styles.chapterNote
        }
      >
        {text(
          "text"
        )}
      </div>
    </>
  );
}
