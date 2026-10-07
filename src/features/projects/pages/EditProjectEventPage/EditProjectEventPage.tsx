"use client";
import { ActionFailure } from "@/lib/actions/ActionFailure";

import {
  useRouter,
} from "@/i18n/navigation";
import {
  useTranslations,
} from "next-intl";

import {
  toast,
} from "sonner";

import PageHeader
  from "@/components/ui/page-header/PageHeader";

import {
  updateProjectAction,
} from "../../actions/updateProjectAction";

import ProjectEventForm
  from "../../components/ProjectEventForm/ProjectEventForm";

import type {
  Project,
} from "../../types/project.types";

import {
  buildUpdateProjectEventPayload,
} from "../../utils/projectEventForm.utils";

import type {
  ProjectEventFormValues,
} from "../../validation/projectEvent.schema";

import styles from "./EditProjectEventPage.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface EditProjectEventPageProps {
  event:
    Project;
}


/* ==========================================================================
   Edit Project Page
========================================================================== */

export default function EditProjectEventPage({
  event,
}: EditProjectEventPageProps) {
  const router =
    useRouter();

  const t =
    useTranslations(
      "Projects.eventDetails.edit"
    );


  /* ==========================================================================
     Update Project
  ========================================================================== */

  async function handleSubmit(
    values: ProjectEventFormValues
  ) {
    const payload =
      buildUpdateProjectEventPayload(
        event.id,
        values
      );

    const result =
      await updateProjectAction(
        payload
      );

    if (!result.success) {
      throw new ActionFailure(
        result.code
      );
    }

    toast.success(
      t(
        "success"
      )
    );

    router.push(
      `/dashboard/projects/${event.id}`
    );

    router.refresh();
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={
        styles.page
      }
    >
      <PageHeader
        backHref={
          `/dashboard/projects/${event.id}`
        }
        backLabel={
          t(
            "backToEvent"
          )
        }
        title={
          t(
            "title"
          )
        }
        description={
          t(
            "description"
          )
        }
      />

      <ProjectEventForm
        event={
          event
        }
        onSubmit={
          handleSubmit
        }
      />
    </div>
  );
}