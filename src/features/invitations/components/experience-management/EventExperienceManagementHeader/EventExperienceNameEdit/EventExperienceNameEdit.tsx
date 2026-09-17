"use client";

import {
  useTranslations,
} from "next-intl";

import {
  updateEventExperienceNameAction,
} from "@/features/invitations/actions/experience/updateEventExperienceNameAction";

import ManagementNameEdit
  from "@/features/management/components/ManagementNameEdit/ManagementNameEdit";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceNameEditProps {
  experienceId:
    string;

  name:
    string;
}


/* ==========================================================================
   Event Experience Name Edit
========================================================================== */

export default function EventExperienceNameEdit({
  experienceId,
  name,
}: EventExperienceNameEditProps) {
  const t =
    useTranslations(
      "EventExperiences.management.name"
    );

  async function handleSave(
    newName:
      string
  ) {
    const result =
      await updateEventExperienceNameAction({
        experienceId,
        name:
          newName,
      });

    if (!result.success) {
      throw new Error(
        result.message
      );
    }

    return result.data.name;
  }

  return (
    <ManagementNameEdit
      name={
        name
      }
      editLabel={
        t(
          "edit"
        )
      }
      inputLabel={
        t(
          "label"
        )
      }
      saveLabel={
        t(
          "save"
        )
      }
      cancelLabel={
        t(
          "cancel"
        )
      }
      errorLabel={
        t(
          "error"
        )
      }
      onSave={
        handleSave
      }
    />
  );
}