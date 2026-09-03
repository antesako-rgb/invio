"use client";

import {
  ArrowLeft,
  Plus,
  UsersRound,
} from "lucide-react";

import {
  useTranslations,
} from "next-intl";

import {
  Button,
} from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog";

import GuestGroupDeleteDangerZone
  from "@/features/guests/components/GuestGroupDeleteDangerZone/GuestGroupDeleteDangerZone";

import GuestGroupForm
  from "@/features/guests/components/GuestGroupForm/GuestGroupForm";

import {
  useGuestGroupsDialog,
} from "@/features/guests/hooks/useGuestGroupsDialog";

import type {
  GuestGroup,
} from "@/features/guests/types/guest.types";

import styles
  from "./GuestGroupsDialog.module.css";


/* ==========================================================================
   Types
========================================================================== */

interface GuestGroupsDialogProps {
  open:
    boolean;

  eventId:
    string;

  groups:
    GuestGroup[];

  onOpenChange:
    (
      open: boolean
    ) => void;

  onSuccess:
    () => void;
}


/* ==========================================================================
   Guest Groups Dialog
========================================================================== */

export default function GuestGroupsDialog({
  open,
  eventId,
  groups,
  onOpenChange,
  onSuccess,
}: GuestGroupsDialogProps) {
  /* ==========================================================================
     Translations
  ========================================================================== */

  const t =
    useTranslations(
      "Guests.groups"
    );


  /* ==========================================================================
     Dialog
  ========================================================================== */

  const {
    view,
    selectedGroup,
    localGroups,

    handleOpenChange,

    handleAddGroup,
    handleCreateSuccess,

    handleEditGroup,
    handleUpdateSuccess,

    handleDeleteSuccess,

    handleBack,
  } =
    useGuestGroupsDialog({
      groups,
      onOpenChange,
      onSuccess,
    });


  /* ==========================================================================
     Render
  ========================================================================== */

  return (
    <Dialog
      open={
        open
      }
      onOpenChange={
        handleOpenChange
      }
    >
      <DialogContent
        className={
          styles.dialog
        }
      >
        {view === "list" ? (
          <>
            <DialogHeader>
              <DialogTitle>
                {t(
                  "title"
                )}
              </DialogTitle>

              <DialogDescription>
                {t(
                  "description"
                )}
              </DialogDescription>
            </DialogHeader>


            <div
              className={
                styles.content
              }
            >
              <div
                className={
                  styles.toolbar
                }
              >
                <Button
                  type="button"
                  onClick={
                    handleAddGroup
                  }
                >
                  <Plus
                    className="size-4"
                    aria-hidden="true"
                  />

                  {t(
                    "addGroup"
                  )}
                </Button>
              </div>


              {localGroups.length > 0 ? (
                <div
                  className={
                    styles.list
                  }
                >
                  {localGroups.map(
                    (group) => (
                      <div
                        key={
                          group.id
                        }
                        className={
                          styles.item
                        }
                      >
                        <div
                          className={
                            styles.group
                          }
                        >
                          <div
                            className={
                              styles.icon
                            }
                          >
                            <UsersRound
                              className="size-4"
                              aria-hidden="true"
                            />
                          </div>


                          <div
                            className={
                              styles.groupContent
                            }
                          >
                            <strong>
                              {group.name}
                            </strong>
                          </div>
                        </div>


                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={
                            () =>
                              handleEditGroup(
                                group
                              )
                          }
                        >
                          {t(
                            "edit"
                          )}
                        </Button>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div
                  className={
                    styles.empty
                  }
                >
                  <div
                    className={
                      styles.emptyIcon
                    }
                  >
                    <UsersRound
                      className="size-5"
                      aria-hidden="true"
                    />
                  </div>

                  <strong>
                    {t(
                      "emptyTitle"
                    )}
                  </strong>

                  <span>
                    {t(
                      "emptyDescription"
                    )}
                  </span>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={
                      handleAddGroup
                    }
                  >
                    <Plus
                      className="size-4"
                      aria-hidden="true"
                    />

                    {t(
                      "addGroup"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div
                className={
                  styles.formHeader
                }
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={
                    handleBack
                  }
                  aria-label={
                    t(
                      "form.back"
                    )
                  }
                >
                  <ArrowLeft
                    className="size-4"
                    aria-hidden="true"
                  />
                </Button>


                <div
                  className={
                    styles.formHeading
                  }
                >
                  <DialogTitle>
                    {t(
                      view === "edit"
                        ? "form.editTitle"
                        : "form.createTitle"
                    )}
                  </DialogTitle>

                  <DialogDescription>
                    {t(
                      view === "edit"
                        ? "form.editDescription"
                        : "form.createDescription"
                    )}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>


            {view === "edit" &&
            selectedGroup ? (
              <div
                className={
                  styles.editContent
                }
              >
                <GuestGroupForm
                  key={
                    selectedGroup.id
                  }
                  eventId={
                    eventId
                  }
                  group={
                    selectedGroup
                  }
                  onCancel={
                    handleBack
                  }
                  onSuccess={
                    handleUpdateSuccess
                  }
                />


          <GuestGroupDeleteDangerZone
  eventId={
    eventId
  }
  groupId={
    selectedGroup.id
  }
  onSuccess={
    handleDeleteSuccess
  }
/>
              </div>
            ) : (
              <GuestGroupForm
                eventId={
                  eventId
                }
                onCancel={
                  handleBack
                }
                onSuccess={
                  handleCreateSuccess
                }
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}