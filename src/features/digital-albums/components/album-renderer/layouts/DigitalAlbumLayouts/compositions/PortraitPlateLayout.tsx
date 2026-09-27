import type { Parts } from "../types";
import styles from "../DigitalAlbumCompositions.module.css";

export default function PortraitPlateLayout({
  photo,
}: Parts) {
  return (
    <div
      className={
        styles.portraitPlate
      }
    >
      {photo(
        0
      )}
    </div>
  );
}
