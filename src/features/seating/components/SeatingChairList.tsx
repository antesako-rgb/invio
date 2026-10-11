"use client";
import { useId } from "react";
import { useTranslations } from "next-intl";
import { Armchair, Check, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTableSeatRows } from "../validation/seatingUx";
import type { PlanData, SeatingTable } from "../types";
import styles from "./SeatingChairList.module.css";

/** The overview and manual picker show the same saved chair identities. */
export default function SeatingChairList({ table, current, disabled, choosing = false, guestId, selectedSeat = null, onSelect }: {
  table: SeatingTable; current: PlanData; disabled: boolean; choosing?: boolean;
  guestId?: string; selectedSeat?: number | null; onSelect: (seatNumber: number) => void;
}) {
  const t = useTranslations("Seating"), id = useId();
  const rows = getTableSeatRows(table, current.assignments, current.people);
  const occupied = rows.filter(row => row.assignment).length;
  return <section className={styles.section} aria-labelledby={id}>
    <div className={styles.heading}><h4 id={id}>{t("tableChairs")}</h4><span>{t("freeChairsCount", { count: table.capacity - occupied })}</span></div>
    <p className={styles.help}>{t(choosing ? "manualChairListHelp" : "tableChairListHelp")}</p>
    <ul className={styles.list}>
      {rows.map(({ seatNumber, assignment, person }) => {
        const name = person ? [person.first_name, person.last_name].filter(Boolean).join(" ") : "";
        const occupied = !!assignment;
        const otherGuest = occupied && assignment.project_guest_id !== guestId;
        const selected = choosing && selectedSeat === seatNumber;
        const response = person ? current.attendance[person.id] : undefined;
        const warnings = [person?.archived_at ? t("archived") : "", response?.conflict ? t("rsvpConflict") : "", response?.status === "not_attending" ? t("not_attending") : ""].filter(Boolean);
        const caption = occupied ? [t("occupiedSeat"), ...warnings].join(" · ") : t("freeSeat");
        const action = choosing ? t("chooseSeat") : t(occupied ? "editChairAssignment" : "assignPlace");
        return <li key={seatNumber}>
          <Button type="button" variant="ghost" className={styles.row} disabled={disabled || (choosing && otherGuest)}
            data-occupied={occupied} data-selected={selected} aria-pressed={choosing ? selected : undefined}
            aria-label={[t("seatNumber", { number: seatNumber }), ...(name ? [name] : []), caption, action].join(", ")}
            onClick={() => onSelect(seatNumber)}>
            <span className={styles.number}><Armchair size={14} aria-hidden="true" />{seatNumber}</span>
            <span className={styles.identity}><strong>{name || (occupied ? t("occupiedSeat") : t("freeSeat"))}</strong>{occupied && <small data-warning={!!warnings.length}>{caption}</small>}</span>
            {selected ? <Check size={18} aria-hidden="true" /> : choosing ? null : occupied ? <ChevronRight size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
          </Button>
        </li>;
      })}
    </ul>
  </section>;
}
