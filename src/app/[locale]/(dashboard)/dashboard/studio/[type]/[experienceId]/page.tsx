import EventExperienceManagementPage
  from "@/features/invitations/pages/EventExperienceManagementPage/EventExperienceManagementPage";

import type {
  EventExperienceType,
} from "@/features/invitations/types/eventExperience.types";


/* ==========================================================================
   Types
========================================================================== */

interface PageProps {
  params:
    Promise<{
      type:
        EventExperienceType;

      experienceId:
        string;
    }>;
}


/* ==========================================================================
   Page
========================================================================== */

export default async function Page({
  params,
}: PageProps) {
  /* ==========================================================================
     Params
  ========================================================================== */

  const {
    type,
    experienceId,
  } =
    await params;


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <EventExperienceManagementPage
      type={
        type
      }
      experienceId={
        experienceId
      }
    />
  );
}