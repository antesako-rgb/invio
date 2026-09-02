"use client";

import {
  useRef,
  useState,
} from "react";

import type {
  ChangeEvent,
  MouseEvent,
  ReactNode,
} from "react";

import {
  ImagePlus,
  LoaderCircle,
  X,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  removeInvitationImageAction,
} from "@/features/invitations/actions/invitation/removeInvitationImageAction";

import {
  uploadInvitationImageAction,
} from "@/features/invitations/actions/invitation/uploadInvitationImageAction";

import {
  invitationEditorElements,
} from "@/features/invitations/editor/registry/invitationEditorElements";

import type {
  InvitationEditorContext,
  InvitationEditorSelection,
} from "@/features/invitations/editor/types/invitationEditor.types";

import type {
  InvitationRenderMode,
} from "@/features/invitations/types/invitationRenderer.types";

import "./EditableImage.css";


/* ==========================================================================
   Types
========================================================================== */

interface EditableImageProps {
  element:
    InvitationEditorSelection;

  value:
    string | null;

  mode:
    InvitationRenderMode;

  editor?:
    InvitationEditorContext;

  children?:
    ReactNode;

  className?:
    string;

  imageClassName?:
    string;

  alt?:
    string;
}


/* ==========================================================================
   Editable Image
========================================================================== */

export default function EditableImage({
  element,
  value,
  mode,
  editor,
  children,
  className,
  imageClassName,
  alt = "",
}: EditableImageProps) {
  const t =
    useTranslations(
      "Invitations.editor.elementLabels"
    );

  const inputRef =
    useRef<HTMLInputElement>(
      null
    );

  const [
    isUploading,
    setIsUploading,
  ] =
    useState(false);

  const [
    isDeleting,
    setIsDeleting,
  ] =
    useState(false);


  /* ==========================================================================
     Element
  ========================================================================== */

  const elementConfig =
    invitationEditorElements[
      element
    ];

  const editorLabel =
    t(
      elementConfig.labelKey
    );


  /* ==========================================================================
     Editor State
  ========================================================================== */

  const isEditorMode =
    mode === "edit" &&
    Boolean(editor);

  const invitationId =
    editor?.invitationId;

  const imageUrl =
    editor
      ? elementConfig.getValue(
          editor.content
        )
      : value;

  const hasImage =
    Boolean(
      imageUrl
    );

  const isBusy =
    isUploading ||
    isDeleting;


  /* ==========================================================================
     Update Value
  ========================================================================== */

  function updateValue(
    newValue: string
  ) {
    if (!editor) {
      return;
    }

    editor.onContentChange(
      elementConfig.setValue(
        editor.content,
        newValue
      )
    );
  }

function handleClick(
  event:
    MouseEvent<HTMLDivElement>
) {
  if (
    !isEditorMode ||
    isBusy
  ) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  const input =
    inputRef.current;

  if (!input) {
    return;
  }

  input.showPicker();
}


  /* ==========================================================================
     Upload
  ========================================================================== */

  async function handleFileChange(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    event.target.value =
      "";

    if (
      !file ||
      !editor ||
      !invitationId
    ) {
      return;
    }

    setIsUploading(
      true
    );

    try {
      const result =
        await uploadInvitationImageAction(
          file,
          invitationId
        );

      if (!result.success) {
        throw new Error(
          result.message
        );
      }

      updateValue(
        result.data
      );
    } catch (error) {
      console.error(
        error
      );
    } finally {
      setIsUploading(
        false
      );
    }
  }


  /* ==========================================================================
     Delete
  ========================================================================== */

  async function handleDelete(
    event:
      MouseEvent<HTMLButtonElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (
      !editor ||
      !invitationId ||
      !imageUrl ||
      isBusy
    ) {
      return;
    }

    setIsDeleting(
      true
    );

    try {
      const result =
        await removeInvitationImageAction(
          invitationId,
          imageUrl
        );

      if (!result.success) {
        throw new Error(
          result.message
        );
      }

      updateValue(
        ""
      );
    } catch (error) {
      console.error(
        error
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
      className={[
        "editable-image",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-editor-element={
        isEditorMode
          ? element
          : undefined
      }
      data-editor-label={
        isEditorMode
          ? editorLabel
          : undefined
      }
      data-editor-empty={
        !hasImage
          ? "true"
          : undefined
      }
      data-editor-loading={
        isBusy
          ? "true"
          : undefined
      }
      onClick={
        isEditorMode
          ? handleClick
          : undefined
      }
    >
      {imageUrl ? (
        <img
          className={[
            "editable-image__image",
            imageClassName,
          ]
            .filter(Boolean)
            .join(" ")}
          src={
            imageUrl
          }
          alt={
            alt
          }
          draggable={
            false
          }
        />
      ) : (
        children
      )}

      {isEditorMode &&
        !hasImage &&
        !isBusy && (
          <div
            className="editable-image__empty"
            aria-hidden="true"
          >
            <ImagePlus />
          </div>
        )}

      {isEditorMode &&
        isBusy && (
          <div
            className="editable-image__loading"
            data-invitation-editor-ui
          >
            <LoaderCircle
              className="editable-image__spinner"
              aria-hidden="true"
            />
          </div>
        )}

      {isEditorMode &&
        hasImage &&
        !isBusy && (
          <button
            type="button"
            className="editable-image__delete"
            data-invitation-editor-ui
            aria-label={
              t(
                "delete"
              )
            }
            onClick={
              handleDelete
            }
          >
            <X
              aria-hidden="true"
            />
          </button>
        )}

      {isEditorMode && (
        <input
          ref={
            inputRef
          }
          className="editable-image__input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          tabIndex={
            -1
          }
          onChange={
            handleFileChange
          }
        />
      )}
    </div>
  );
}