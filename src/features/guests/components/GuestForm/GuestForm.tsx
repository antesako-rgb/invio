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
  Input,
} from "@/components/ui/input";

import {
  Textarea,
} from "@/components/ui/textarea";

import {
  Select,
} from "@/components/ui/select";

import {
  SheetFooter,
} from "@/components/ui/sheet/Sheet";

import {
  buildCreateEventGuestInput,
  buildUpdateEventGuestInput,
} from "../../utils/guest.utils";
import {
  createEventGuest,
} from "../../repositories/createEventGuest";

import {
  updateEventGuest,
} from "../../repositories/updateEventGuest";

import {
  guestSchema,
} from "../../validation/guest.schema";

import type {
  GuestFormValues,
} from "../../validation/guest.schema";

import type {
  EventGuest,
  GuestGroup,
} from "../../types/guest.types";

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

      defaultValues: {
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

        notes:
          guest?.notes ??
          "",
      },
    });


  /* ==========================================================================
     Submit
  ========================================================================== */

async function onSubmit(
  values: GuestFormValues
) {
  try {
    if (guest) {
      await updateEventGuest(
        guest.id,
        buildUpdateEventGuestInput(
          values
        )
      );

      toast.success(
        messagesT(
          "guestUpdated"
        )
      );
    } else {
      await createEventGuest(
        buildCreateEventGuestInput(
          eventId,
          values
        )
      );

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
        <div
          className={
            styles.field
          }
        >
          <label
            className={
              styles.label
            }
          >
            {t(
              "firstName"
            )}
          </label>

          <Input
            {...form.register(
              "first_name"
            )}
            placeholder={
              t(
                "firstNamePlaceholder"
              )
            }
          />
        </div>


        <div
          className={
            styles.field
          }
        >
          <label
            className={
              styles.label
            }
          >
            {t(
              "lastName"
            )}
          </label>

          <Input
            {...form.register(
              "last_name"
            )}
            placeholder={
              t(
                "lastNamePlaceholder"
              )
            }
          />
        </div>


        <div
          className={
            styles.field
          }
        >
          <label
            className={
              styles.label
            }
          >
            {t(
              "email"
            )}
          </label>

          <Input
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
        </div>


        <div
          className={
            styles.field
          }
        >
          <label
            className={
              styles.label
            }
          >
            {t(
              "phone"
            )}
          </label>

          <Input
            {...form.register(
              "phone"
            )}
            placeholder={
              t(
                "phonePlaceholder"
              )
            }
          />
        </div>


        <div
          className={
            styles.field
          }
        >
          <label
            className={
              styles.label
            }
          >
            {t(
              "group"
            )}
          </label>

          <Select
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
        </div>


        <div
          className={
            styles.field
          }
        >
          <label
            className={
              styles.label
            }
          >
            {t(
              "notes"
            )}
          </label>

          <Textarea
            {...form.register(
              "notes"
            )}
            placeholder={
              t(
                "notesPlaceholder"
              )
            }
          />
        </div>
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