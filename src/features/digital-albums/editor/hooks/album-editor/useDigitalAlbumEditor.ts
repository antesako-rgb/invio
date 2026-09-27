"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import {
  DigitalAlbumSaveConflict,
} from "../../../utils/digitalAlbumRevision";

import {
  updateDigitalAlbumDocumentAction,
} from "../../../actions/album/updateDigitalAlbumDocumentAction";

import {
  parseDigitalAlbumDocument,
} from "../../../utils/parseDigitalAlbumDocument";

import {
  DigitalAlbumSession,
} from "../../state/DigitalAlbumSession";

import useDigitalAlbumPageActions
  from "./useDigitalAlbumPageActions";

import useDigitalAlbumPhotoActions
  from "./useDigitalAlbumPhotoActions";

import type {
  DigitalAlbumDocument,
  DigitalAlbumPageContent,
  DigitalAlbumTheme,
} from "../../../types/digitalAlbumDocument.types";


/* ==========================================================================
   Types
========================================================================== */

interface Options {
  albumId:
    string;

  initialDocument:
    DigitalAlbumDocument;

  documentVersion:
    number;

  documentRevision:
    number;
}


/* ==========================================================================
   Digital Album Editor
========================================================================== */

export default function useDigitalAlbumEditor({
  albumId,
  initialDocument,
  documentVersion,
  documentRevision,
}: Options) {

  /* ==========================================================================
     Session
  ========================================================================== */

  const [
    session,
  ] =
    useState(
      () =>
        new DigitalAlbumSession(
          initialDocument,
          documentVersion,
          documentRevision,
          async (
            document,
            version,
            revision
          ) => {

            const result =
              await updateDigitalAlbumDocumentAction({
                albumId,
                document,
                documentVersion:
                  version,
                documentRevision:
                  revision,
              });


            if (
              !result.success &&
              "code" in result &&
              result.code ===
                "CONFLICT"
            ) {
              throw new DigitalAlbumSaveConflict();
            }


            if (
              !result.success
            ) {
              throw new Error(
                "Album save failed"
              );
            }


            return {
              document:
                parseDigitalAlbumDocument(
                  result.data.document
                ),

              version:
                result.data.document_version,

              revision:
                result.data.document_revision,
            };

          }
        )
    );


  /* ==========================================================================
     Session Snapshot
  ========================================================================== */

  const {
    document,
    status,
    canUndo,
    canRedo,
    conflict,
  } =
    useSyncExternalStore(
      session.subscribe,
      session.getSnapshot,
      session.getSnapshot
    );


  const getDocument =
    () =>
      session
        .getSnapshot()
        .document;


  /* ==========================================================================
     Selection
  ========================================================================== */

  const [
    activePageId,
    setActivePageId,
  ] =
    useState<string | null>(
      initialDocument.pages[0]?.id ??
        null
    );


  const [
    activePhotoSlotId,
    setActivePhotoSlotId,
  ] =
    useState<string | null>(
      initialDocument.pages[0]
        ?.photos[0]?.id ??
        null
    );


  const [
    visiblePageIndexes,
    setVisiblePageIndexes,
  ] =
    useState<number[]>(
      initialDocument.pages.length
        ? [
            0,
          ]
        : []
    );


  const sidebarSelectedPageIdRef =
    useRef<string | null>(
      null
    );


  const visiblePageSelectionRef =
    useRef<string | null>(
      null
    );


  /* ==========================================================================
     Active Page
  ========================================================================== */

  const foundIndex =
    document.pages.findIndex(
      (page) =>
        page.id ===
        activePageId
    );


  const activePageIndex =
    foundIndex >= 0
      ? foundIndex
      : document.pages.length
        ? 0
        : -1;


  const activePage =
    document.pages[
      activePageIndex
    ];


  const resolvedSlot =
    activePage?.photos.find(
      (slot) =>
        slot.id ===
        activePhotoSlotId
    ) ??
    activePage?.photos[0];


  const selectedPhotoId =
    resolvedSlot?.photoId ??
    null;


  /* ==========================================================================
     Before Unload
  ========================================================================== */

  useEffect(
    () => {

      function warn(
        event:
          BeforeUnloadEvent
      ) {

        if (
          session
            .getSnapshot()
            .status !==
          "saved"
        ) {
          event.preventDefault();

          event.returnValue =
            "";
        }

      }


      window.addEventListener(
        "beforeunload",
        warn
      );


      return () =>
        window.removeEventListener(
          "beforeunload",
          warn
        );

    },
    [
      session,
    ]
  );


  /* ==========================================================================
     Theme
  ========================================================================== */

  async function changeTheme(
    theme:
      DigitalAlbumTheme
  ) {

    session.commit(
      (current) => ({
        ...current,
        theme,
      })
    );

  }


  /* ==========================================================================
     Page Content
  ========================================================================== */

  async function updatePageContent(
    pageId:
      string,
    content:
      Partial<DigitalAlbumPageContent>
  ) {

    session.commit(
      (current) => ({
        ...current,

        pages:
          current.pages.map(
            (page) =>
              page.id === pageId
                ? {
                    ...page,

                    content: {
                      ...page.content,
                      ...content,
                    },
                  }
                : page
          ),
      })
    );

  }


  /* ==========================================================================
     Page Selection
  ========================================================================== */

  function selectPage(
    pageId:
      string
  ) {

    const page =
      getDocument()
        .pages
        .find(
          (item) =>
            item.id === pageId
        );


    if (
      !page
    ) {
      return;
    }


    visiblePageSelectionRef.current =
      null;

    sidebarSelectedPageIdRef.current =
      pageId;

    setActivePageId(
      pageId
    );

    setActivePhotoSlotId(
      page.photos[0]?.id ??
        null
    );

  }


  /* ==========================================================================
     Photo Slot Selection
  ========================================================================== */

  function selectPhotoSlot(
    pageId:
      string,
    slotId:
      string
  ) {

    const currentDocument =
      getDocument();


    const index =
      currentDocument.pages.findIndex(
        (page) =>
          page.id === pageId
      );


    if (
      !visiblePageIndexes.includes(
        index
      )
    ) {
      return;
    }


    if (
      !currentDocument
        .pages[index]
        ?.photos
        .some(
          (slot) =>
            slot.id === slotId
        )
    ) {
      return;
    }


    sidebarSelectedPageIdRef.current =
      null;

    visiblePageSelectionRef.current =
      pageId;

    setActivePageId(
      pageId
    );

    setActivePhotoSlotId(
      slotId
    );

  }


  /* ==========================================================================
     FlipBook Page Change
  ========================================================================== */

  function handleFlipBookPageChange(
    index:
      number
  ) {

    if (
      visiblePageSelectionRef.current
    ) {
      visiblePageSelectionRef.current =
        null;


      if (
        visiblePageIndexes.includes(
          index
        )
      ) {
        return;
      }
    }


    const currentDocument =
      getDocument();


    const selected =
      currentDocument.pages.findIndex(
        (page) =>
          page.id ===
          sidebarSelectedPageIdRef.current
      );


    const spreadStart =
      selected <= 0
        ? 0
        : selected % 2 === 0
          ? selected - 1
          : selected;


    if (
      sidebarSelectedPageIdRef.current &&
      (
        index === spreadStart ||
        index === selected
      )
    ) {
      sidebarSelectedPageIdRef.current =
        null;

      return;
    }


    const page =
      currentDocument.pages[
        index
      ];


    if (
      page
    ) {
      setActivePageId(
        page.id
      );

      setActivePhotoSlotId(
        page.photos[0]?.id ??
          null
      );
    }

  }


  /* ==========================================================================
     Visible Pages
  ========================================================================== */

  function handleVisiblePagesChange(
    indexes:
      number[]
  ) {

    setVisiblePageIndexes(
      (current) =>
        current.length ===
          indexes.length &&
        current.every(
          (
            value,
            index
          ) =>
            value ===
            indexes[index]
        )
          ? current
          : indexes
    );

  }


  /* ==========================================================================
     Actions
  ========================================================================== */

  const photoActions =
    useDigitalAlbumPhotoActions({
      activePageId:
        activePage?.id ??
        null,

      commit:
        session.commit,
    });


  const pageActions =
    useDigitalAlbumPageActions({
      getDocument,

      commit:
        session.commit,

      activePageId:
        activePage?.id ??
        null,

      selectPage,
    });


  /* ==========================================================================
     Return
  ========================================================================== */

  return {
    document,

    activePageId:
      activePage?.id ??
      null,

    activePageIndex,

    activePhotoSlotId:
      resolvedSlot?.id ??
      null,

    visiblePageIndexes,

    selectedPhotoId,

    removeUnplaced:
      (
        slotId:
          string
      ) =>
        session.commit(
          (current) => ({
            ...current,

            pages:
              current.pages.map(
                (page) =>
                  page.id ===
                  activePage?.id
                    ? {
                        ...page,

                        unplacedPhotos:
                          page.unplacedPhotos?.filter(
                            (slot) =>
                              slot.id !==
                              slotId
                          ),
                      }
                    : page
              ),
          })
        ),

    isSaving:
      status ===
      "saving",

    saveStatus:
      status,

    saveConflict:
      conflict,

    canUndo,

    canRedo,

    redo:
      session.redo,

    undo:
      session.undo,

    flush:
      session.flush,

    clearHistory:
      session.clearHistory,

    getDocument,

    ...photoActions,

    ...pageActions,

    changeTheme,

    updatePageContent,

    selectPage,

    selectPhotoSlot,

    handleFlipBookPageChange,

    handleVisiblePagesChange,
  };

}