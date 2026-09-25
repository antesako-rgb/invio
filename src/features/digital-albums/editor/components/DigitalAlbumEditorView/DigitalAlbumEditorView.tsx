"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/common/ConfirmDialog";
import DigitalAlbumRenderer from "../../../components/album-renderer/DigitalAlbumRenderer/DigitalAlbumRenderer";
import DigitalAlbumEditor from "../DigitalAlbumEditor/DigitalAlbumEditor";
import DigitalAlbumEditorSidebar from "../DigitalAlbumEditorSidebar/DigitalAlbumEditorSidebar";
import DigitalAlbumPhotoPositionEditor from "../DigitalAlbumPhotoPositionEditor/DigitalAlbumPhotoPositionEditor";
import useDigitalAlbumEditor from "../../hooks/album-editor/useDigitalAlbumEditor";
import { getDigitalAlbumLayout } from "../../../config/digitalAlbumLayouts";
import {
  changeDigitalAlbumPageLayout,
  albumPhotoUsage,
} from "../../../utils/digitalAlbumDocumentOperations";
import { getDigitalAlbumTextOverflow } from "../../../utils/getDigitalAlbumTextOverflow";
import { getEventPhotoUrl } from "@/features/event-photos/utils/getEventPhotoUrl";
import type { DigitalAlbumEditorStep } from "../../types/digitalAlbumEditor.types";
import type {
  DigitalAlbumDocument,
  DigitalAlbumDocumentPage,
  DigitalAlbumPageLayout,
  DigitalAlbumPhotoSlot,
} from "../../../types/digitalAlbumDocument.types";
import type { DigitalAlbumPhotoWithPhoto } from "../../../types/digitalAlbumPhoto.types";
import type { PhotoWall } from "@/features/invitations/types/photoWallPhoto.types";
import {
  type EditorMobilePanelChangeDetails,
  EDITOR_MOBILE_DEFAULT_SNAP_POINT,
  EDITOR_MOBILE_FULL_SNAP_POINT,
} from "@/features/editor/components/EditorMobilePanel/EditorMobilePanel";
import styles from "./DigitalAlbumEditorView.module.css";
interface Props {
  albumId: string;
  document: DigitalAlbumDocument;
  documentVersion: number;
  documentRevision: number;
  photos: DigitalAlbumPhotoWithPhoto[];
  photoWalls: PhotoWall[];
}
export default function DigitalAlbumEditorView({
  albumId,
  document: initialDocument,
  documentVersion,
  documentRevision,
  photos,
  photoWalls,
}: Props) {
  const t = useTranslations("DigitalAlbumEditor.upgrade");
  const [activeStep, setActiveStep] =
    useState<DigitalAlbumEditorStep>("photos");
  const editor = useDigitalAlbumEditor({
    albumId,
    initialDocument,
    documentVersion,
    documentRevision,
  });
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [mobileSnapPoint, setMobileSnapPoint] = useState(
    EDITOR_MOBILE_DEFAULT_SNAP_POINT,
  );
  const pendingMobileSlot = useRef<{ pageId: string; slotId: string } | null>(
    null,
  );

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)");
    function handleViewportChange() {
      if (!mobile.matches) {
        setMobilePanelOpen(false);
        pendingMobileSlot.current = null;
      }
    }
    mobile.addEventListener("change", handleViewportChange);
    return () => mobile.removeEventListener("change", handleViewportChange);
  }, []);

  function changeMobilePanelOpen(
    open: boolean,
    details?: EditorMobilePanelChangeDetails,
  ) {
    // This is a non-modal editing panel: interacting with the canvas must not
    // dismiss it. OpenPageFlip can retarget the slot's pointer release to the
    // book, so checking the event target cannot reliably identify that gesture.
    // Explicit close, Escape and handle swipe still close the panel.
    if (
      !open &&
      (details?.reason === "outside-press" || details?.reason === "focus-out")
    ) {
      details.cancel();
      return;
    }
    setMobilePanelOpen(open);
    if (!open) pendingMobileSlot.current = null;
  }

  const [preview, setPreview] = useState<DigitalAlbumDocumentPage | null>(null);
  const [crop, setCrop] = useState<{
    pageId: string;
    allowContain: boolean;
    slot: DigitalAlbumPhotoSlot;
    url: string;
    ratio: number;
    caption: string | null;
  } | null>(null);
  const [overflow, setOverflow] = useState<string[]>([]);
  const [exportBusy, setExportBusy] = useState(false);
  const [assetBusy, setAssetBusy] = useState(false);
  const canvas = useRef<HTMLDivElement>(null);
  const assetLock = useRef(false);
  const [confirmCover, setConfirmCover] = useState(false);
  const coverAction = useRef<(() => void) | null>(null);
  const editingLocked = Boolean(
    preview || crop || confirmCover || assetBusy || exportBusy,
  );

  function requestCoverChange(action: () => void) {
    if (editingLocked || assetLock.current) return;
    coverAction.current = action;
    setConfirmCover(true);
  }

  function cancelCoverChange() {
    coverAction.current = null;
    setConfirmCover(false);
  }

  function applyCoverChange() {
    const action = coverAction.current;
    coverAction.current = null;
    setConfirmCover(false);
    if (!assetLock.current && !exportBusy) action?.();
  }

  const { undo, redo } = editor;

  useEffect(() => {
    function handleHistory(event: KeyboardEvent) {
      if (
        editingLocked ||
        assetLock.current ||
        event.defaultPrevented ||
        event.altKey ||
        !(event.ctrlKey || event.metaKey) ||
        event.key.toLowerCase() !== "z"
      )
        return;
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest(
          'input, textarea, select, [contenteditable], [role="textbox"], [role="dialog"], [role="alertdialog"]',
        )
      )
        return;
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
    }
    window.addEventListener("keydown", handleHistory);
    return () => window.removeEventListener("keydown", handleHistory);
  }, [editingLocked, redo, undo]);
  const activePage = editor.document.pages[editor.activePageIndex];
  const activeSlot = activePage?.photos.find(
    (s) => s.id === editor.activePhotoSlotId,
  );
  const rendererPhotos = photos.map((p) => ({
    id: p.photo_id,
    imagePath: p.photo.image_path,
    description: p.description,
  }));
  const displayDocument = useMemo(
    () =>
      preview
        ? {
            ...editor.document,
            pages: editor.document.pages.map((p) =>
              p.id === preview.id ? preview : p,
            ),
          }
        : editor.document,
    [preview, editor.document],
  );
  useEffect(() => {
    const root = canvas.current;
    if (!root) return;
    let frame = 0;
    let disposed = false;
    const check = () => {
      if (disposed) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = getDigitalAlbumTextOverflow(root);
        setOverflow((previous) =>
          previous.join() === next.join() ? previous : next,
        );
      });
    };
    const resize = new ResizeObserver(check);
    resize.observe(root);
    const mutation = new MutationObserver(check);
    mutation.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    void document.fonts.ready.then(check);
    check();
    return () => {
      disposed = true;
      resize.disconnect();
      mutation.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [displayDocument, editor.visiblePageIndexes]);
  async function beforeExport() {
    if (preview || crop || confirmCover || assetLock.current) return false;
    (document.activeElement as HTMLElement | null)?.blur();
    await new Promise((resolve) => setTimeout(resolve, 0));
    if (canvas.current && getDigitalAlbumTextOverflow(canvas.current).length) {
      toast.error(t("overflow"));
      return false;
    }
    const saved = await editor.flush();
    if (!saved) toast.error(t("saveError"));
    return saved;
  }
  async function beforeRemovePhoto(photoId: string) {
    if (assetLock.current || editingLocked) return false;
    assetLock.current = true;
    setAssetBusy(true);
    if (albumPhotoUsage(editor.getDocument(), photoId).length) {
      toast.error(t("photoInUse"));
      assetLock.current = false;
      setAssetBusy(false);
      return false;
    }
    if (!(await editor.flush())) {
      toast.error(t("saveError"));
      assetLock.current = false;
      setAssetBusy(false);
      return false;
    }
    editor.clearHistory();
    return true;
  }
  function afterRemovePhoto() {
    assetLock.current = false;
    setAssetBusy(false);
  }
  function startCrop() {
    if (!activeSlot?.photoId) return;
    const photo = photos.find((p) => p.photo_id === activeSlot.photoId);
    const element = canvas.current?.querySelector<HTMLElement>(
      `[data-album-slot="${CSS.escape(activeSlot.id)}"]`,
    );
    // Layout dimensions exclude the temporary perspective transform during a flip.
    const width = element?.clientWidth;
    const height = element?.clientHeight;
    if (photo && width && height)
      setCrop({
        pageId: activePage.id,
        allowContain: getDigitalAlbumLayout(activePage.layout).supportsContain,
        slot: activeSlot,
        url: getEventPhotoUrl(photo.photo.image_path),
        ratio: width / height,
        caption: photo.description,
      });
  }
  return (
    <>
      <DigitalAlbumEditor
        mobilePanelOpen={mobilePanelOpen}
        onMobilePanelOpenChange={changeMobilePanelOpen}
        mobileSnapPoint={mobileSnapPoint}
        onMobileSnapPointChange={setMobileSnapPoint}
        albumId={albumId}
        activeStep={activeStep}
        onStepChange={setActiveStep}
        headerProps={{
          onExportBusy: setExportBusy,
          saveStatus: editor.saveStatus,
          saveConflict: editor.saveConflict,
          canUndo: editor.canUndo,
          canRedo: editor.canRedo,
          onRedo: editor.redo,
          onUndo: editor.undo,
          onRetry: () => {
            void editor.flush();
          },
          beforeExport,
          exportDisabled: editingLocked,
        }}
        sidebar={
          <>
            <div className={styles.tools}>
              {editor.saveStatus === "error" && (
                <p role="alert">
                  {t(editor.saveConflict ? "saveConflict" : "saveError")}
                </p>
              )}
              {!!overflow.length && <p role="alert">{t("overflow")}</p>}
              {preview ? (
                <div className={styles.previewActions}>
                  <p>{t("layoutPreview")}</p>
                  <Button
                    type="button"
                    onClick={() => {
                      void editor.changePageLayout(preview.id, preview.layout);
                      setPreview(null);
                    }}
                  >
                    {t("apply")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPreview(null)}
                  >
                    {t("cancel")}
                  </Button>
                </div>
              ) : (
                <>
                  {activePage && (
                    <p>
                      {t("pageContext", {
                        number: editor.activePageNumber ?? 1,
                      })}
                      {editor.activePageIndex === 0
                        ? ` \u00b7 ${t("frontCover")}`
                        : editor.activePageIndex ===
                            editor.document.pages.length - 1
                          ? ` \u00b7 ${t("backCover")}`
                          : ""}
                    </p>
                  )}
                  {activeStep === "photos" && activePage && (
                    <div className={styles.slots}>
                      {activePage.photos.map((slot, index) => (
                        <Button
                          key={slot.id}
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={editingLocked}
                          aria-pressed={slot.id === editor.activePhotoSlotId}
                          onClick={() =>
                            editor.selectPhotoSlot(activePage.id, slot.id)
                          }
                        >
                          {t("slot", { number: index + 1 })}
                        </Button>
                      ))}
                      {!activePage.photos.length && <p>{t("noSlots")}</p>}
                      {activeSlot?.photoId && (
                        <Button
                          type="button"
                          disabled={editingLocked}
                          onClick={startCrop}
                        >
                          {t("position")}
                        </Button>
                      )}
                      {activePage.unplacedPhotos
                        ?.filter((s) => s.photoId)
                        .map((slot) => {
                          const photo = photos.find(
                            (p) => p.photo_id === slot.photoId,
                          );
                          return (
                            <div key={slot.id} className={styles.retained}>
                              {photo && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={getEventPhotoUrl(photo.photo.image_path)}
                                  alt=""
                                />
                              )}
                              <Button
                                type="button"
                                disabled={editingLocked}
                                onClick={() => editor.removeUnplaced(slot.id)}
                              >
                                {t("removeRetained")}
                              </Button>
                            </div>
                          );
                        })}
                      {!!activePage.unplacedPhotos?.filter((s) => s.photoId)
                        .length && (
                        <p>
                          {t("unplaced", {
                            count: activePage.unplacedPhotos.filter(
                              (s) => s.photoId,
                            ).length,
                          })}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            <fieldset disabled={editingLocked} className={styles.fieldset}>
              <DigitalAlbumEditorSidebar
                albumId={albumId}
                activeStep={activeStep}
                photos={photos}
                photoWalls={photoWalls}
                pages={editor.document.pages}
                theme={editor.document.theme}
                activePageId={editor.activePageId}
                activePageNumber={editor.activePageNumber}
                activePageLayout={activePage?.layout ?? null}
                visiblePageIndexes={editor.visiblePageIndexes}
                selectedPhotoId={editor.selectedPhotoId}
                beforeRemovePhoto={beforeRemovePhoto}
                afterRemovePhoto={afterRemovePhoto}
                onSelectPhoto={(id) => {
                  if (editingLocked || assetLock.current) return;
                  if (activeSlot) {
                    editor.selectPhoto(activeSlot.id, id);
                    const pending = pendingMobileSlot.current;
                    const placed = editor
                      .getDocument()
                      .pages.find((page) => page.id === pending?.pageId)
                      ?.photos.find((slot) => slot.id === pending?.slotId);
                    if (pending && placed?.photoId === id) {
                      setMobileSnapPoint(EDITOR_MOBILE_DEFAULT_SNAP_POINT);
                      pendingMobileSlot.current = null;
                    }
                  } else toast.info(t("noSlots"));
                }}
                onRemovePhotoFromPage={() => {
                  if (editingLocked || assetLock.current) return;
                  if (activeSlot)
                    void editor.removePhotoFromPage(activeSlot.id);
                }}
                onSelectPage={editor.selectPage}
                onChangePageLayout={(id, layout) => {
                  if (editingLocked || assetLock.current) return;
                  const page = editor
                    .getDocument()
                    .pages.find((p) => p.id === id);
                  if (page)
                    setPreview(changeDigitalAlbumPageLayout(page, layout));
                }}
                onChangeTheme={editor.changeTheme}
                onAddPage={async (layout: DigitalAlbumPageLayout) => {
                  if (editingLocked || assetLock.current) return;
                  await editor.addPage(layout);
                  setActiveStep(
                    getDigitalAlbumLayout(layout).photoSlotCount
                      ? "photos"
                      : "design",
                  );
                }}
                onDuplicatePage={(id) => {
                  if (!editingLocked && !assetLock.current)
                    void editor.duplicatePage(id);
                }}
                onDeletePage={(id) => {
                  if (editingLocked || assetLock.current) return;
                  const pages = editor.getDocument().pages;
                  const index = pages.findIndex((page) => page.id === id);
                  if (index < 0 || pages.length <= 1) return;
                  const remove = () => {
                    void editor.deletePage(id);
                  };
                  if (index === 0 || index === pages.length - 1)
                    requestCoverChange(remove);
                  else remove();
                }}
                onSwapPages={(source, target) => {
                  if (editingLocked || assetLock.current || source === target)
                    return;
                  const pages = editor.getDocument().pages;
                  const covers = [pages[0]?.id, pages.at(-1)?.id];
                  const move = () => {
                    void editor.swapPages(source, target);
                  };
                  if (covers.includes(source) || covers.includes(target))
                    requestCoverChange(move);
                  else move();
                }}
              />
            </fieldset>
          </>
        }
      >
        <div ref={canvas} className={styles.canvas}>
          <DigitalAlbumRenderer
            editable
            document={displayDocument}
            photos={rendererPhotos}
            activePageIndex={
              editor.activePageIndex >= 0 ? editor.activePageIndex : undefined
            }
            activePhotoSlotId={editor.activePhotoSlotId}
            visiblePageIndexes={editor.visiblePageIndexes}
            onSelectPhotoSlot={
              editingLocked
                ? undefined
                : (page, slot) => {
                    editor.selectPhotoSlot(page, slot);
                    setActiveStep("photos");
                    const selected = editor
                      .getDocument()
                      .pages.find((item) => item.id === page)
                      ?.photos.find((item) => item.id === slot);
                    if (
                      window.matchMedia("(max-width: 767px)").matches &&
                      selected
                    ) {
                      pendingMobileSlot.current = selected.photoId
                        ? null
                        : { pageId: page, slotId: slot };
                      setMobileSnapPoint(
                        selected.photoId
                          ? EDITOR_MOBILE_DEFAULT_SNAP_POINT
                          : EDITOR_MOBILE_FULL_SNAP_POINT,
                      );
                      setMobilePanelOpen(true);
                    }
                  }
            }
            onPageContentChange={
              editingLocked ? undefined : editor.updatePageContent
            }
            onPageChange={editor.handleFlipBookPageChange}
            onVisiblePagesChange={editor.handleVisiblePagesChange}
          />
        </div>
      </DigitalAlbumEditor>
      <ConfirmDialog
        open={confirmCover}
        title={t("coverChangeTitle")}
        description={t("coverChange")}
        confirmText={t("confirm")}
        cancelText={t("cancel")}
        onConfirm={applyCoverChange}
        onClose={cancelCoverChange}
      />
      <Dialog
        open={!!crop}
        onOpenChange={(open) => {
          if (!open) setCrop(null);
        }}
      >
        <DialogContent className={styles.cropDialog}>
          <DialogHeader>
            <DialogTitle>{t("position")}</DialogTitle>
          </DialogHeader>
          {crop && (
            <DigitalAlbumPhotoPositionEditor
              key={crop.slot.id}
              slot={crop.slot}
              imageUrl={crop.url}
              aspectRatio={crop.ratio}
              inheritedCaption={crop.caption}
              allowContain={crop.allowContain}
              onCancel={() => setCrop(null)}
              onApply={(slot) => {
                void editor.updateSlot(slot.id, () => slot, crop.pageId);
                setCrop(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
