"use client";

import {
  useRef,
  useId,
  useState,
  type FormEvent,
} from "react";

import {
  useTranslations,
} from "next-intl";

import {
  useRouter,
} from "@/i18n/navigation";

import type {
  ActionErrorCode,
} from "@/lib/actions/actionErrorCodes";

import {
  useActionError,
} from "@/lib/actions/useActionError";

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
  DialogFooter,
} from "@/components/ui/dialog/dialog";

import {
  createAlbumEntryAction,
} from "../../actions/createAlbumEntryAction";

import styles from "./CreateAlbumForm.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface CreateAlbumFormProps {
  projectId:
    string;
  onCancel: () => void;
  onBusyChange: (busy: boolean) => void;
}


/* ==========================================================================
   Create Album Form
========================================================================== */

export default function CreateAlbumForm({
  projectId,
  onCancel,
  onBusyChange,
}: CreateAlbumFormProps) {
  const nameId = useId();
  const t =
    useTranslations(
      "Projects.create"
    );

  const actionError =
    useActionError();

  const router =
    useRouter();

  const [
    name,
    setName,
  ] =
    useState("");

  const [
    busy,
    setBusy,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<ActionErrorCode | null>(
      null
    );

  const lock =
    useRef(false);


  /* ==========================================================================
     Submit
  ========================================================================== */

  async function submit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedName =
      name.trim();

    if (
      lock.current ||
      !trimmedName
    ) {
      return;
    }

    lock.current =
      true;

    onBusyChange(true);

    setBusy(
      true
    );

    setError(
      null
    );

    try {
      const result =
        await createAlbumEntryAction({
          name:
            trimmedName,

          projectId,
        });

      if (
        !result.success
      ) {
        setError(
          result.code
        );

        return;
      }

      router.push(
        `/editor/album/${result.data.albumId}/uredi`
      );

      router.refresh();
    } catch {
      setError(
        "ALBUM_CREATE_FAILED"
      );
    } finally {
      onBusyChange(false);
      lock.current =
        false;

      setBusy(
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
        submit
      }
      aria-busy={
        busy
      }
    >
      <Field
        id={nameId}
        label={
          t(
            "albumName"
          )
        }
      >
        <Input
          id={nameId}
          required
          maxLength={
            150
          }
          value={
            name
          }
          disabled={
            busy
          }
          onChange={
            (event) =>
              setName(
                event.target.value
              )
          }
          placeholder={
            t(
              "albumPlaceholder"
            )
          }
        />
      </Field>

      {error && (
        <p
          role="alert"
          className={
            styles.error
          }
        >
          {actionError(error)}
        </p>
      )}

      <DialogFooter
        className={
          styles.actions
        }
      >
        <Button type="button" variant="ghost" disabled={busy} onClick={onCancel}>
          {t("cancel")}
        </Button>
        <Button
          type="submit"
          disabled={
            busy ||
            !name.trim()
          }
          loading={
            busy
          }
        >
          {t(
            "createAlbum"
          )}
        </Button>

      </DialogFooter>
    </form>
  );
}
