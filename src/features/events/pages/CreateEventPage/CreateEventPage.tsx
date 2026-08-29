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
  createEventAction,
} from "../../actions/createEventAction";

import EventForm
  from "../../components/EventForm/EventForm";

import {
  buildCreateEventPayload,
} from "../../utils/eventForm.utils";

import type {
  EventFormValues,
} from "../../validation/event.schema";

import styles from "./CreateEventPage.module.css";


/* ==========================================================================
   Create Event Page
========================================================================== */

export default function CreateEventPage() {
  const router =
    useRouter();

  const t =
    useTranslations(
      "Events.create"
    );


  /* ==========================================================================
     Create Event
  ========================================================================== */

  async function handleSubmit(
    values: EventFormValues
  ) {
    const payload =
      buildCreateEventPayload(
        values
      );

    const result =
      await createEventAction(
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
      `/dashboard/dogadaji/${result.data.id}`
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
        backHref="/dashboard/dogadaji"
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

      <EventForm
        onSubmit={
          handleSubmit
        }
      />
    </div>
  );
}