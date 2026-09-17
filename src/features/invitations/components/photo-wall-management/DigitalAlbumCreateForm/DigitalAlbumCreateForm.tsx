"use client";

import {
  useTranslations,
} from "next-intl";

import {
  useForm,
} from "react-hook-form";

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
  createDigitalAlbumAction,
} from "@/features/digital-albums/actions/album/createDigitalAlbumAction";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumCreateFormProps {
  photoWallId:
    string;

  onCancel:
    () => void;

  onCreated:
    (albumId: string) => void;
}

interface DigitalAlbumCreateFormValues {
  name:
    string;
}


/* ==========================================================================
   Digital Album Create Form
========================================================================== */

export default function DigitalAlbumCreateForm({
  photoWallId,
  onCancel,
  onCreated,
}: DigitalAlbumCreateFormProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "EventExperiences.management.photoWall.album.create"
    );


  /* ==========================================================================
     Form
  ========================================================================== */

  const form =
    useForm<DigitalAlbumCreateFormValues>({
      defaultValues: {
        name:
          "",
      },
    });


  /* ==========================================================================
     Submit
  ========================================================================== */

  async function onSubmit(
    values:
      DigitalAlbumCreateFormValues
  ) {
    const name =
      values.name.trim();

    if (!name) {
      return;
    }

    try {
      const result =
        await createDigitalAlbumAction({
          photoWallId,
          name,
        });

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

      onCreated(
        result.data.id
      );
    } catch (error) {
      console.error(
        "createDigitalAlbum error:",
        error
      );

      toast.error(
        t(
          "error"
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
    >
      <Field
        id="name"
        label={
          t(
            "name"
          )
        }
        required
      >
        <Input
          id="name"
          {...form.register(
            "name",
            {
              required:
                true,

              maxLength:
                150,
            }
          )}
          placeholder={
            t(
              "namePlaceholder"
            )
          }
          maxLength={
            150
          }
          autoFocus
          required
        />
      </Field>

      <div
        className="mt-6 flex justify-end gap-2"
      >
        <Button
          type="button"
          variant="outline"
          disabled={
            form.formState
              .isSubmitting
          }
          onClick={
            onCancel
          }
        >
          {t(
            "cancel"
          )}
        </Button>

        <Button
          type="submit"
          disabled={
            form.formState
              .isSubmitting
          }
        >
          {t(
            "submit"
          )}
        </Button>
      </div>
    </form>
  );
}