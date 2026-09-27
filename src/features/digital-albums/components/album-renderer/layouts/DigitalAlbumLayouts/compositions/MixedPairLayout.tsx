import type { Parts } from "../types";
import styles from "../DigitalAlbumCompositions.module.css";

export default function MixedPairLayout({
  photo,
}: Parts) {
  return (
    <>
      <div
        className={
          styles.mixedPortrait
        }
      >
        {photo(
          0
        )}
      </div>

      <div
        className={
          styles.mixedLandscape
        }
      >
        {photo(
          1
        )}
      </div>
    </>
  );
}
