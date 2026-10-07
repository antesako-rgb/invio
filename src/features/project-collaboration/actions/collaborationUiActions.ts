"use server";

import {
  z,
} from "zod";

import type { ActionResult } from "@/lib/actions/actionResult";
import type { InviteProjectCollaboratorResult } from "../types/projectCollaboration.types";

import {
  createServerClient,
} from "@/lib/supabase/server";

import {
  getProject,
} from "@/features/projects/repositories/getProject";

import { inviteProjectCollaboratorAction } from "./inviteProjectCollaboratorAction";

import { acceptProjectCollaborationAction } from "./acceptProjectCollaborationAction";

import { declineProjectCollaborationAction } from "./declineProjectCollaborationAction";

/* ==========================================================================
   Server Action
========================================================================== */

export async function createCollaborationLink(
  projectId:
    string,

  email:
    string
): Promise<ActionResult<InviteProjectCollaboratorResult>> {
  const input = z.object(
    {
      projectId:
        z.string().uuid(),

      email:
        z.string().trim().email().max(320),
    }
  ).safeParse(
    {
      projectId,

      email,
    }
  );
  if (!input.success)
    return {
      success:
        false as const,

      code:
        "INVALID_INPUT" as const,
    };
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const project = await getProject(
      input.data.projectId
    );
    if (!user || project?.owner_id !== user.id)
      return {
        success:
          false as const,

        code:
          "FORBIDDEN" as const,
      };
    const result = await inviteProjectCollaboratorAction(
      {
        p_project_id:
          project.id,

        p_email:
          input.data.email.toLowerCase(),
      }
    );
    return result;
  } catch {
    return {
      success:
        false as const,

      code:
        "COLLABORATION_FAILED" as const,
    };
  }
}
/* ==========================================================================
   Server Action
========================================================================== */

export async function respondToCollaborationInvite(
  token:
    string,

  response:
    "accept" | "decline"
): Promise<ActionResult<string>> {
  if (!z.string().trim().min(
    1
  ).max(
    2048
  ).safeParse(
    token
  ).success || !["accept", "decline"].includes(
    response
  )) {
    return {
      success:
        false as const,

      code:
        "COLLABORATION_FAILED" as const,
    };
  }
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user)
      return {
        success:
          false as const,

        code:
          "FORBIDDEN" as const,
      };
    // Recipient identity, expiry and single-use checks remain in the existing RPC.
    const projectId = response === "accept"
      ? await acceptProjectCollaborationAction(
        {
          p_token:
            token.trim(),
        }
      )
      : await declineProjectCollaborationAction(
        {
          p_token:
            token.trim(),
        }
      );
    return projectId;
  } catch {
    return {
      success:
        false as const,

      code:
        "COLLABORATION_FAILED" as const,
    };
  }
}
