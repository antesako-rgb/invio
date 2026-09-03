"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  toast,
} from "sonner";

import {
  useTranslations,
} from "next-intl";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  createGuestGroupAction,
} from "@/features/guests/actions/createGuestGroupAction";

import {
  updateGuestGroupAction,
} from "@/features/guests/actions/updateGuestGroupAction";

import type {
  GuestGroup,
} from "@/features/guests/types/guest.types";

import styles
  from "./GuestGroupForm.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface GuestGroupFormProps {
  eventId:
    string;

  group?:
    GuestGroup | null;

  onCancel:
    () => void;

  onSuccess:
    (
      group: GuestGroup
    ) => void;
}


/* ==========================================================================
   Guest Group Form
========================================================================== */

export default function GuestGroupForm({
  eventId,
  group = null,
  onCancel,
  onSuccess,
}: GuestGroupFormProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Guests.groups"
    );


  /* ==========================================================================
     State
  ========================================================================== */

  const [
    name,
    setName,
  ] =
    useState(
      group?.name ?? ""
    );

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(false);


  /* ==========================================================================
     Derived State
  ========================================================================== */

  const isEditing =
    group !== null;


  /* ==========================================================================
     Submit
  ========================================================================== */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();


    const trimmedName =
      name.trim();


    if (
      isSubmitting ||
      !trimmedName
    ) {
      return;
    }


    setIsSubmitting(
      true
    );


    try {
      const result =
        isEditing
          ? await updateGuestGroupAction(
              eventId,
              group.id,
              trimmedName
            )
          : await createGuestGroupAction(
              eventId,
              trimmedName
            );


      if (!result.success) {
        toast.error(
          result.message
        );

        return;
      }


      toast.success(
        t(
          isEditing
            ? "messages.updated"
            : "messages.created"
        )
      );


      onSuccess(
        result.data
      );
    } finally {
      setIsSubmitting(
        false
      );
    }
  }


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <form
      className={
        styles.form
      }
      onSubmit={
        handleSubmit
      }
    >
      <div
        className={
          styles.field
        }
      >
        <Label
          htmlFor="guest-group-name"
        >
          {t(
            "form.name"
          )}
        </Label>

        <Input
          id="guest-group-name"
          value={
            name
          }
          placeholder={
            t(
              "form.namePlaceholder"
            )
          }
          disabled={
            isSubmitting
          }
          autoComplete="off"
          autoFocus
          onChange={
            (event) =>
              setName(
                event.target.value
              )
          }
        />
      </div>


      <div
        className={
          styles.actions
        }
      >
        <Button
          type="button"
          variant="outline"
          disabled={
            isSubmitting
          }
          onClick={
            onCancel
          }
        >
          {t(
            "form.cancel"
          )}
        </Button>

        <Button
          type="submit"
          disabled={
            isSubmitting ||
            !name.trim()
          }
        >
          {isSubmitting
            ? t(
                "form.saving"
              )
            : t(
                isEditing
                  ? "form.save"
                  : "form.create"
              )}
        </Button>
      </div>
    </form>
  );
}