"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { previewAutomaticSeats, type BatchSeatMode } from "../validation/automaticSeating";
import { getManualSeatIssue, type ManualSeat, type ManualSeats } from "../validation/manualSeating";
import SeatingGuestPicker, { type GuestBrowse } from "./SeatingGuestPicker";
import type { PlanData, SeatingTable } from "../types";
import styles from "./SeatAssignmentDialog.module.css";
import batch from "./SeatingBatch.module.css";

export type BatchDraft = { ids: string[]; exact: boolean; choices: ManualSeats; browse: GuestBrowse };
export type BatchRequest = { tableId: string | null; guestIds?: string[]; exact?: boolean };

export default function SeatingBatchForm({ request, current, tables, saving, blocked, error, onClose, onReload, onSave, onManualSave, onNewGuest, initialDraft, onDraftChange }: {
  request: BatchRequest; current: PlanData; tables: SeatingTable[]; saving: boolean; blocked: boolean; error: string | null;
  initialDraft?: BatchDraft | null; onDraftChange?: (draft: BatchDraft) => void;
  onClose: () => void; onReload: () => void; onSave: (ids: string[], tableId: string | null, mode: BatchSeatMode) => Promise<boolean>;
  onManualSave: (tableId: string, seats: ManualSeat[]) => Promise<boolean>; onNewGuest?: (draft: BatchDraft) => void;
}) {
  const t = useTranslations("Seating");
  const [ids, setIds] = useState(initialDraft?.ids ?? request.guestIds ?? []);
  const [exact, setExact] = useState(initialDraft?.exact ?? request.exact ?? false);
  const [choices, setChoices] = useState<ManualSeats>(initialDraft?.choices ?? {});
  const [browse, setBrowse] = useState<GuestBrowse>(initialDraft?.browse ?? { query: "", scope: request.tableId ? "unassigned" : "project" });
  useEffect(() => { onDraftChange?.({ ids, exact, choices, browse }); }, [ids, exact, choices, browse, onDraftChange]);
  const table = tables.find(item => item.id === request.tableId);
  const preview = table ? previewAutomaticSeats(table, ids, current.assignments) : null;
  const manualChoices: ManualSeats = Object.fromEntries(ids.map(id => {
    const own = current.assignments.find(item => item.project_guest_id === id && item.table_id === table?.id);
    return [id, Object.hasOwn(choices, id) ? choices[id] : own?.seat_number ?? null];
  }));
  const manualIssue = table && exact ? getManualSeatIssue(table, ids, manualChoices, current.assignments) : null;
  const disabled = saving || blocked;
  const invalid = ids.length === 0 || ids.length > 100 || !!preview?.overflow
    || ids.some(id => !current.people.some(person => person.id === id && !person.archived_at))
    || (request.tableId !== null && !table);
  const moving = ids.filter(id => current.assignments.some(item => item.project_guest_id === id && item.table_id !== table?.id)).length;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled || invalid || manualIssue) return;
    const saved = exact && table
      ? await onManualSave(table.id, ids.map(id => ({ guest_id: id, seat_number: manualChoices[id] as number })))
      : await onSave(ids, request.tableId, request.tableId === null ? "include" : "auto");
    if (saved) onClose();
  }
  return <form className={styles.form} onSubmit={submit}>
    {table && <div className={batch.tableContext}><div><strong>{table.name}</strong><span>{t("tableOccupancy", { count: current.assignments.filter(item => item.table_id === table.id).length, capacity: table.capacity })}</span></div></div>}
    <div className={styles.body}>
      <SeatingGuestPicker current={current} tables={tables} tableId={request.tableId} selected={ids} onChange={setIds}
        multiple allowProject projectOnly={request.tableId === null} simpleScope disabled={disabled} hideSelection browse={browse} onBrowseChange={setBrowse}
        manualTable={exact ? table : undefined} choices={manualChoices} onSeatChange={(id, seat) => setChoices(previous => ({ ...previous, [id]: seat }))}
        proposedSeats={!exact ? preview?.seats : undefined} />
      {table && <label className={batch.exactOption}><input type="checkbox" checked={exact} disabled={disabled} onChange={event => setExact(event.target.checked)} /><span>{t("chooseExactSeats")}</span></label>}
      {onNewGuest && <Button type="button" variant="ghost" className={batch.newGuest} disabled={disabled} onClick={() => onNewGuest({ ids, exact, choices, browse })}><Plus size={16} aria-hidden="true" />{t("newPerson")}</Button>}
      {!!preview?.overflow && <p className={styles.notice} role="alert">{t("batchOverflow", { count: preview.overflow })}</p>}
      {manualIssue && ids.length > 0 && <p className={styles.notice} role="status">{t(manualIssue)}</p>}
      {ids.length > 100 && <p role="alert" className={styles.notice}>{t("batchLimit")}</p>}
      {error && <p role="alert" className={styles.notice}>{t(error)}</p>}
      {blocked && <Button type="button" variant="outline" disabled={saving} onClick={onReload}>{t("reload")}</Button>}
    </div>
    <div className={styles.footer}>
      <div className={styles.footerSummary} role="status"><strong>{t("selectedGuests", { count: ids.length })}</strong>
        {table ? <><span>{t("occupancyAfterSave", { count: preview?.occupancy ?? 0, capacity: table.capacity })}</span><span>{t(exact ? "exactSeatsHelp" : "automaticSeatsHelp")}</span>{moving > 0 && <span>{t("movingGuestsCount", { count: moving })}</span>}</> : <span>{t("batchIncludeHelp")}</span>}
      </div>
      <Button type="button" variant="outline" disabled={saving} onClick={onClose}>{t("cancel")}</Button>
      <Button type="submit" disabled={disabled || invalid || !!manualIssue} loading={saving}>{t(table ? "addGuestsCount" : "includeGuestsCount", { count: ids.length })}</Button>
    </div>
  </form>;
}
