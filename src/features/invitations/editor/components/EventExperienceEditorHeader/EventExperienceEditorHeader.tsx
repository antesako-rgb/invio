"use client";

import { Eye } from "lucide-react";
import { useTranslations } from "next-intl";

import BackLink
  from "@/components/ui/back-link/BackLink";

import { Button } from "@/components/ui/button";

import EditorHeader
  from "@/features/editor/components/EditorHeader/EditorHeader";

import EditorSaveStatus
  from "@/features/editor/components/EditorSaveStatus/EditorSaveStatus";

import type { EventExperienceEditorSaveStatus }
  from "@/features/invitations/editor/types/eventExperienceEditor.types";

import styles from "./EventExperienceEditorHeader.module.css";

interface EventExperienceEditorHeaderProps {
  saveStatus?: EventExperienceEditorSaveStatus;
  onPreview?: () => void;
}

export default function EventExperienceEditorHeader({
  saveStatus = "saved",
  onPreview,
}: EventExperienceEditorHeaderProps) {
  const t = useTranslations("EventExperiences.editor");

  return (
    <EditorHeader
      start={
        <BackLink
          href="/dashboard/dogadaji"
          label={t("navigation.back")}
        />
      }
      end={
        <>
          <EditorSaveStatus
            status={saveStatus}
            savingLabel={t("status.saving")}
            savedLabel={t("status.saved")}
            errorLabel={t("status.error")}
          />
          {onPreview && (
            <div className={styles.previewAction}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onPreview}
              >
                <Eye aria-hidden="true" />
                {t("navigation.preview")}
              </Button>
            </div>
          )}
        </>
      }
    />
  );
}
