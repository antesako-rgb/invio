"use client";
import { useId, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Armchair, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog/dialog";
import { guestOptions } from "@/features/project-guests/utils/guestOptions";
import { getSeatSide } from "../validation/canvasInteraction";
import { getInitialSeatChoice, getSeatPickerIssue, isSeatChoiceUnchanged, type SeatAssignmentRequest } from "../validation/seatAssignmentChoices";
import type { PlanData, SeatingTable } from "../types";
import styles from "./SeatAssignmentDialog.module.css";

export type { SeatAssignmentRequest } from "../validation/seatAssignmentChoices";

export default function SeatAssignmentDialog({ request, current, tables, saving, blocked, error, onClose, onReload, onAssign }: {
  request: SeatAssignmentRequest; current: PlanData; tables: SeatingTable[];
  saving: boolean; blocked: boolean; error: string | null;
  onClose: () => void; onReload: () => void;
  onAssign: (guestId: string, tableId: string | null, seatNumber: number | null) => Promise<boolean>;
}) {
  const t = useTranslations("Seating");
  const id = useId();
  const [choice, setChoice] = useState(() => getInitialSeatChoice(request, current, tables));
  const included = new Set(current.participants.map(item => item.project_guest_id));
  const people = current.people.filter(person => included.has(person.id));
  const person = people.find(item => item.id === choice.guestId);
  const personOptions = guestOptions(people).map(option => ({ ...option, label: option.label + (people.find(person => person.id === option.value)?.archived_at ? " · " + t("archived") : "") }));
  const table = tables.find(item => item.id === choice.tableId);
  const existing = current.assignments.find(item => item.project_guest_id === choice.guestId);
  const name = (person: PlanData["people"][number]) => [person.first_name, person.last_name].filter(Boolean).join(" ");
  const issue = getSeatPickerIssue(choice, current, tables);
  const disabled = saving || blocked;
  const unchanged = isSeatChoiceUnchanged(choice, current.assignments);
  const seatLabel = choice.seatNumber === null ? t("noSpecificSeat") : t("seatNumber", { number: choice.seatNumber });
  async function assign(tableId: string | null, seatNumber: number | null) {
    if (disabled || getSeatPickerIssue({ ...choice, tableId, seatNumber }, current, tables)) return;
    if (await onAssign(choice.guestId, tableId, seatNumber)) onClose();
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (unchanged || issue) return;
    await assign(choice.tableId, choice.seatNumber);
  }
  const sideKeys = { round: "seatSideRound", top: "seatSideTop", bottom: "seatSideBottom", left: "seatSideLeft", right: "seatSideRight" } as const;
  return <Dialog open onOpenChange={value => { if (!value && !saving) onClose(); }}>
    <DialogContent positioning="custom" className={styles.dialog} closeLabel={t("cancel")} aria-busy={saving}>
      <DialogHeader className={styles.header}><DialogTitle>{t("seatAssignmentTitle")}</DialogTitle><DialogDescription>{t("seatAssignmentHelp")}</DialogDescription></DialogHeader>
      <form onSubmit={submit} className={styles.form}>
        <div className={styles.body}>
          <Field id={id + "-guest"} label={t("seatGuest")} required>
            <Select value={choice.guestId} disabled={disabled} options={[{ value: "", label: t("choosePerson") }, ...personOptions]}
              onValueChange={guestId => setChoice(previous => ({ ...previous, guestId }))} />
          </Field>
          <Field id={id + "-table"} label={t("seatTable")}>
            <Select value={choice.tableId ?? ""} disabled={disabled || !!person?.archived_at} options={[{ value: "", label: t("unassigned") }, ...tables.map(table => ({ value: table.id, label: table.name + " · " + current.assignments.filter(item => item.table_id === table.id).length + " / " + table.capacity }))]}
              onValueChange={tableId => setChoice(previous => ({ ...previous, tableId: tableId || null, seatNumber: null }))} />
          </Field>
          {person?.archived_at && <p className={styles.notice}>{t("seatArchivedHelp")}</p>}
          {!tables.length && <p className={styles.notice}>{t("seatNoTables")}</p>}
          {!people.length && <p className={styles.notice}>{t("seatNoParticipants")}</p>}
          {table && <fieldset className={styles.choices} disabled={disabled}>
            <legend>{t("seatChoice")}</legend>
            <Button type="button" variant={choice.seatNumber === null ? "default" : "outline"} className={styles.tableOnly} aria-pressed={choice.seatNumber === null}
              disabled={!!person?.archived_at && existing?.table_id !== table.id} onClick={() => setChoice(previous => ({ ...previous, seatNumber: null }))}>{t("noSpecificSeat")}</Button>
            <div className={styles.seatGrid} role="group" aria-label={t("seatChoice")}>
              {Array.from({ length: table.capacity }, (_, index) => {
                const seatNumber = index + 1;
                const occupantAssignment = current.assignments.find(item => item.table_id === table.id && item.seat_number === seatNumber);
                const occupant = people.find(item => item.id === occupantAssignment?.project_guest_id);
                const otherGuest = !!occupantAssignment && occupantAssignment.project_guest_id !== choice.guestId;
                const selected = choice.seatNumber === seatNumber;
                const occupantName = occupant ? name(occupant) : "";
                const seat = t("seatNumber", { number: seatNumber });
                return <Button key={seatNumber} type="button" variant={selected ? "default" : "outline"} className={styles.seat} data-occupied={!!occupantAssignment} aria-pressed={selected}
                  disabled={otherGuest || !!person?.archived_at} title={occupantName ? t("seatOccupiedBy", { name: occupantName }) : seat}
                  aria-label={seat + ", " + t(sideKeys[getSeatSide(table, seatNumber)]) + ", " + (occupantName ? t("seatOccupiedBy", { name: occupantName }) : t("freeSeat"))}
                  onClick={() => setChoice(previous => ({ ...previous, seatNumber }))}>
                  <span className={styles.seatNumber}><Armchair size={16} aria-hidden="true" />{seatNumber}{occupantAssignment && <Check size={12} aria-hidden="true" />}</span>
                  <span className={styles.side}>{t(sideKeys[getSeatSide(table, seatNumber)])}</span>
                  <span className={styles.occupant}>{occupantName || t("freeSeat")}</span>
                </Button>;
              })}
            </div>
          </fieldset>}
          {person && <div className={styles.summary} role="status"><Badge variant={person.archived_at ? "warning" : "muted"}>{t("seatSelectionSummary", { name: name(person), table: table?.name ?? t("unassigned"), seat: choice.tableId ? seatLabel : t("unassigned") })}</Badge></div>}
          {issue && choice.guestId && <p className={styles.notice} role="status">{t(issue)}{issue === "seatOccupiedError" && " " + t("seatOccupiedHelp")}</p>}
          {error && <div className={styles.notice} role="alert">{t(error)}{blocked && <Button type="button" variant="outline" disabled={saving} onClick={onReload}>{t("reload")}</Button>}</div>}
          {blocked && !error && <div className={styles.notice} role="alert">{t("reloadRequired")}<Button type="button" variant="outline" disabled={saving} onClick={onReload}>{t("reload")}</Button></div>}
          {existing && <div className={styles.releaseActions}>
            {existing.seat_number !== null && <Button type="button" variant="outline" disabled={disabled} onClick={() => void assign(existing.table_id, null)}>{t("releaseSeat")}</Button>}
            <Button type="button" variant="outline" disabled={disabled} onClick={() => void assign(null, null)}>{t("unassign")}</Button>
          </div>}
        </div>
        <DialogFooter className={styles.footer}><Button type="button" variant="outline" disabled={saving} onClick={onClose}>{t("cancel")}</Button><Button type="submit" loading={saving} disabled={disabled || !!issue || unchanged}>{t("seatAssignmentSave")}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}
