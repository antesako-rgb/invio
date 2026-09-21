import Image
  from "next/image";

import DigitalAlbumPhotoSlot
  from "@/features/digital-albums/components/album-renderer/DigitalAlbumPhotoSlot/DigitalAlbumPhotoSlot";

import styles
  from "./DigitalAlbumFullPhotoLayout.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumFullPhotoLayoutProps {
  slotId:
    string;

  imageUrl?:
    string | null;

  alt?:
    string;

  description?:
    string | null;

  active?:
    boolean;

  editable?:
    boolean;

  onSelectPhotoSlot?:
    (
      slotId:
        string
    ) => void;
}


/* ==========================================================================
   Digital Album Full Photo Layout
========================================================================== */

export default function DigitalAlbumFullPhotoLayout({
  slotId,
  imageUrl,
  alt = "",
  description,
  active = false,
  editable = false,
  onSelectPhotoSlot,
}: DigitalAlbumFullPhotoLayoutProps) {
  return (
    <div
      className={
        styles.root
      }
    >
<DigitalAlbumPhotoSlot
  slotId={
    slotId
  }
  active={
    active
  }
  editable={
    editable
  }
  empty={
    !imageUrl
  }
  onSelect={
    onSelectPhotoSlot
  }
>
        {imageUrl && (
          <>
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
          </>
        )}
      </DigitalAlbumPhotoSlot>
    </div>
  );
}