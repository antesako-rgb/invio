"use client";

import { ArrowLeft, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import EditorHeader from "@/features/editor/components/EditorHeader/EditorHeader";
import EditorSaveStatus from "@/features/editor/components/EditorSaveStatus/EditorSaveStatus";
import styles from "./PhotoWallMaterialEditorHeader.module.css";

export default function PhotoWallMaterialEditorHeader({ name, dirty, isSaving, error, onSave, onBack }: {
  name: string; dirty: boolean; isSaving: boolean; error: string | null;
  onSave: () => void; onBack: () => void;
}) {
  const t = useTranslations("PhotoWalls.editor");
  return <EditorHeader start={
    <div className={styles.start}>
      <Button variant="ghost" size="icon" aria-label={t("navigation.back")} onClick={onBack}><ArrowLeft aria-hidden="true" /></Button>
      <span className={styles.name}>{name}</span>
    </div>
  } end={
    <div className={styles.actions}>
      <div className={styles.status}>
        {dirty && !isSaving && !error ? <span role="status">{t("status.unsaved")}</span> :
          <EditorSaveStatus status={isSaving ? "saving" : error ? "error" : "saved"}
            savingLabel={t("status.saving")} savedLabel={t("status.saved")} errorLabel={t("status.error")} />}
      </div>
      <Button size="sm" onClick={onSave} disabled={!dirty || isSaving}>
        <Save aria-hidden="true" />{t(isSaving ? "status.saving" : "actions.save")}
      </Button>
    </div>
  } />;
}
