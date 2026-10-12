"use client";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Maximize2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlanData, SeatingTable } from "../types";
import SeatingChairList from "./SeatingChairList";
import TablePanel from "./TablePanel";
import styles from "./SeatingWorkspace.module.css";
import ux from "./SeatingUx.module.css";

export default function SeatingTablesPanel({ current, tables, selected, disabled, error, onSelect, onFocus, onAddGuest, onSelectSeat, onSave, onDuplicate, onDelete, appearancePanel }: {
  appearancePanel?: ReactNode;
  current: PlanData; tables: SeatingTable[]; selected: SeatingTable | null; disabled: boolean; error: string | null;
  onSelect: (id: string | null) => void; onFocus: (id: string) => void; onAddGuest: (tableId: string) => void;
  onSelectSeat: (tableId: string, seatNumber: number) => void;
  onSave: (table: SeatingTable) => void; onDuplicate: (table: SeatingTable) => void; onDelete: (table: SeatingTable) => void;
}) {
  const t = useTranslations("Seating");
  if (!selected) return <div className={styles.workspace}>
    <p className={styles.help}>{t("tableListHelp")}</p>
    {appearancePanel}
    <ul className={ux.tableList}>{tables.map(table => <li key={table.id}><Button variant="outline" className={ux.tableButton} onClick={() => onSelect(table.id)}>
      <span>{table.name}</span><span>{current.assignments.filter(item => item.table_id === table.id).length} / {table.capacity}</span>
    </Button></li>)}</ul>
    {!tables.length && <p className={styles.help}>{t("seatNoTables")}</p>}
  </div>;
  const assignments = current.assignments.filter(item => item.table_id === selected.id);
  return <div className={styles.workspace}>
    <Button variant="ghost" className={ux.back} onClick={() => onSelect(null)} disabled={disabled}><ArrowLeft aria-hidden="true" />{t("backToTables")}</Button>
    <div className={ux.tableHeader}><h3>{selected.name} · {assignments.length} / {selected.capacity}</h3>
      <Button variant="outline" onClick={() => onFocus(selected.id)}><Maximize2 aria-hidden="true" />{t("focusTable")}</Button>
    </div>
    <details className={ux.tableSettings} key={selected.id}><summary>{t("tableSettings")}</summary>
      <TablePanel key={selected.id + ":" + current.plan.revision} table={selected} assignments={assignments} occupancy={assignments.length} disabled={disabled} error={error}
        onSave={onSave} onDelete={onDelete} onDuplicate={onDuplicate} />
    </details>
    {appearancePanel}
    <Button disabled={disabled} onClick={() => onAddGuest(selected.id)}><Plus aria-hidden="true" />{t("addGuests")}</Button>
    <SeatingChairList table={selected} current={current} disabled={disabled} onSelect={seatNumber => onSelectSeat(selected.id, seatNumber)} />
  </div>;
}
