import {
  notFound,
} from "next/navigation";

import {
  getProjectEvent,
} from "@/features/projects/repositories/getProjectEvent";

import EditProjectEventPage from "@/features/projects/pages/EditProjectEventPage/EditProjectEventPage";


/* ==========================================================================
   Types
========================================================================== */

interface EditEventRouteProps {
  params:
    Promise<{
      projectId: string;
    }>;
}


/* ==========================================================================
   Edit Event Route
========================================================================== */

export default async function EditEventRoute({
  params,
}: EditEventRouteProps) {
  const {
    projectId,
  } =
    await params;


  /* ==========================================================================
     Event
  ========================================================================== */

  const event =
    await getProjectEvent(
      projectId
    );

  if (!event) {
    notFound();
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <EditProjectEventPage
      event={event}
    />
  );
}