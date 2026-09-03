"use client";

import {
  useEffect,
  useState,
} from "react";

import type {
  GuestGroup,
} from "@/features/guests/types/guest.types";


/* ==========================================================================
   Types
========================================================================== */

export type GuestGroupsDialogView =
  | "list"
  | "create"
  | "edit";


interface UseGuestGroupsDialogProps {
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

export function useGuestGroupsDialog({
  groups,
  onOpenChange,
  onSuccess,
}: UseGuestGroupsDialogProps) {
  /* ==========================================================================
     State
  ========================================================================== */

  const [
    view,
    setView,
  ] =
    useState<GuestGroupsDialogView>(
      "list"
    );

  const [
    selectedGroup,
    setSelectedGroup,
  ] =
    useState<GuestGroup | null>(
      null
    );

  const [
    localGroups,
    setLocalGroups,
  ] =
    useState<GuestGroup[]>(
      groups
    );


  /* ==========================================================================
     Sync
  ========================================================================== */

  useEffect(
    () => {
      setLocalGroups(
        groups
      );
    },
    [
      groups,
    ]
  );


  /* ==========================================================================
     Reset
  ========================================================================== */

  function resetView() {
    setView(
      "list"
    );

    setSelectedGroup(
      null
    );
  }


  /* ==========================================================================
     Dialog
  ========================================================================== */

  function handleOpenChange(
    open: boolean
  ) {
    onOpenChange(
      open
    );

    if (!open) {
      resetView();
    }
  }


  /* ==========================================================================
     Create
  ========================================================================== */

  function handleAddGroup() {
    setSelectedGroup(
      null
    );

    setView(
      "create"
    );
  }


  function handleCreateSuccess(
    group: GuestGroup
  ) {
    setLocalGroups(
      (currentGroups) => [
        ...currentGroups,
        group,
      ]
    );

    resetView();

    onSuccess();
  }


  /* ==========================================================================
     Edit
  ========================================================================== */

  function handleEditGroup(
    group: GuestGroup
  ) {
    setSelectedGroup(
      group
    );

    setView(
      "edit"
    );
  }


  function handleUpdateSuccess(
    group: GuestGroup
  ) {
    setLocalGroups(
      (currentGroups) =>
        currentGroups.map(
          (currentGroup) =>
            currentGroup.id ===
            group.id
              ? group
              : currentGroup
        )
    );

    resetView();

    onSuccess();
  }


  /* ==========================================================================
     Delete
  ========================================================================== */

  function handleDeleteSuccess(
    groupId: string
  ) {
    setLocalGroups(
      (currentGroups) =>
        currentGroups.filter(
          (group) =>
            group.id !==
            groupId
        )
    );

    resetView();

    onSuccess();
  }


  /* ==========================================================================
     Navigation
  ========================================================================== */

  function handleBack() {
    resetView();
  }


  /* ==========================================================================
     Return
  ========================================================================== */

  return {
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
  };
}