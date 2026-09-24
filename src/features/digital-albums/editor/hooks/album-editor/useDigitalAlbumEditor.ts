"use client";
import { DigitalAlbumSaveConflict } from "../../../utils/digitalAlbumRevision";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { updateDigitalAlbumDocumentAction } from "../../../actions/album/updateDigitalAlbumDocumentAction";
import { parseDigitalAlbumDocument } from "../../../utils/parseDigitalAlbumDocument";
import { DigitalAlbumSession } from "../../state/DigitalAlbumSession";
import useDigitalAlbumPageActions from "./useDigitalAlbumPageActions";
import useDigitalAlbumPhotoActions from "./useDigitalAlbumPhotoActions";
import type {
  DigitalAlbumDocument,
  DigitalAlbumPageContent,
  DigitalAlbumTheme,
} from "../../../types/digitalAlbumDocument.types";
interface Options {
  albumId: string;
  initialDocument: DigitalAlbumDocument;
  documentVersion: number;
  documentRevision: number;
}
export default function useDigitalAlbumEditor({
  albumId,
  initialDocument,
  documentVersion,
  documentRevision,
}: Options) {
  const [session] = useState(
    () =>
      new DigitalAlbumSession(
        initialDocument,
        documentVersion,
        documentRevision,
        async (document, version, revision) => {
          const result = await updateDigitalAlbumDocumentAction({
            albumId,
            document,
            documentVersion: version,
            documentRevision: revision,
          });
          if (!result.success && "code" in result && result.code === "CONFLICT")
            throw new DigitalAlbumSaveConflict();
          if (!result.success) throw new Error("Album save failed");
          return {
            document: parseDigitalAlbumDocument(result.data.document),
            version: result.data.document_version,
            revision: result.data.document_revision,
          };
        },
      ),
  );
  const { document, status, canUndo, canRedo, conflict } = useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
    session.getSnapshot,
  );
  const getDocument = () => session.getSnapshot().document;
  const [activePageId, setActivePageId] = useState<string | null>(
    initialDocument.pages[0]?.id ?? null,
  );
  const [activePhotoSlotId, setActivePhotoSlotId] = useState<string | null>(
    initialDocument.pages[0]?.photos[0]?.id ?? null,
  );
  const [visiblePageIndexes, setVisiblePageIndexes] = useState<number[]>(
    initialDocument.pages.length ? [0] : [],
  );
  const sidebarSelectedPageIdRef = useRef<string | null>(null);
  const visiblePageSelectionRef = useRef<string | null>(null);
  const foundIndex = document.pages.findIndex((p) => p.id === activePageId);
  const activePageIndex =
    foundIndex >= 0 ? foundIndex : document.pages.length ? 0 : -1;
  const activePage = document.pages[activePageIndex];
  const activePageNumber = activePageIndex >= 0 ? activePageIndex + 1 : null;
  const resolvedSlot =
    activePage?.photos.find((s) => s.id === activePhotoSlotId) ??
    activePage?.photos[0];
  const selectedPhotoId = resolvedSlot?.photoId ?? null;
  useEffect(() => {
    function warn(event: BeforeUnloadEvent) {
      if (session.getSnapshot().status !== "saved") {
        event.preventDefault();
        event.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [session]);
  async function changeTheme(theme: DigitalAlbumTheme) {
    session.commit((d) => ({ ...d, theme }));
  }
  async function updatePageContent(
    pageId: string,
    content: Partial<DigitalAlbumPageContent>,
  ) {
    session.commit((d) => ({
      ...d,
      pages: d.pages.map((p) =>
        p.id === pageId ? { ...p, content: { ...p.content, ...content } } : p,
      ),
    }));
  }
  function selectPage(pageId: string) {
    const page = getDocument().pages.find((p) => p.id === pageId);
    if (!page) return;
    visiblePageSelectionRef.current = null;
    sidebarSelectedPageIdRef.current = pageId;
    setActivePageId(pageId);
    setActivePhotoSlotId(page.photos[0]?.id ?? null);
  }
  function selectPhotoSlot(pageId: string, slotId: string) {
    const index = getDocument().pages.findIndex((p) => p.id === pageId);
    if (!visiblePageIndexes.includes(index)) return;
    if (!getDocument().pages[index]?.photos.some((s) => s.id === slotId))
      return;
    sidebarSelectedPageIdRef.current = null;
    visiblePageSelectionRef.current = pageId;
    setActivePageId(pageId);
    setActivePhotoSlotId(slotId);
  }
  function handleFlipBookPageChange(index: number) {
    if (visiblePageSelectionRef.current) {
      visiblePageSelectionRef.current = null;
      // Selecting the other side of a spread may report the same spread again.
      // A real turn to a different page must still update the editor selection.
      if (visiblePageIndexes.includes(index)) return;
    }
    const selected = getDocument().pages.findIndex(
      (p) => p.id === sidebarSelectedPageIdRef.current,
    );
    const spreadStart =
      selected <= 0 ? 0 : selected % 2 === 0 ? selected - 1 : selected;
    if (
      sidebarSelectedPageIdRef.current &&
      (index === spreadStart || index === selected)
    ) {
      sidebarSelectedPageIdRef.current = null;
      return;
    }
    const page = getDocument().pages[index];
    if (page) {
      setActivePageId(page.id);
      setActivePhotoSlotId(page.photos[0]?.id ?? null);
    }
  }
  function handleVisiblePagesChange(indexes: number[]) {
    setVisiblePageIndexes((current) =>
      current.length === indexes.length &&
      current.every((v, i) => v === indexes[i])
        ? current
        : indexes,
    );
  }
  const photoActions = useDigitalAlbumPhotoActions({
    activePageId: activePage?.id ?? null,
    commit: session.commit,
  });
  const pageActions = useDigitalAlbumPageActions({
    getDocument,
    commit: session.commit,
    activePageId: activePage?.id ?? null,
    selectPage,
  });
  return {
    document,
    activePageId: activePage?.id ?? null,
    activePageIndex,
    activePageNumber,
    activePhotoSlotId: resolvedSlot?.id ?? null,
    visiblePageIndexes,
    selectedPhotoId,
    removeUnplaced: (slotId: string) =>
      session.commit((d) => ({
        ...d,
        pages: d.pages.map((p) =>
          p.id === activePage?.id
            ? {
                ...p,
                unplacedPhotos: p.unplacedPhotos?.filter(
                  (s) => s.id !== slotId,
                ),
              }
            : p,
        ),
      })),
    isSaving: status === "saving",
    saveStatus: status,
    saveConflict: conflict,
    canUndo,
    canRedo,
    redo: session.redo,
    undo: session.undo,
    flush: session.flush,
    clearHistory: session.clearHistory,
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
