"use client";
import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import styles from "./EditorPhotoLibrary.module.css";
export default function EditorPhotoLibrary({ header, addLabel, emptyLabel, empty, disabled, onAdd, children, picking = false }: {
  header: ReactNode; addLabel: string; emptyLabel: string; empty: boolean;
  disabled?: boolean; onAdd: () => void; children: ReactNode; picking?: boolean;
}) {
  const t = useTranslations("Common.photoLibraryHelp");
  return <div className={styles.root}>
    <div className={styles.header} aria-live="polite">{header}</div>
    <div className={styles.actions}><Button type="button" variant="outline" disabled={disabled} onClick={onAdd}>
      <Plus aria-hidden="true" />{addLabel}
    </Button></div>
    {empty && <p className={styles.count}>{emptyLabel}</p>}
    <div className={styles.grid}>{children}</div>
    {!empty && !picking && <div className={styles.help}>
      <p>{t("placement")}</p>
      <p>{t("usage")}</p>
      <p>{t("description")}</p>
    </div>}
  </div>;
}
