"use client";

import {
  useState,
} from "react";

import {
  useTranslations,
} from "next-intl";

import {
  toast,
} from "sonner";

import DeleteButton
  from "@/components/ui/common/DeleteButton";

import {
  deleteGuestGroupAction,
} from "@/features/guests/actions/deleteGuestGroupAction";

import styles
  from "./GuestGroupDeleteDangerZone.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface GuestGroupDeleteDangerZoneProps {
  groupId:
    string;

  eventId:
    string;

  onSuccess:
    (
      groupId: string
    ) => void;
}


/* ==========================================================================
   Guest Group Delete Danger Zone
========================================================================== */

export default function GuestGroupDeleteDangerZone({
  groupId,
  eventId,
  onSuccess,
}: GuestGroupDeleteDangerZoneProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Guests.groups.delete"
    );


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    isDeleting,
    setIsDeleting,
  ] =
    useState(false);


  /* ==========================================================================
     Delete
  ========================================================================== */

  async function handleDelete() {
    if (isDeleting) {
      return;
    }


    setIsDeleting(
      true
    );


  try {
  const result =
    await deleteGuestGroupAction(
      eventId,
      groupId
    );


  if (!result.success) {
    toast.error(
      result.message
    );

    return;
  }


  toast.success(
    t(
      "success"
    )
  );


  onSuccess(
    groupId
  );
} finally {
  setIsDeleting(
    false
  );
}
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <div
      className={
        styles.dangerZone
      }
    >
      <div
        className={
          styles.dangerContent
        }
      >
        <strong>
          {t(
            "title"
          )}
        </strong>

        <span>
          {t(
            "description"
          )}
        </span>
      </div>


      <DeleteButton
        title={
          t(
            "confirm.title"
          )
        }
        description={
          t(
            "confirm.description"
          )
        }
        confirmText={
          t(
            "confirm.confirm"
          )
        }
        loading={
          isDeleting
        }
        onDelete={
          handleDelete
        }
      />
    </div>
  );
}