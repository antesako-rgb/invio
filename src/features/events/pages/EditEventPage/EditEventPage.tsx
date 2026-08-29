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
  updateEventAction,
} from "../../actions/updateEventAction";

import EventForm
  from "../../components/EventForm/EventForm";

import type {
  Event,
} from "../../types/event.types";

import {
  buildUpdateEventPayload,
} from "../../utils/eventForm.utils";

import type {
  EventFormValues,
} from "../../validation/event.schema";

import styles from "./EditEventPage.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface EditEventPageProps {
  event:
    Event;
}


/* ==========================================================================
   Edit Event Page
========================================================================== */

export default function EditEventPage({
  event,
}: EditEventPageProps) {
  const router =
    useRouter();

  const t =
    useTranslations(
      "Events.edit"
    );


  /* ==========================================================================
     Update Event
  ========================================================================== */

  async function handleSubmit(
    values: EventFormValues
  ) {
    const payload =
      buildUpdateEventPayload(
        event.id,
        values
      );

    const result =
      await updateEventAction(
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
      `/dashboard/dogadaji/${event.id}`
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
          `/dashboard/dogadaji/${event.id}`
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

      <EventForm
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