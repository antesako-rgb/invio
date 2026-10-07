import {
  formatDateAsLocalDate,
  parseLocalDate,
} from "@/lib/utils/date";

import type {
  CreateProjectInput,
  Project,
  UpdateProjectInput,
} from "../types/project.types";

import { isProjectEventType } from "../types/projectEvent.types";

import {
  projectEventSchema,
  type ProjectEventFormValues,
} from "../validation/projectEvent.schema";


/* ==========================================================================
   Default Values
========================================================================== */

export function getProjectDefaultValues(): ProjectEventFormValues {
  return {
    name: "",
    type: "wedding",
    custom_type: "",
    start_date: new Date(),
    start_time: "",
    location_name: "",
    location_address: "",
  };
}


/* ==========================================================================
   Project → Form
========================================================================== */

export function getProjectFormValues(
  event: Project
): ProjectEventFormValues {
  if (!isProjectEventType(event.type)) {
    throw new Error("Unsupported project event type.");
  }

  return {
    name: event.name,
    type: event.type,

    custom_type:
      event.type === "other"
        ? event.custom_type ?? ""
        : "",

    start_date:
      parseLocalDate(
        event.start_date
      ),

    start_time:
      event.start_time ?? "",

    location_name:
      event.location_name ?? "",

    location_address:
      event.location_address ?? "",
  };
}


/* ==========================================================================
   Form Field
========================================================================== */

export function setProjectEventFormField<
  K extends keyof ProjectEventFormValues
>(
  current: ProjectEventFormValues,
  key: K,
  value: ProjectEventFormValues[K]
): ProjectEventFormValues {
  const next = {
    ...current,
    [key]: value,
  };

  if (next.type !== "other") {
    next.custom_type = "";
  }

  return next;
}


/* ==========================================================================
   Form → Create Payload
========================================================================== */

export function buildCreateProjectEventPayload(
  input: ProjectEventFormValues
): CreateProjectInput {
  const values =
    projectEventSchema.parse(input);

  return {
    p_name:
      values.name,

    p_type:
      values.type,

    p_start_date:
      formatDateAsLocalDate(
        values.start_date
      ),

    ...(values.type === "other" && {
      p_custom_type:
        values.custom_type,
    }),

    ...(values.start_time?.trim() && {
      p_start_time:
        values.start_time.trim(),
    }),

    ...(values.location_name && {
      p_location_name:
        values.location_name,
    }),

    ...(values.location_address && {
      p_location_address:
        values.location_address,
    }),
  };
}


/* ==========================================================================
   Form → Update Payload
========================================================================== */

export function buildUpdateProjectEventPayload(
  projectId: string,
  input: ProjectEventFormValues
): UpdateProjectInput {
  // Both RPCs have the same event arguments and optional SQL defaults.
  return { ...buildCreateProjectEventPayload(input), p_project_id: projectId };
}
