import PhotoWallPhotosManagement
  from "@/features/invitations/components/photo-wall-management/PhotoWallPhotosManagement/PhotoWallPhotosManagement";

import {
  getPhotoWallPhotosPage,
} from "@/features/invitations/repositories/photo-wall/getPhotoWallPhotosPage";

import type {
  EventExperience,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Types
========================================================================== */

interface PhotoWallManagementProps {
  experience:
    EventExperience;
}


/* ==========================================================================
   Photo Wall Management
========================================================================== */

export default async function PhotoWallManagement({
  experience,
}: PhotoWallManagementProps) {
  /* ==========================================================================
     Photos
  ========================================================================== */

  const photosPage =
    await getPhotoWallPhotosPage({
      invitationId:
        experience.id,
    });


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <PhotoWallPhotosManagement
      invitationId={
        experience.id
      }
      photosPage={
        photosPage
      }
    />
  );
}