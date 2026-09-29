import { ImageIcon } from "lucide-react";
import { editorPhotoStyle } from "@/features/editor/utils/editorPhotoStyle";

import { getProjectPhotoUrl } from "@/features/project-photos/utils/getProjectPhotoUrl";
import type { InvitationDocumentPage } from "../../types/invitationDocument.types";
import type { InvitationRenderPhoto } from "../../types/invitationPhoto.types";

import styles from "./InvitationPhotos.module.css";

/* ==========================================================================
   Types
========================================================================== */

interface InvitationPhotosProps {
  decorative?: boolean;
  page: InvitationDocumentPage;
  photos: ReadonlyMap<string, InvitationRenderPhoto>;
  showPhotoPlaceholders?: boolean;
  className?: string;
}

/* ==========================================================================
   Invitation Photos
========================================================================== */

export default function InvitationPhotos({
  page,
  photos,
  showPhotoPlaceholders,
  className,
  decorative = false,
}: InvitationPhotosProps) {
  const photoClassName = [styles.photo, className].filter(Boolean).join(" ");

  return (
    <>
      {page.photos.map((slot) => {
        const photo = slot.photoId ? photos.get(slot.photoId) : null;

        if (photo) {
          return (
            <figure key={slot.id} className={photoClassName}>
              {/* Static assets use the same CDN URL primitive as other products. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                data-invitation-photo-slot={decorative ? undefined : slot.id}
                style={decorative ? undefined : editorPhotoStyle(slot)}
                src={getProjectPhotoUrl(photo.image_path)}
                alt={decorative ? "" : photo.description ?? ""}
                loading="lazy"
                decoding="async"
              />
            </figure>
          );
        }

        if (!showPhotoPlaceholders) {
          return null;
        }

        return (
          <figure key={slot.id} className={photoClassName}>
            <span className={styles.photoPlaceholder} aria-hidden="true">
              <ImageIcon />
            </span>
          </figure>
        );
      })}
    </>
  );
}
