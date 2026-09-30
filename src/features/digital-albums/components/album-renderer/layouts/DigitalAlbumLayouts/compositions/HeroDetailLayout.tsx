import type { Parts } from "../types";
import styles from "../DigitalAlbumCompositions.module.css";

export default function HeroDetailLayout({
  photo,
}: Parts) {
  return (
    <>
      <div
        className={
          styles.hero
        }
      >
        {photo(0)}
      </div>

      <div
        className={
          styles.detail
        }
      >
        {photo(
          1
        )}
      </div>
    </>
  );
}
