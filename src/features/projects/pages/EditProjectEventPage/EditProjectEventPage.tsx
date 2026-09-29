"use client";

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
  updateProjectEventAction,
} from "../../actions/updateProjectEventAction";

import ProjectEventForm
  from "../../components/ProjectEventForm/ProjectEventForm";

import type {
  ProjectEvent,
} from "../../types/projectEvent.types";

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
    ProjectEvent;
}


/* ==========================================================================
   Edit ProjectEvent Page
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
     Update ProjectEvent
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
      await updateProjectEventAction(
        payload
      );

    if (!result.success) {
      throw new Error(
        result.message
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