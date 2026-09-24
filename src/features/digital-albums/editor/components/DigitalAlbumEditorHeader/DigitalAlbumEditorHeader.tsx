"use client";
import { Undo2, Redo2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import BackLink from "@/components/ui/back-link/BackLink";
import EditorHeader from "@/features/editor/components/EditorHeader/EditorHeader";
import EditorSaveStatus from "@/features/editor/components/EditorSaveStatus/EditorSaveStatus";
import DigitalAlbumPdfExportAction from "../DigitalAlbumPdfExportAction/DigitalAlbumPdfExportAction";
import type { AlbumSaveStatus } from "../../state/DigitalAlbumSession";
export interface DigitalAlbumEditorHeaderProps {
  albumId: string;
  saveConflict?: boolean;
  saveStatus?: AlbumSaveStatus;
  canUndo?: boolean;
  canRedo?: boolean;
  onRedo?: () => void;
  onUndo?: () => void;
  onExportBusy?: (busy: boolean) => void;
  onRetry?: () => void;
  beforeExport?: () => Promise<boolean>;
  exportDisabled?: boolean;
}
export default function DigitalAlbumEditorHeader({
  albumId,
  saveStatus = "saved",
  saveConflict,
  canUndo,
  canRedo,
  onRedo,
  onUndo,
  onRetry,
  beforeExport,
  exportDisabled,
  onExportBusy,
}: DigitalAlbumEditorHeaderProps) {
  const t = useTranslations("DigitalAlbumEditor");
  return (
    <EditorHeader
      start={
        <span
          onClickCapture={(event) => {
            if (
              saveStatus !== "saved" &&
              !window.confirm(t("upgrade.leaveUnsaved"))
            )
              event.preventDefault();
          }}
        >
          <BackLink href="/dashboard/dogadaji" label={t("navigation.back")} />
        </span>
      }
      end={
        <>
          <Button
            type="button"
            disabled={!canUndo || exportDisabled}
            onClick={onUndo}
            title={t("upgrade.undo")}
            aria-label={t("upgrade.undo")}
            variant="ghost"
            size="icon-sm"
          >
            <Undo2 size={18} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={!canRedo || exportDisabled}
            onClick={onRedo}
            title={t("upgrade.redo")}
            aria-label={t("upgrade.redo")}
          >
            <Redo2 size={18} />
          </Button>
          <EditorSaveStatus
            status={saveStatus}
            savingLabel={t("status.saving")}
            savedLabel={t("status.saved")}
            errorLabel={t("status.error")}
          />
          {saveStatus === "error" && !saveConflict && (
            <Button type="button" onClick={onRetry}>
              {t("upgrade.retry")}
            </Button>
          )}
          <DigitalAlbumPdfExportAction
            albumId={albumId}
            beforeExport={beforeExport}
            disabled={exportDisabled}
            onBusyChange={onExportBusy}
          />
        </>
      }
    />
  );
}
