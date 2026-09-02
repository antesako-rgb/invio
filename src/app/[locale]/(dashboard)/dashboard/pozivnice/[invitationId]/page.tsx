import InvitationManagementPage
  from "@/features/invitations/pages/InvitationManagementPage/InvitationManagementPage";


/* ==========================================================================
   Types
========================================================================== */

interface PageProps {
  params:
    Promise<{
      invitationId:
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
    invitationId,
  } =
    await params;


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <InvitationManagementPage
      invitationId={
        invitationId
      }
    />
  );
}