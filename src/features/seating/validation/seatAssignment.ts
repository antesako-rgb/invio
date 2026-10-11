import type { SeatingAssignment, SeatingTable } from "../types";

type Assignment = Pick<SeatingAssignment, "project_guest_id" | "table_id" | "seat_number">;
type Table = Pick<SeatingTable, "id" | "capacity">;
export type SeatAssignmentIssue = "seatRangeError" | "seatOccupiedError" | "capacityError";

/** Client feedback only; the atomic RPC remains the authoritative check. */
export function getSeatAssignmentIssue(table: Table, guestId: string, seatNumber: number | null, assignments: readonly Assignment[]): SeatAssignmentIssue | null {
  if (seatNumber !== null && (!Number.isInteger(seatNumber) || seatNumber < 1 || seatNumber > table.capacity)) return "seatRangeError";
  if (seatNumber !== null && assignments.some(item => item.table_id === table.id && item.seat_number === seatNumber && item.project_guest_id !== guestId)) return "seatOccupiedError";
  if (assignments.filter(item => item.table_id === table.id && item.project_guest_id !== guestId).length >= table.capacity) return "capacityError";
  return null;
}

/** Shrinking must preserve occupied identities, even when few people are at the table. */
export function getMinimumTableCapacity(assignments: readonly Assignment[]): number {
  return Math.max(1, assignments.length, ...assignments.map(item => item.seat_number ?? 0));
}

export function isSeatRevisionConfirmed(value: unknown, expectedRevision: number): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value === expectedRevision + 1;
}
