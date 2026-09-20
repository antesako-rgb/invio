import Image
  from "next/image";

import styles
  from "./DigitalAlbumFullPhotoLayout.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumFullPhotoLayoutProps {
  imageUrl:
    string;

  alt?:
    string;

  description?:
    string | null;
}


/* ==========================================================================
   Digital Album Full Photo Layout
========================================================================== */

export default function DigitalAlbumFullPhotoLayout({
  imageUrl,
  alt = "",
  description,
}: DigitalAlbumFullPhotoLayoutProps) {
  return (
    <div
      className={
        styles.root
      }
    >
      <Image
        src={
          imageUrl
        }
        alt={
          alt
        }
        fill
        sizes="480px"
        className={
          styles.image
        }
      />

      {description && (
        <div
          className={
            styles.caption
          }
        >
          <p
            className={
              styles.description
            }
          >
            {description}
          </p>
        </div>
      )}
    </div>
  );
}