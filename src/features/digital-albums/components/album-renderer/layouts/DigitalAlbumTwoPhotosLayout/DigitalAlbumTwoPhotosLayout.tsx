import Image
  from "next/image";

import DigitalAlbumPhotoSlot
  from "@/features/digital-albums/components/album-renderer/DigitalAlbumPhotoSlot/DigitalAlbumPhotoSlot";

import styles
  from "./DigitalAlbumTwoPhotosLayout.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumTwoPhotosLayoutPhoto {
  imageUrl:
    string;

  alt?:
    string;

  description?:
    string | null;
}

interface DigitalAlbumTwoPhotosLayoutProps {
  firstPhotoSlotId:
    string;

  secondPhotoSlotId:
    string;

  firstPhoto:
    DigitalAlbumTwoPhotosLayoutPhoto | null;

  secondPhoto:
    DigitalAlbumTwoPhotosLayoutPhoto | null;

  activePhotoSlotId?:
    string | null;

  editable?:
    boolean;

  onSelectPhotoSlot?:
    (
      photoSlotId:
        string
    ) => void;
}


/* ==========================================================================
   Digital Album Two Photos Layout
========================================================================== */

export default function DigitalAlbumTwoPhotosLayout({
  firstPhotoSlotId,
  secondPhotoSlotId,
  firstPhoto,
  secondPhoto,
  activePhotoSlotId,
  editable = false,
  onSelectPhotoSlot,
}: DigitalAlbumTwoPhotosLayoutProps) {
  return (
    <div
      className={
        styles.root
      }
    >
      <div
        className={
          styles.photo
        }
      >
        <DigitalAlbumPhotoSlot
          slotId={
            firstPhotoSlotId
          }
          active={
            firstPhotoSlotId ===
            activePhotoSlotId
          }
          editable={
            editable
          }
          empty={
            !firstPhoto
          }
          onSelect={
            onSelectPhotoSlot
          }
        >
          {firstPhoto && (
            <>
              <Image
                src={
                  firstPhoto.imageUrl
                }
                alt={
                  firstPhoto.alt ??
                  ""
                }
                fill
                sizes="480px"
                className={
                  styles.image
                }
              />

              {firstPhoto.description && (
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
                    {
                      firstPhoto.description
                    }
                  </p>
                </div>
              )}
            </>
          )}
        </DigitalAlbumPhotoSlot>
      </div>

      <div
        className={
          styles.photo
        }
      >
        <DigitalAlbumPhotoSlot
          slotId={
            secondPhotoSlotId
          }
          active={
            secondPhotoSlotId ===
            activePhotoSlotId
          }
          editable={
            editable
          }
          empty={
            !secondPhoto
          }
          onSelect={
            onSelectPhotoSlot
          }
        >
          {secondPhoto && (
            <>
              <Image
                src={
                  secondPhoto.imageUrl
                }
                alt={
                  secondPhoto.alt ??
                  ""
                }
                fill
                sizes="480px"
                className={
                  styles.image
                }
              />

              {secondPhoto.description && (
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
                    {
                      secondPhoto.description
                    }
                  </p>
                </div>
              )}
            </>
          )}
        </DigitalAlbumPhotoSlot>
      </div>
    </div>
  );
}