"use client";
import EditorPhotoDescription from "@/features/editor/components/EditorPhotoDescription/EditorPhotoDescription";
import { DIGITAL_ALBUM_MOBILE_DEFAULT_SNAP_POINT as EDITOR_MOBILE_DEFAULT_SNAP_POINT } from "../../hooks/useDigitalAlbumMobilePanel";
import DigitalAlbumReaderFrame from "../../../components/album-renderer/DigitalAlbumViewer/DigitalAlbumReaderFrame";
import { X } from "lucide-react";
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
import useDigitalAlbumMobilePanel from "../../hooks/useDigitalAlbumMobilePanel";
import useDigitalAlbumPhotoLibrary from "../../hooks/useDigitalAlbumPhotoLibrary";
import { getDigitalAlbumLayout } from "../../../config/digitalAlbumLayouts";
import {
  changeDigitalAlbumPageLayout,
} from "../../../utils/digitalAlbumDocumentOperations";
import { getDigitalAlbumTextOverflow } from "../../../utils/getDigitalAlbumTextOverflow";
import { getProjectPhotoUrl } from "@/features/project-photos/utils/getProjectPhotoUrl";
import type { DigitalAlbumEditorStep } from "../../types/digitalAlbumEditor.types";
import type {
  DigitalAlbumDocument,
  DigitalAlbumDocumentPage,
  DigitalAlbumPageLayout,
  DigitalAlbumPhotoSlot,
} from "../../../types/digitalAlbumDocument.types";
import type { DigitalAlbumPhotoWithPhoto } from "../../../types/digitalAlbumPhoto.types";
import type { PhotoWall } from "@/features/photo-walls/types/photoWall.types";
import {
  EDITOR_MOBILE_FULL_SNAP_POINT,
} from "@/features/editor/components/EditorMobilePanel/EditorMobilePanel";
import { resolveDigitalAlbumPhotoView, type DigitalAlbumPhotoView } from "../../utils/resolveDigitalAlbumPhotoView";
import DigitalAlbumPhotoContext from "../DigitalAlbumPhotoContext/DigitalAlbumPhotoContext";
import { getAlbumVisibleIndexes, getAlbumPhotoUsage } from "../../../utils/digitalAlbumPhotoContext";
import DigitalAlbumPhotoUsageDialog from "../DigitalAlbumPhotoUsageDialog/DigitalAlbumPhotoUsageDialog";
import styles from "./DigitalAlbumEditorView.module.css";
interface Props {
  projectId: string;
  albumId: string;
  document: DigitalAlbumDocument;
  documentVersion: number;
  documentRevision: number;
  photos: DigitalAlbumPhotoWithPhoto[];
  photoWalls: PhotoWall[];
}
export default function DigitalAlbumEditorView({
  projectId,
  albumId,
  document: initialDocument,
  documentVersion,
  documentRevision,
  photos: suppliedPhotos,
  photoWalls,
}: Props) {
  const t = useTranslations("DigitalAlbumEditor.upgrade");
  const photosT = useTranslations("DigitalAlbumEditor.photos");
  const [activeStep, setActiveStep] =
    useState<DigitalAlbumEditorStep>("pages");
  const editor = useDigitalAlbumEditor({
    albumId,
    initialDocument,
    documentVersion,
    documentRevision,
  });
  const { mobilePanelOpen, setMobilePanelOpen, mobileSnapPoint, setMobileSnapPoint, changeMobilePanelOpen } = useDigitalAlbumMobilePanel();
  const [photoView, setPhotoView] = useState<DigitalAlbumPhotoView>(null);
  const [preview, setPreview] = useState<DigitalAlbumDocumentPage | null>(null);
  const [crop, setCrop] = useState<{
    pageId: string;
    allowContain: boolean;
    slot: DigitalAlbumPhotoSlot;
    url: string;
    ratio: number;
    caption: string | null;
  } | null>(null);
  const [exportBusy, setExportBusy] = useState(false);
  const canvas = useRef<HTMLDivElement>(null);
  const deletedPhotoTarget = useRef<{ pageId: string; slotId: string } | null>(null);
  const { updateDescription, photos, photoDialog, usagePhotoId, usagePhoto, usageReferences,
    assetBusy, assetLock, requestPhotoDelete, closePhotoDialog, deleteLibraryPhoto } = useDigitalAlbumPhotoLibrary({
      albumId, suppliedPhotos, editor, exportBusy, onDeleted: () => {
        const target = deletedPhotoTarget.current;
        deletedPhotoTarget.current = null;
        const slot = target && editor.getDocument().pages.find(page => page.id === target.pageId)?.photos.find(item => item.id === target.slotId);
        if (target && slot && !slot.photoId) {
          editor.selectPhotoSlot(target.pageId, target.slotId);
          setPhotoView({ slotId: target.slotId, mode: "pick" });
          setActiveStep("photos");
          setMobileSnapPoint(EDITOR_MOBILE_FULL_SNAP_POINT);
        } else setPhotoView(null);
      },
    });
  const [confirmCover, setConfirmCover] = useState(false);
  const [deletePageId, setDeletePageId] = useState<string | null>(null);
  const coverAction = useRef<(() => void) | null>(null);
  const editingLocked = Boolean(
    preview || crop || confirmCover || deletePageId || usagePhotoId || assetBusy || exportBusy,
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
  }, [editingLocked, assetLock, redo, undo]);
  const activePage = editor.document.pages[editor.activePageIndex];
  const retainedSlots = activePage?.unplacedPhotos?.filter((slot) => slot.photoId) ?? [];
  const activeSlot = activePage?.photos.find(
    (s) => s.id === editor.activePhotoSlotId,
  );
  const contextIndexes = getAlbumVisibleIndexes(editor.visiblePageIndexes, editor.activePageIndex, editor.document.pages.length);
  const pageLabel = contextIndexes.length > 1
    ? t("spreadContext", { from: contextIndexes[0] + 1, to: contextIndexes[contextIndexes.length - 1] + 1 })
    : t("pageContext", { number: (contextIndexes[0] ?? 0) + 1 });
  const contextSlots = contextIndexes.flatMap((index) => {
    const page = editor.document.pages[index];
    return page.photos.map((slot) => ({ pageId: page.id, slot }));
  });
  const photoMode = resolveDigitalAlbumPhotoView(photoView, activeSlot, editor.visiblePageIndexes.includes(editor.activePageIndex));
  const choosingPhoto = photoMode === "pick";
  const activePhoto = photos.find((photo) => photo.photo_id === activeSlot?.photoId);
  const retainedPhotoIds = useMemo(() => new Set(editor.document.pages.flatMap((page) =>
    (page.unplacedPhotos ?? []).flatMap((slot) => slot.photoId ? [slot.photoId] : []))), [editor.document.pages]);
  const photoUsage = useMemo(() => getAlbumPhotoUsage(editor.document.pages), [editor.document.pages]);
  function choosePhoto() {
    if (editingLocked || assetLock.current || !activeSlot) return;
    setPhotoView({ slotId: activeSlot.id, mode: "pick" });
    setMobileSnapPoint(EDITOR_MOBILE_FULL_SNAP_POINT);
  }
  function selectPhotoSlot(pageId: string, slotId: string) {
    if (editingLocked || assetLock.current) return;
    const pages = editor.getDocument().pages;
    const index = pages.findIndex((page) => page.id === pageId);
    const slot = pages[index]?.photos.find((item) => item.id === slotId);
    if (!slot || !editor.visiblePageIndexes.includes(index)) return;
    editor.selectPhotoSlot(pageId, slotId);
    // An empty slot is already an explicit request to add a photo.
    setPhotoView({ slotId: slot.id, mode: slot.photoId ? "context" : "pick" });
    setActiveStep("photos");
    if (window.matchMedia("(max-width: 767px)").matches) {
      setMobileSnapPoint(slot.photoId
        ? EDITOR_MOBILE_DEFAULT_SNAP_POINT
        : EDITOR_MOBILE_FULL_SNAP_POINT);
      setMobilePanelOpen(true);
    }
  }
  function finishChoosingPhoto() {
    const slot = editor.getDocument().pages
      .find((page) => page.id === activePage?.id)?.photos
      .find((item) => item.id === activeSlot?.id);
    setPhotoView(slot?.photoId ? { slotId: slot.id, mode: "context" } : null);
    setMobileSnapPoint(EDITOR_MOBILE_DEFAULT_SNAP_POINT);
  }
  const rendererPhotos = useMemo(() => photos.map((p) => ({
    id: p.photo_id,
    imagePath: p.photo.image_path,
    description: p.description,
  })), [photos]);
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
  async function beforeExport() {
    if (preview || crop || confirmCover || deletePageId || usagePhotoId || assetLock.current) return false;
    (document.activeElement as HTMLElement | null)?.blur();
    await new Promise((resolve) => setTimeout(resolve, 0));
    if (canvas.current?.querySelector('[data-album-missing-photo="true"]')) {
      toast.error(t("photoError"));
      return false;
    }
    if (canvas.current && getDigitalAlbumTextOverflow(canvas.current).length) {
      toast.error(t("overflow"));
      return false;
    }
    const saved = await editor.flush();
    if (!saved) toast.error(t("saveError"));
    return saved;
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
        url: getProjectPhotoUrl(photo.photo.image_path),
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
        onStepChange={(step) => { if (assetLock.current) return; closePhotoDialog(); setPhotoView(null); setMobileSnapPoint(EDITOR_MOBILE_DEFAULT_SNAP_POINT); setActiveStep(step); }}
        headerProps={{
          projectId,
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
            <div className={styles.tools} hidden={editor.saveStatus !== "error"}>
              {editor.saveStatus === "error" && (
                <p role="alert">
                  {t(editor.saveConflict ? "saveConflict" : "saveError")}
                </p>
              )}

            </div>
            <fieldset disabled={editingLocked} className={styles.fieldset}>
              <DigitalAlbumEditorSidebar
                onChangeDesign={id => { if (editingLocked || assetLock.current) return; editor.selectPage(id); setPhotoView(null); setActiveStep("templates"); }}
                onDescriptionSave={updateDescription}
                designPageControls={<>
                  {contextIndexes.length > 1 && (
                    <div className={styles.pageSelector} aria-label={t("layoutTarget")}>
                      {contextIndexes.map((index) => <Button key={editor.document.pages[index].id}
                        type="button" variant="outline" aria-pressed={index === editor.activePageIndex}
                        onClick={() => editor.selectPage(editor.document.pages[index].id)}>
                        {t("pageContext", { number: index + 1 })}
                      </Button>)}
                    </div>
                  )}
                  {retainedSlots.length > 0 && (
                    <section className={styles.retained} aria-label={t("unplaced", { count: retainedSlots.length })}>
                      <p className={styles.retainedTitle}>
                        {t("unplaced", { count: retainedSlots.length })}
                      </p>
                      <ul className={styles.retainedPhotos}>
                        {retainedSlots.map((slot, index) => {
                          const photo = photos.find((p) => p.photo_id === slot.photoId);
                          const removeLabel = `${t("removeRetained")} ${index + 1}`;
                          return (
                            <li key={slot.id} className={styles.retainedPhoto}>
                              {photo && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={getProjectPhotoUrl(photo.photo.image_path)} alt="" loading="lazy" />
                              )}
                              <button
                                type="button"
                                className={styles.removeRetained}
                                disabled={editingLocked}
                                aria-label={removeLabel}
                                title={removeLabel}
                                onClick={() => editor.removeUnplaced(slot.id)}
                              >
                                <X size={14} aria-hidden="true" />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  )}
                </>}
                photoContext={photoMode === "context" && activeSlot ? (
                  <DigitalAlbumPhotoContext
                    key={activeSlot.id}
                    label={pageLabel}
                    imageUrl={activePhoto ? getProjectPhotoUrl(activePhoto.photo.image_path) : undefined}
                    slots={contextSlots.map(({ slot }, index) => ({ slot, number: index + 1 }))}
                    activeSlotId={activeSlot.id}
                    disabled={editingLocked}
                    canCrop={Boolean(activePhoto)}
                    descriptionControl={activePhoto && <>
                      <EditorPhotoDescription value={activePhoto.description} disabled={editingLocked} onSave={value => updateDescription(activePhoto.photo_id, value)} />
                      {activeSlot.caption != null && <EditorPhotoDescription legacy value={activeSlot.caption} disabled={editingLocked}
                        onSave={async value => { editor.updateSlot(activeSlot.id, slot => ({ ...slot, caption: value })); }}
                        onReset={() => editor.updateSlot(activeSlot.id, slot => { const next = { ...slot }; delete next.caption; return next; })} />}
                    </>}
                    onBack={() => setPhotoView(null)}
                    onChoose={choosePhoto}
                    onCrop={startCrop}
                    onRemove={() => {
                      if (editingLocked || assetLock.current) return;
                      editor.removePhotoFromPage(activeSlot.id);
                      setPhotoView({ slotId: activeSlot.id, mode: "pick" });
                      setMobileSnapPoint(EDITOR_MOBILE_FULL_SNAP_POINT);
                    }}
                    onSwap={(targetId) => {
                      if (editingLocked || assetLock.current) return;
                      const target = contextSlots.find(({ slot }) => slot.id === targetId)?.slot;
                      if (target?.photoId) {
                        editor.swapPhotoSlots(activeSlot.id, targetId);
                        setMobileSnapPoint(EDITOR_MOBILE_DEFAULT_SNAP_POINT);
                      }
                    }}
                  />
                ) : undefined}
                pickerPageLabel={choosingPhoto ? pageLabel : undefined}
                albumId={albumId}
                activeStep={activeStep}
                photos={photos}
                photoWalls={photoWalls}
                pages={editor.document.pages}
                theme={editor.document.theme}
                activePageId={editor.activePageId}
                pickerTargetId={choosingPhoto ? activeSlot?.id ?? null : null}
                photoUsage={photoUsage}
                retainedPhotoIds={retainedPhotoIds}
                onCancelPicker={finishChoosingPhoto}
                activePageLayout={activePage?.layout ?? null}
                visiblePageIndexes={editor.visiblePageIndexes}
                selectedPhotoId={choosingPhoto ? editor.selectedPhotoId : null}
                onRequestDeletePhoto={(id) => {
                  if (!editingLocked && !assetLock.current) {
                      const placement = contextSlots.find(item => item.slot.id === activeSlot?.id && item.slot.photoId === id)
                        ?? contextSlots.find(item => item.slot.photoId === id);
                      deletedPhotoTarget.current = placement ? { pageId: placement.pageId, slotId: placement.slot.id } : null;
                      requestPhotoDelete(id);
                    }
                }}
                onSelectPhoto={(id) => {
                  if (editingLocked || assetLock.current) return;
                  if (activeSlot && choosingPhoto) {
                    editor.selectPhoto(activeSlot.id, id);
                    const placed = editor
                      .getDocument()
                      .pages.find((page) => page.id === activePage.id)
                      ?.photos.find((slot) => slot.id === activeSlot.id);
                    if (placed?.photoId === id) {
                      finishChoosingPhoto();
                      setMobileSnapPoint(EDITOR_MOBILE_DEFAULT_SNAP_POINT);
                    }
                  } else toast.info(t("noSlots"));
                }}
                onSelectPage={(id) => { if (assetLock.current) return; closePhotoDialog(); setPhotoView(null); editor.selectPage(id); }}
                onChangePageLayout={(id, layout) => {
                  if (editingLocked || assetLock.current) return;
                  const page = editor
                    .getDocument()
                    .pages.find((p) => p.id === id);
                  if (page && page.layout !== layout) {
                    setPhotoView(null);
                    const nextSlots = getDigitalAlbumLayout(layout).photoSlotCount;
                    const currentSlots = getDigitalAlbumLayout(page.layout).photoSlotCount;
                    if (nextSlots < currentSlots) {
                      setPreview(changeDigitalAlbumPageLayout(page, layout));
                    } else {
                      void editor.changePageLayout(page.id, layout);
                    }
                  }
                }}
                onChangeTheme={editor.changeTheme}
                onAddPage={async (layout: DigitalAlbumPageLayout) => {
                  if (editingLocked || assetLock.current) return;
                  await editor.addPage(layout);
                  setActiveStep(
                    getDigitalAlbumLayout(layout).photoSlotCount
                      ? "photos"
                      : "templates",
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
                  setDeletePageId(id);
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
        <div className={styles.canvas}>
          <DigitalAlbumReaderFrame document={displayDocument} photos={rendererPhotos}
            editorMode disabled={editingLocked} visiblePageIndexes={editor.visiblePageIndexes}>
          {({ navigationRef, soundEnabled }) => <div ref={canvas} className={styles.canvas}><DigitalAlbumRenderer
            navigationRef={navigationRef}
            soundEnabled={soundEnabled}
            editable
            document={displayDocument}
            photos={rendererPhotos}
            activePageIndex={
              editor.activePageIndex >= 0 ? editor.activePageIndex : undefined
            }
            activePhotoSlotId={activeStep === "photos" && photoMode !== "library" ? editor.activePhotoSlotId : null}
            visiblePageIndexes={editor.visiblePageIndexes}
            onSelectPhotoSlot={
              editingLocked ? undefined : selectPhotoSlot
            }
            onPageContentChange={
              editingLocked ? undefined : editor.updatePageContent
            }
            onPageChange={editor.handleFlipBookPageChange}
            onTurnStart={() => {
              setPhotoView(null);
              changeMobilePanelOpen(false);
            }}
            onVisiblePagesChange={(indexes) => {
              editor.handleVisiblePagesChange(indexes);
              const lastIndex = editor.getDocument().pages.length - 1;
              if (
                lastIndex > 0 &&
                indexes.includes(lastIndex) &&
                !editor.visiblePageIndexes.includes(lastIndex)
              ) {
                setActiveStep("pages");
                if (window.matchMedia("(max-width: 767px)").matches) {
                  setMobileSnapPoint(EDITOR_MOBILE_DEFAULT_SNAP_POINT);
                  setMobilePanelOpen(true);
                }
              }
            }}
          /></div>}
          </DigitalAlbumReaderFrame>
        </div>
      </DigitalAlbumEditor>
      {photoDialog?.used && (
        <DigitalAlbumPhotoUsageDialog key={photoDialog.photoId}
          imageUrl={usagePhoto ? getProjectPhotoUrl(usagePhoto.photo.image_path) : undefined}
          references={usageReferences}
          onClose={closePhotoDialog}
          onNavigate={(reference) => {
            closePhotoDialog();
            setPhotoView(null);
            editor.selectPage(reference.pageId);
            setActiveStep(reference.retained ? "templates" : "photos");
            setMobilePanelOpen(false);
          }}
          deleting
          busy={assetBusy}
          onDelete={deleteLibraryPhoto}
        />
      )}
      <ConfirmDialog
        open={Boolean(photoDialog && !photoDialog.used)}
        variant="danger" loading={assetBusy}
        title={photosT("removeConfirm.title")}
        description={photosT("removeConfirm.description")}
        confirmText={photosT("removeConfirm.confirm")} cancelText={t("cancel")}
        onClose={closePhotoDialog}
        onConfirm={async () => { await deleteLibraryPhoto(); }}
      />
      <ConfirmDialog
        open={preview !== null}
        title={t("layoutConfirmTitle")}
        description={preview?.unplacedPhotos?.some((slot) => slot.photoId)
          ? t("layoutConfirmRetained", { count: preview.unplacedPhotos.filter((slot) => slot.photoId).length })
          : undefined}
        confirmText={t("apply")}
        cancelText={t("cancel")}
        onClose={() => setPreview(null)}
        onConfirm={() => {
          if (!preview) return;
          void editor.changePageLayout(preview.id, preview.layout);
          setPreview(null);
        }}
      />
      <ConfirmDialog
        open={deletePageId !== null}
        variant="danger"
        title={t("deletePageTitle")}
        description={t("deletePageDescription")}
        confirmText={t("deletePageConfirm")}
        cancelText={t("cancel")}
        onClose={() => setDeletePageId(null)}
        onConfirm={() => {
          if (deletePageId && !assetLock.current && !exportBusy) {
            void editor.deletePage(deletePageId);
          }
          setDeletePageId(null);
        }}
      />
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
                setMobileSnapPoint(EDITOR_MOBILE_DEFAULT_SNAP_POINT);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
