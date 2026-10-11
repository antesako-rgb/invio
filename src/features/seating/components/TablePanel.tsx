"use client";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Copy, Minus, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import type { SeatingAssignment, SeatingTable } from "../types";
import { getMinimumTableCapacity } from "../validation/seatAssignment";
import styles from "./SeatingWorkspace.module.css";

export default function TablePanel({ table, assignments, occupancy, disabled, error, onSave, onDelete, onDuplicate }: {
  table: SeatingTable | null; assignments: readonly SeatingAssignment[]; occupancy: number; disabled: boolean; error: string | null; onSave: (table: SeatingTable) => void; onDelete: (table: SeatingTable) => void; onDuplicate: (table: SeatingTable) => void;
}) {
  const t = useTranslations("Seating");
  const tableAssignments = assignments.filter(item => item.table_id === table?.id);
  const minimumCapacity = getMinimumTableCapacity(tableAssignments);
  const highestOccupiedSeat = Math.max(0, ...tableAssignments.map(item => item.seat_number ?? 0));
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
      <Field label={t("capacity")} description={t(table.shape === "rectangle" ? "longTableCapacityHelp" : "capacityHelp")}>
        <div className={styles.seatStepper}>
          <Button size="icon" variant="outline" disabled={disabled || table.capacity <= minimumCapacity} aria-label={t("fewerSeats")} onClick={() => onSave({ ...table, capacity: table.capacity - 1 })}><Minus aria-hidden="true" /></Button>
          <output className={styles.seatCount} aria-live="polite">{occupancy} / {table.capacity}</output>
          <Button size="icon" variant="outline" disabled={disabled || table.capacity >= 100} aria-label={t("moreSeats")} onClick={() => onSave({ ...table, capacity: table.capacity + 1 })}><Plus aria-hidden="true" /></Button>
        </div>
      </Field>
      {table.capacity <= minimumCapacity && highestOccupiedSeat > occupancy && <p className={styles.help}>{t("seatCapacityReserved", { number: highestOccupiedSeat })}</p>}
      <p className={styles.help}>{t("seatOccupancyHelp")}</p>
      {error && <p className={styles.warning} role="alert">{t(error)}</p>}
      <p className={styles.help}>{t("directEditHelp")}</p>
      <Button type="button" variant="outline" disabled={disabled} onClick={() => onDuplicate(table)}><Copy aria-hidden="true" />{t("duplicateTable")}</Button>
      <Button variant="destructiveOutline" disabled={disabled} onClick={() => onDelete(table)}>{t("deleteTable")}</Button>
    </>}
  </Card>;
}
