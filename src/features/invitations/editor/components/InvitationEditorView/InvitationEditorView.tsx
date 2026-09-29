"use client";
import { type FormEvent, useCallback, useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { ArrowLeft, Undo2, Redo2, Eye, Globe, ExternalLink } from "lucide-react";
import EditorHeader from "@/features/editor/components/EditorHeader/EditorHeader";
import EditorSaveStatus from "@/features/editor/components/EditorSaveStatus/EditorSaveStatus";
import EditorPhotoFraming from "@/features/editor/components/EditorPhotoFraming/EditorPhotoFraming";
import type { EditorPhotoFramingValue } from "@/features/editor/types/editorPhotoFraming.types";
import { getProjectPhotoUrl } from "@/features/project-photos/utils/getProjectPhotoUrl";
import InvitationEditor, { type InvitationEditorTab } from "../InvitationEditor/InvitationEditor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { InvitationPageType } from "../../../config/invitationPageTypes";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog/dialog";
import { useInvitationEditor } from "../../hooks/useInvitationEditor";
import { createInvitationPage, changeInvitationPageDesign, duplicateInvitationPage, moveInvitationPage, removeInvitationPhotoReferences } from "../../../utils/invitationDocumentOperations";
import { uploadInvitationPhotoAction, addInvitationPhotosAction, removeInvitationPhotoAction } from "../../../actions/photos/invitationPhotoActions";
import { setInvitationPublishedAction } from "../../../actions/invitation/setInvitationPublishedAction";
import { updateInvitationAction } from "../../../actions/invitation/updateInvitationAction";
import InvitationRenderer from "../../../components/invitation-renderer/InvitationRenderer";
import InvitationCanvas from "../InvitationCanvas/InvitationCanvas";
import InvitationPageNavigator from "../InvitationPageNavigator/InvitationPageNavigator";
import { applyInvitationTemplate, resolveInvitationPageDateTime, setInvitationDateTime } from "../../../utils/invitationSharedDateTime";
import InvitationPagesPanel from "../InvitationPagesPanel/InvitationPagesPanel";
import InvitationContentPanel from "../InvitationContentPanel/InvitationContentPanel";
import InvitationTemplatesPanel from "../InvitationTemplatesPanel/InvitationTemplatesPanel";
import InvitationTemplatePreview, { type InvitationTemplateSelection } from "../InvitationTemplatesPanel/InvitationTemplatePreview";
import { createInvitationTemplateDocument } from "../../../templates/createInvitationTemplateDocument";
import InvitationPhotosPanel from "../InvitationPhotosPanel/InvitationPhotosPanel";
import type { Invitation } from "../../../types/invitation.types";
import type { InvitationPhotoWithPhoto } from "../../../types/invitationPhoto.types";
import type { InvitationDocumentPage, InvitationPhotoSlot } from "../../../types/invitationDocument.types";
import styles from "./InvitationEditorView.module.css";
interface InvitationEditorViewProps {
  invitation: Invitation;
  photos: InvitationPhotoWithPhoto[]
}

export default function InvitationEditorView({ invitation, photos: initialPhotos }: InvitationEditorViewProps) {
  const nameInputId = useId();
  const t = useTranslations("Invitations");
  const locale = useLocale();
  const router = useRouter();
  const editor = useInvitationEditor(invitation);
  const { session, activePage } = editor;
  const [photos, setPhotos] = useState(initialPhotos);
  const [preview, setPreview] = useState(false);
  const closePreview = useCallback(() => setPreview(false), []);
  const [tab, setTab] = useState<InvitationEditorTab>("pages");
  const [target, setTarget] = useState<{ pageId: string; slotId: string } | null>(null);
  const [name, setName] = useState(invitation.name);
  const [savedName, setSavedName] = useState(invitation.name);
  const [renaming, setRenaming] = useState(false);
  const [published, setPublished] = useState(invitation.is_public);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [deletion, setDeletion] = useState<{ kind: "page" | "photo"; id: string } | null>(null);
  const [templateSelection, setTemplateSelection] = useState<InvitationTemplateSelection | null>(null);
  const lock = useRef(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [framing, setFraming] = useState<{
    pageId: string;
    slot: InvitationPhotoSlot;
    imageUrl: string;
    aspectRatio: number;
    allowContain: boolean;
  } | null>(null);
  const disabled = busy || preview || editor.conflict || Boolean(deletion) || Boolean(templateSelection) || renaming || Boolean(framing);
  const validTarget = target && editor.document.pages.some(page => page.id === target.pageId && page.photos.some(slot => slot.id === target.slotId));

  useEffect(() => {
    function history(event: KeyboardEvent) {
      if (disabled || lock.current || event.defaultPrevented || event.altKey || !(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "z") return;

      if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable], [role="dialog"]')) return;

      event.preventDefault();
      if (event.shiftKey) {
        session.redo();
      } else {
        session.undo();
      }
    }

    window.addEventListener("keydown", history);
    return () => window.removeEventListener("keydown", history);
  }, [disabled, session]);

  async function run(task: () => Promise<void>) {
    if (lock.current) return;

    lock.current = true;
    setBusy(true);
    setError(false);

    try {
      await task();
    } catch {
      setError(true);
    }
    finally {
      lock.current = false;
      setBusy(false);
    }
  }

  function updatePage(update: (page: InvitationDocumentPage) => InvitationDocumentPage) {
    if (disabled || lock.current || !activePage) return;

    session.commit(document => ({
      ...document,
      pages: document.pages.map(page => {
        if (page.id !== activePage.id) return page;
        const updated = update(page);
        return updated;
      }),
    }));
  }

  function selectPhoto(photoId: string) {
    if (disabled || lock.current || !validTarget || !target) return;

    session.commit(document => ({
      ...document,
      pages: document.pages.map(page => page.id === target.pageId ? {
        ...page,
        photos: page.photos.map(slot => (
          slot.id === target.slotId && slot.photoId !== photoId ? { id: slot.id, photoId } : slot
        )),
      } : page),
    }));
    setTarget(null);
    setTab("content");
  }

  function startFraming(slotId: string) {
    if (disabled || lock.current || !activePage) return;
    const slot = activePage.photos.find(item => item.id === slotId);
    const photo = photos.find(item => item.photo_id === slot?.photoId);
    const image = canvasRef.current?.querySelector<HTMLImageElement>(
      `[data-invitation-photo-slot="${CSS.escape(slotId)}"]`,
    );
    if (!slot || !photo || !image?.clientWidth || !image.clientHeight) return;
    setFraming({
      pageId: activePage.id,
      slot,
      imageUrl: getProjectPhotoUrl(photo.photo.image_path),
      aspectRatio: image.clientWidth / image.clientHeight,
      allowContain: ["poster", "photo-strip", "grid", "photo-text", "photo-left", "split", "editorial"].includes(activePage.layout),
    });
  }

  function applyFraming(value: EditorPhotoFramingValue) {
    if (!framing || lock.current || busy || editor.conflict) return;
    session.commit(document => ({
      ...document,
      pages: document.pages.map(page => page.id === framing.pageId ? {
        ...page,
        photos: page.photos.map(slot => (
          slot.id === framing.slot.id && slot.photoId === framing.slot.photoId
            ? { ...slot, ...value }
            : slot
        )),
      } : page),
    }));
    setFraming(null);
  }

  async function confirmDelete() {
    if (!deletion) return;

    await run(async () => {
      if (deletion.kind === "page") {
        session.commit(document => ({ ...document, pages: document.pages.filter(page => page.id !== deletion.id) }));
      } else {
        session.commit(document => removeInvitationPhotoReferences(document, deletion.id));

        if (!await session.flush()) throw new Error("Save failed");

        // Membership removal is irreversible. Do not allow undo to resurrect deleted assets.
        session.clearHistory();
        const result = await removeInvitationPhotoAction(invitation.id, deletion.id);

        if (!result.success) throw new Error("Removal failed");
        setPhotos(result.data.photos);
      }
      setDeletion(null);
      setTarget(null);
    });
  }

  /* ========================================================================
     Document and Navigation Handlers
  ======================================================================== */

  function handleBack() {
    void run(async () => {
      if (!await session.flush()) throw new Error("Save failed");

      router.push(`/dashboard/projects/${invitation.project_id}`);
    });
  }

  function handlePublish() {
    void run(async () => {
      if (!await session.flush()) throw new Error("Save failed");
      const result = await setInvitationPublishedAction(invitation.id, !published);

      if (!result.success) throw new Error("Publication failed");
      setPublished(result.data.is_public);
    });
  }

  function handleRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || editor.conflict) return;

    void run(async () => {
      const result = await updateInvitationAction(invitation.id, name);

      if (!result.success) throw new Error("Rename failed");
      setSavedName(name.trim());
      setRenaming(false);
    });
  }

  function addPage(type: InvitationPageType, designId: string) {
    if (lock.current || disabled) return;
    const page = changeInvitationPageDesign(createInvitationPage(type), designId, editor.document.theme);

    session.commit(document => ({
      ...document,
      pages: [...document.pages, page],
    }));

    editor.selectPage(page.id);
    setTab("content");
  }

  function applyTemplate() {
    if (!templateSelection || lock.current || busy || editor.conflict) return;

    session.commit(document => applyInvitationTemplate(document, templateSelection.document));

    editor.selectPage(templateSelection.document.pages[0]?.id ?? null);
    setTarget(null);
    setTemplateSelection(null);
    setTab("content");
  }

  const renderPhotos = photos.map(photo => ({ id: photo.photo_id, image_path: photo.photo.image_path, description: photo.description }));

  return <>
    <InvitationEditor
      tab={tab}
      onTabChange={tab => { setTarget(null); setTab(tab); }}
      disabled={disabled}
      preview={preview}
      onClosePreview={closePreview}
      previewContent={<InvitationRenderer document={editor.document} photos={renderPhotos} locale={locale} />}
      header={<EditorHeader
        start={<>
          <Button variant="ghost" disabled={busy} aria-label={t("back")} onClick={handleBack}>
            <ArrowLeft aria-hidden="true" />
            <span className={styles.actionLabel}>
              {t("back")}
            </span>
          </Button>
          <button
            type="button"
            className={styles.nameButton}
            disabled={busy || editor.conflict}
            title={savedName}
            aria-label={t("editor.rename")}
            onClick={() => {
              setName(savedName);
              setRenaming(true);
            }}>
            {savedName}
          </button>
          <h1 className={styles.srOnly}>
            {t("editor.title")}
          </h1>
        </>}
        end={<div className={styles.headerActions}>
          <div className={styles.saveStatus}>
            <EditorSaveStatus
              status={editor.status}
              savingLabel={t("status.saving")}
              savedLabel={t("status.saved")}
              errorLabel={t(editor.conflict ? "status.conflict" : "status.error")} />
          </div>
          <Button
            size="sm"
            variant="ghost"
            aria-label={t("editor.undo")}
            title={t("editor.undo")}
            disabled={disabled || !editor.canUndo}
            onClick={session.undo}>
            <Undo2 aria-hidden="true" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            aria-label={t("editor.redo")}
            title={t("editor.redo")}
            disabled={disabled || !editor.canRedo}
            onClick={session.redo}>
            <Redo2 aria-hidden="true" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={busy || Boolean(deletion)}
            aria-label={t("editor.preview")}
            title={t("editor.preview")}
            onClick={() => setPreview(true)}>
            <Eye aria-hidden="true" />
            <span className={styles.actionLabel}>
              {t("editor.preview")}
            </span>
          </Button>
          <Button
            size="sm"
            disabled={busy || editor.conflict || Boolean(deletion) || (!published && !editor.document.pages.length)}
            aria-label={t(published ? "unpublish" : "publish")}
            title={t(published ? "unpublish" : "publish")}
            onClick={handlePublish}>
            <Globe aria-hidden="true" />
            <span className={styles.actionLabel}>
              {t(published ? "unpublish" : "publish")}
            </span>
          </Button>

          {published && <Link
            className={styles.publicLink}
            href={`/invitation/${invitation.public_id}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("openPublic")}
            title={t("openPublic")}>
            <ExternalLink aria-hidden="true" />
          </Link>}
        </div>}
      />}
      sidebar={<>

        {tab === "templates" && <InvitationTemplatesPanel
          disabled={disabled}
          onPreview={id => {
            if (disabled || lock.current) return;
            setTemplateSelection({ id, document: createInvitationTemplateDocument(id, key => t(key)) });
          }} />}

        {tab === "pages" && <InvitationPagesPanel
          sharedDateTime={editor.document}
          theme={editor.document.theme}
          photos={renderPhotos}
          onDuplicate={id => {
            if (!disabled && !lock.current) session.commit(document => duplicateInvitationPage(document, id));
          }}
          pages={editor.document.pages}
          activeId={activePage?.id}
          disabled={disabled}
          onSelect={id => {
            editor.selectPage(id);
            setTarget(null);
            setTab("content");
          }}
          onAdd={addPage}
          onMove={(from, to) => {
            if (!lock.current && !disabled) session.commit(document => moveInvitationPage(document, from, to));
          }}
          onRemove={id => setDeletion({ kind: "page", id })} />}

        <div hidden={tab !== "content"}>
        {activePage ? <InvitationContentPanel
          key={activePage.id}
          theme={editor.document.theme}
          photos={renderPhotos}
          page={activePage}
          dateTimeContent={resolveInvitationPageDateTime(editor.document, activePage).content}
          disabled={disabled}
          onChange={updatePage}
          onFramePhoto={startFraming}
          onDateTimeChange={(field, value) => {
            if (disabled || lock.current) return;
            session.commit(document => setInvitationDateTime(document, field, value));
          }}
          onChoosePhoto={slotId => {
            setTarget({ pageId: activePage.id, slotId });
            setTab("photos");
          }} /> : <p className={styles.panel}>
          {t("editor.empty")}
        </p>}
        </div>

        {tab === "photos" && <InvitationPhotosPanel
          invitationId={invitation.id}
          photos={photos}
          disabled={disabled}
          picking={Boolean(validTarget)}
          selectionLabel={validTarget && target ? t("photoUx.selection", {
            page: editor.document.pages.findIndex(page => page.id === target.pageId) + 1,
            number: (editor.document.pages.find(page => page.id === target.pageId)?.photos.findIndex(slot => slot.id === target.slotId) ?? 0) + 1,
          }) : undefined}
          selectedPhotoId={validTarget && target ? editor.document.pages.find(page => page.id === target.pageId)?.photos.find(slot => slot.id === target.slotId)?.photoId : undefined}
          onSelect={selectPhoto}
          onCancel={() => { setTarget(null); setTab("content"); }}
          onDelete={id => setDeletion({ kind: "photo", id })}
          onUpload={file => run(async () => {
            const result = await uploadInvitationPhotoAction(invitation.id, file);

            if (!result.success) {
              throw new Error("Upload failed");
            }
            setPhotos(result.data.photos);
          })}
          onImport={id => run(async () => {
            const result = await addInvitationPhotosAction(invitation.id, [id]);

            if (!result.success) {
              throw new Error("Import failed");
            }
            setPhotos(result.data.photos);
          })} />}
      </>}
    >
      {(error || editor.status === "error") && <div className={styles.notice} role="alert">
        {t(editor.conflict ? "status.conflict" : "error")}

        {editor.conflict ? <Button variant="outline" onClick={() => window.location.reload()}>
          {t("reload")}
        </Button>
          : <Button
            variant="outline"
            disabled={busy}
            onClick={() => void run(async () => {
              if (!await session.flush()) throw new Error("Save failed");
            })}>
            {t("retry")}
          </Button>}
      </div>}
      {(editor.document.legacyDateTime?.date || editor.document.legacyDateTime?.time) && (
        <p className={styles.notice} role="status">{t("editor.legacyDateTime")}</p>
      )}
      <InvitationCanvas navigator={
        <InvitationPageNavigator
          document={editor.document}
          photos={renderPhotos}
          activeId={activePage?.id}
          onSelect={id => {
            editor.selectPage(id);
            setTarget(null);
          }}
        />
      }>
        <div ref={canvasRef}>
        {activePage ? <InvitationRenderer
          document={{ ...editor.document, pages: [activePage] }}
          photos={renderPhotos}
          locale={locale}
          showPhotoPlaceholders />
          : <div className={styles.empty}>
            <h2>
              {t("editor.empty")}
            </h2>
            <p>
              {t("editor.emptyHint")}
            </p>
          </div>}
        </div>
      </InvitationCanvas>
    </InvitationEditor>
    <Dialog open={Boolean(framing)} onOpenChange={open => { if (!open) setFraming(null); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("framing.position")}</DialogTitle>
          <DialogDescription>{t("framing.dialogDescription")}</DialogDescription>
        </DialogHeader>
        {framing && <EditorPhotoFraming
          key={framing.slot.id}
          value={framing.slot}
          imageUrl={framing.imageUrl}
          aspectRatio={framing.aspectRatio}
          allowContain={framing.allowContain}
          labels={{
            position: t("framing.position"), positionHelp: t("framing.positionHelp"),
            horizontal: t("framing.horizontal"), vertical: t("framing.vertical"),
            contain: t("framing.contain"), reset: t("framing.reset"),
            cancel: t("cancel"), apply: t("framing.apply"),
          }}
          onApply={applyFraming}
          onCancel={() => setFraming(null)}
        />}
      </DialogContent>
    </Dialog>
    <Dialog open={renaming} onOpenChange={open => {
      if (!busy) setRenaming(open);
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("editor.rename")}
          </DialogTitle>
          <DialogDescription>
            {t("editor.renameHint")}
          </DialogDescription>
        </DialogHeader>
        <form className={styles.panel} onSubmit={handleRename}>
          <div className={styles.field}>
            <Label htmlFor={nameInputId}>
              {t("name")}
            </Label>
            <Input
              id={nameInputId}
              value={name}
              maxLength={150}
              disabled={busy || editor.conflict}
              onChange={event => setName(event.target.value)} />
          </div>

          {error && <p role="alert">
            {t("error")}
          </p>}
          <Button type="submit" disabled={busy || editor.conflict || !name.trim()}>
            {t("saveName")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
    <InvitationTemplatePreview
      selection={templateSelection}
      replacing={editor.document.pages.length > 0}
      disabled={busy || editor.conflict}
      onClose={() => setTemplateSelection(null)}
      onApply={applyTemplate} />
    <Dialog
      open={Boolean(deletion)}
      onOpenChange={open => {
        if (!open && !lock.current) setDeletion(null);
      }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t(deletion?.kind === "photo" ? "editor.deletePhoto" : "editor.removePage")}
          </DialogTitle>
          <DialogDescription>
            {t(deletion?.kind === "photo" ? "editor.deletePhotoDescription" : "editor.removePageDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className={styles.row}>
          <Button variant="outline" disabled={busy} onClick={() => setDeletion(null)}>
            {t("cancel")}
          </Button>
          <Button variant="destructive" disabled={busy} loading={busy} onClick={() => void confirmDelete()}>
            {t("confirm")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </>;
}
