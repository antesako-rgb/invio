import type { PlanData, SeatingAssignment, SeatingTable } from "../types";
import { getSeatAssignmentIssue } from "./seatAssignment";

export type SeatAssignmentRequest = { tableId: string | null; seatNumber: number | null; guestId: string | null; seatMode?: "auto" | "manual" };
export type SeatAssignmentChoice = { tableId: string | null; seatNumber: number | null; guestId: string; seatMode?: "auto" | "manual" };

/** Switching targets keeps the chosen mode; a draft chair never carries to another table. */
export function changeSeatTable(choice: SeatAssignmentChoice, tableId: string | null, assignments: readonly SeatingAssignment[]): SeatAssignmentChoice {
  if (choice.tableId === tableId) return choice;
  const own = assignments.find(item => item.project_guest_id === choice.guestId && item.table_id === tableId);
  return { ...choice, tableId, seatNumber: own?.seat_number ?? null };
}

/** An occupied chair opens its current guest; an empty chair never picks a guest implicitly. */
export function getInitialSeatChoice(request: SeatAssignmentRequest, current: PlanData, tables: readonly SeatingTable[]): SeatAssignmentChoice {
  const occupant = request.tableId && request.seatNumber !== null
    ? current.assignments.find(item => item.table_id === request.tableId && item.seat_number === request.seatNumber) : undefined;
  const candidateId = request.guestId ?? occupant?.project_guest_id ?? "";
  const guestId = current.participants.some(item => item.project_guest_id === candidateId) ? candidateId : "";
  const assignment = current.assignments.find(item => item.project_guest_id === guestId);
  const candidateTable = request.tableId ?? assignment?.table_id ?? null;
  const tableId = tables.some(item => item.id === candidateTable) ? candidateTable : null;
  const seatNumber = request.seatNumber ?? (assignment?.table_id === tableId ? assignment.seat_number : null);
  return { guestId, tableId, seatNumber, ...(request.seatMode ? { seatMode: request.seatMode } : {}) };
}

/** Mirrors the RPC's archived-person release exception without mutating assignments. */
export function getSeatPickerIssue(choice: SeatAssignmentChoice, current: PlanData, tables: readonly SeatingTable[]) {
  const person = current.people.find(item => item.id === choice.guestId);
  if (!person || !current.participants.some(item => item.project_guest_id === person.id)) return "seatParticipantError";
  if (choice.tableId === null) return choice.seatNumber === null ? null : "seatRangeError";
  const table = tables.find(item => item.id === choice.tableId);
  if (!table) return "seatTableError";
  const existing = current.assignments.find(item => item.project_guest_id === person.id);
  if (person.archived_at && !(existing?.table_id === choice.tableId && choice.seatNumber === null)) return "archivedError";
  return getSeatAssignmentIssue(table, person.id, choice.seatNumber, current.assignments);
}

export function isSeatChoiceUnchanged(choice: SeatAssignmentChoice, assignments: readonly SeatingAssignment[]): boolean {
  const existing = assignments.find(item => item.project_guest_id === choice.guestId);
  return existing ? existing.table_id === choice.tableId && existing.seat_number === choice.seatNumber
    : choice.tableId === null && choice.seatNumber === null;
}
