"use client";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Minus, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import type { SeatingTable } from "../types";
import styles from "./SeatingWorkspace.module.css";

export default function TablePanel({ table, occupancy, disabled, onSave, onDelete }: {
  table: SeatingTable | null; occupancy: number; disabled: boolean; onSave: (table: SeatingTable) => void; onDelete: (table: SeatingTable) => void;
}) {
  const t = useTranslations("Seating");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!table) return;
    const form = new FormData(event.currentTarget);
    onSave({ ...table, name: String(form.get("name") ?? "").trim() });
  }
  return <Card className={styles.card}><h3>{t("tablePanel")}</h3>
    {!table ? <p className={styles.help}>{t("selectTable")}</p> : <>
      <form onSubmit={submit} className={styles.workspace}>
        <Field label={t("name")}><Input name="name" defaultValue={table.name} maxLength={150} disabled={disabled} required /></Field>
        <Button type="submit" disabled={disabled}>{t("saveTable")}</Button>
      </form>
      <Field label={t("capacity")} description={t("capacityHelp")}>
        <div className={styles.seatStepper}>
          <Button size="icon" variant="outline" disabled={disabled || table.capacity <= Math.max(1, occupancy)} aria-label={t("fewerSeats")} onClick={() => onSave({ ...table, capacity: table.capacity - 1 })}><Minus aria-hidden="true" /></Button>
          <output className={styles.seatCount} aria-live="polite">{occupancy} / {table.capacity}</output>
          <Button size="icon" variant="outline" disabled={disabled || table.capacity >= 100} aria-label={t("moreSeats")} onClick={() => onSave({ ...table, capacity: table.capacity + 1 })}><Plus aria-hidden="true" /></Button>
        </div>
      </Field>
      <p className={styles.help}>{t("directEditHelp")}</p>
      <Button variant="destructiveOutline" disabled={disabled} onClick={() => onDelete(table)}>{t("deleteTable")}</Button>
    </>}
  </Card>;
}
