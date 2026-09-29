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
  createProjectEventAction,
} from "../../actions/createProjectEventAction";

import ProjectEventForm
  from "../../components/ProjectEventForm/ProjectEventForm";

import {
  buildCreateProjectEventPayload,
} from "../../utils/projectEventForm.utils";

import type {
  ProjectEventFormValues,
} from "../../validation/projectEvent.schema";

import styles from "./CreateProjectEventPage.module.css";


/* ==========================================================================
   Create ProjectEvent Page
========================================================================== */

export default function CreateProjectEventPage() {
  const router =
    useRouter();

  const t =
    useTranslations(
      "Projects.eventDetails.create"
    );


  /* ==========================================================================
     Create ProjectEvent
  ========================================================================== */

  async function handleSubmit(
    values: ProjectEventFormValues
  ) {
    const payload =
      buildCreateProjectEventPayload(
        values
      );

    const result =
      await createProjectEventAction(
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
      `/dashboard/projects/${result.data.id}`
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
        backHref="/dashboard/projects/new"
        backLabel={
          t(
            "backToEvents"
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
        onSubmit={
          handleSubmit
        }
      />
    </div>
  );
}