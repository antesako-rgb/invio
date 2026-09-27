import type { Parts } from "../types";
import styles from "../DigitalAlbumCompositions.module.css";

export default function LandscapePlateLayout({
  photo,
}: Parts) {
  return (
    <div
      className={
        styles.landscapePlate
      }
    >
      {photo(
        0
      )}
    </div>
  );
}
