"use client";

import {
  useTranslations,
} from "next-intl";

import {
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  toast,
} from "sonner";

import {
  Button,
} from "@/components/ui/button";

import {
  Field,
} from "@/components/ui/field";

import {
  Input,
} from "@/components/ui/input";

import {
  Select,
} from "@/components/ui/select";

import {
  SheetFooter,
} from "@/components/ui/sheet/Sheet";

import {
  Textarea,
} from "@/components/ui/textarea";
import {
  createEventGuestAction,
} from "@/features/guests/actions/createEventGuestAction";

import {
  updateEventGuestAction,
} from "@/features/guests/actions/updateEventGuestAction";

import {
  buildCreateEventGuestInput,
  buildUpdateEventGuestInput,
  parseGuestRsvpStatus,
} from "@/features/guests/utils/guest.utils";

import {
  guestSchema,
} from "@/features/guests/validation/guest.schema";

import type {
  EventGuest,
  GuestGroup,
} from "@/features/guests/types/guest.types";

import type {
  GuestFormValues,
} from "@/features/guests/validation/guest.schema";

import styles
  from "./GuestForm.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface GuestFormProps {
  eventId:
    string;

  groups:
    GuestGroup[];

  guest?:
    EventGuest | null;

  onSuccess:
    () => void;
}


/* ==========================================================================
   Default Values
========================================================================== */

function getGuestDefaultValues(
  guest: EventGuest | null
): GuestFormValues {
  return {
    first_name:
      guest?.first_name ??
      "",

    last_name:
      guest?.last_name ??
      "",

    email:
      guest?.email ??
      "",

    phone:
      guest?.phone ??
      "",

    group_id:
      guest?.group_id ??
      null,

    rsvp_status:
      guest
        ? parseGuestRsvpStatus(
            guest.rsvp_status
          )
        : "unknown",

    notes:
      guest?.notes ??
      "",
  };
}


/* ==========================================================================
   Guest Form
========================================================================== */

export default function GuestForm({
  eventId,
  groups,
  guest = null,
  onSuccess,
}: GuestFormProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Guests.form"
    );

  const rsvpT =
    useTranslations(
      "Guests.rsvpStatus"
    );

  const messagesT =
    useTranslations(
      "Guests.messages"
    );

  const commonT =
    useTranslations(
      "Common"
    );


  /* ==========================================================================
     Form
  ========================================================================== */

  const form =
    useForm<GuestFormValues>({
      resolver:
        zodResolver(
          guestSchema
        ),

      defaultValues:
        getGuestDefaultValues(
          guest
        ),
    });


  /* ==========================================================================
     Submit
  ========================================================================== */

async function onSubmit(
  values: GuestFormValues
) {
  try {
    if (guest) {
      const result =
        await updateEventGuestAction({
          eventId,

          guestId:
            guest.id,

          changes:
            buildUpdateEventGuestInput(
              values
            ),
        });


      if (!result.success) {
        throw new Error(
          result.message
        );
      }


      toast.success(
        messagesT(
          "guestUpdated"
        )
      );
    } else {
      const result =
        await createEventGuestAction({
          eventId,

          guest:
            buildCreateEventGuestInput(
              eventId,
              values
            ),
        });


      if (!result.success) {
        throw new Error(
          result.message
        );
      }


      toast.success(
        messagesT(
          "guestCreated"
        )
      );
    }


    onSuccess();
  } catch (error) {
    console.error(
      guest
        ? "updateEventGuest error:"
        : "createEventGuest error:",
      error
    );


    toast.error(
      messagesT(
        guest
          ? "guestUpdateError"
          : "guestCreateError"
      )
    );
  }
}


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <form
      onSubmit={
        form.handleSubmit(
          onSubmit
        )
      }
      className={
        styles.form
      }
    >
      <div
        className={
          styles.body
        }
      >
        <Field
          id="first_name"
          label={
            t(
              "firstName"
            )
          }
          required
        >
          <Input
            id="first_name"
            {...form.register(
              "first_name"
            )}
            placeholder={
              t(
                "firstNamePlaceholder"
              )
            }
            required
          />
        </Field>


        <Field
          id="last_name"
          label={
            t(
              "lastName"
            )
          }
          required
        >
          <Input
            id="last_name"
            {...form.register(
              "last_name"
            )}
            placeholder={
              t(
                "lastNamePlaceholder"
              )
            }
            required
          />
        </Field>
        <Field
          id="rsvp_status"
          label={
            t(
              "rsvpStatus"
            )
          }
        >
          <Select
            id="rsvp_status"
            value={
              form.watch(
                "rsvp_status"
              )
            }
            options={[
              {
                value:
                  "unknown",

                label:
                  rsvpT(
                    "unknown"
                  ),
              },

              {
                value:
                  "attending",

                label:
                  rsvpT(
                    "attending"
                  ),
              },

              {
                value:
                  "declined",

                label:
                  rsvpT(
                    "declined"
                  ),
              },
            ]}
            onValueChange={
              (value) =>
                form.setValue(
                  "rsvp_status",
                  parseGuestRsvpStatus(
                    value
                  ),
                  {
                    shouldDirty:
                      true,

                    shouldValidate:
                      true,
                  }
                )
            }
          />
        </Field>
 <Field
          id="group_id"
          label={
            t(
              "group"
            )
          }
        >
          <Select
            id="group_id"
            value={
              form.watch(
                "group_id"
              ) ?? ""
            }
            options={[
              {
                value:
                  "",

                label:
                  t(
                    "noGroup"
                  ),
              },

              ...groups.map(
                (group) => ({
                  value:
                    group.id,

                  label:
                    group.name,
                })
              ),
            ]}
            onValueChange={
              (value) =>
                form.setValue(
                  "group_id",
                  value || null,
                  {
                    shouldDirty:
                      true,

                    shouldValidate:
                      true,
                  }
                )
            }
          />
        </Field>




        <Field
          id="email"
          label={
            t(
              "email"
            )
          }
        >
          <Input
            id="email"
            type="email"
            {...form.register(
              "email"
            )}
            placeholder={
              t(
                "emailPlaceholder"
              )
            }
          />
        </Field>


        <Field
          id="phone"
          label={
            t(
              "phone"
            )
          }
        >
          <Input
            id="phone"
            {...form.register(
              "phone"
            )}
            placeholder={
              t(
                "phonePlaceholder"
              )
            }
          />
        </Field>


       

        <Field
          id="notes"
          label={
            t(
              "notes"
            )
          }
        >
          <Textarea
            id="notes"
            {...form.register(
              "notes"
            )}
            placeholder={
              t(
                "notesPlaceholder"
              )
            }
          />
        </Field>
      </div>


      <SheetFooter>
        <Button
          type="submit"
          disabled={
            form.formState
              .isSubmitting
          }
        >
          {commonT(
            "save"
          )}
        </Button>
      </SheetFooter>
    </form>
  );
}