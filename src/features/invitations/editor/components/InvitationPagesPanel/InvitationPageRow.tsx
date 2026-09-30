"use client";

import {
  useDraggable,
  useDroppable,
} from "@dnd-kit/react";

import {
  GripVertical,
  MoreVertical,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import EditorPageActionButton
  from "@/features/editor/components/pages/EditorPageActionButton/EditorPageActionButton";

import {
  type InvitationTheme,
} from "../../../config/invitationThemes";

import {
  type InvitationDocument,
  type InvitationDocumentPage,
} from "../../../types/invitationDocument.types";

import {
  type InvitationRenderPhoto,
} from "../../../types/invitationPhoto.types";

import InvitationThumbnail
  from "../InvitationThumbnail/InvitationThumbnail";

import styles
  from "./InvitationPageRow.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface InvitationPageRowProps {
  onChangeType: () => void;
  onChangeDesign: () => void;
  sharedDateTime:
    Pick<
      InvitationDocument,
      "eventDate" | "eventTime" | "legacyDateTime"
    >;

  theme:
    InvitationTheme;

  photos:
    InvitationRenderPhoto[];

  onDuplicate:
    () => void;

  canDuplicate:
    boolean;

  page:
    InvitationDocumentPage;

  index:
    number;

  active:
    boolean;

  disabled:
    boolean;

  onSelect:
    () => void;

  onRemove:
    () => void;

  onUp?:
    () => void;

  onDown?:
    () => void;
}


/* ==========================================================================
   Invitation Page Row
========================================================================== */

export default function InvitationPageRow({
  onChangeType, onChangeDesign,
  page,
  index,
  active,
  disabled,
  onSelect,
  onRemove,
  onUp,
  onDown,
  onDuplicate,
  canDuplicate,
  theme,
  photos,
  sharedDateTime,
}: InvitationPageRowProps) {
  const t =
    useTranslations(
      "Invitations"
    );

  const {
    ref: dragRef,
    handleRef,
    isDragging,
  } =
    useDraggable({
      id:
        page.id,
      disabled,
    });

  const {
    ref: dropRef,
    isDropTarget,
  } =
    useDroppable({
      id:
        page.id,
      disabled,
    });


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <li
      ref={
        node => {
          dragRef(
            node
          );

          dropRef(
            node
          );
        }
      }
      className={
        styles.pageRow
      }
      data-drop-target={isDropTarget && !isDragging}
      data-editor-page
      data-active={
        active
      }
      data-dragging={
        isDragging
      }
    >
      <div
        className={
          styles.row
        }
      >
        <EditorPageActionButton
          ref={
            handleRef
          }
          disabled={
            disabled
          }
          className={
            styles.dragHandle
          }
          aria-label={
            t(
              "editor.reorder",
              {
                number:
                  index + 1,
              }
            )
          }
        >
          <GripVertical
            aria-hidden="true"
          />
        </EditorPageActionButton>

        <button
          type="button"
          className={
            styles.pageSelect
          }
          onClick={
            onSelect
          }
          disabled={
            disabled
          }
          aria-current={
            active
              ? "true"
              : undefined
          }
        >
          <InvitationThumbnail
            document={{
              ...sharedDateTime,
              theme,
              pages: [
                page,
              ],
            }}
            photos={
              photos
            }
          />

          <span>
            <strong>
              {index + 1}
              .
              {t(
                `types.${page.type}`
              )}
            </strong>

            <span
              className={
                styles.pageTitle
              }
            >
              {page.content.title}
            </span>
          </span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <EditorPageActionButton
                disabled={
                  disabled
                }
                className={
                  styles.menuButton
                }
                aria-label={
                  t(
                    "editor.pageActions",
                    {
                      number:
                        index + 1,
                    }
                  )
                }
              >
                <MoreVertical
                  aria-hidden="true"
                />
              </EditorPageActionButton>
            }
          />

          <DropdownMenuContent>
            <DropdownMenuItem onClick={onChangeDesign}>{t("editor.changeLayout")}</DropdownMenuItem>
            <DropdownMenuItem onClick={onChangeType}>{t("editor.changeType")}</DropdownMenuItem>
            <DropdownMenuItem
              disabled={
                !canDuplicate
              }
              onClick={
                onDuplicate
              }
            >
              {t(
                "editor.duplicate"
              )}
            </DropdownMenuItem>

            <DropdownMenuItem
              disabled={
                !onUp
              }
              onClick={
                onUp
              }
            >
              {t(
                "editor.moveUp"
              )}
            </DropdownMenuItem>

            <DropdownMenuItem
              disabled={
                !onDown
              }
              onClick={
                onDown
              }
            >
              {t(
                "editor.moveDown"
              )}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={
                onRemove
              }
            >
              {t(
                "editor.removePage"
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
}