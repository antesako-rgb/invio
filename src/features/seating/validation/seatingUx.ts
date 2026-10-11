import type { PlanData, SeatingAssignment, SeatingTable, SeatTarget } from "../types";

/** Every concrete chair is visible, including gaps; never invent seats for NULL assignments. */
export function getTableSeatRows(table: Pick<SeatingTable, "id" | "capacity">, assignments: readonly SeatingAssignment[], people: readonly PlanData["people"][number][]) {
  const occupied = new Map(assignments.filter(item => item.table_id === table.id && item.seat_number !== null).map(item => [item.seat_number, item]));
  const identities = new Map(people.map(person => [person.id, person]));
  return Array.from({ length: table.capacity }, (_, index) => {
    const seatNumber = index + 1, assignment = occupied.get(seatNumber);
    return { seatNumber, assignment, person: assignment ? identities.get(assignment.project_guest_id) : undefined };
  });
}

const names = new Intl.Collator("hr", { numeric: true, sensitivity: "base" });
export function sortSeatingTables<T extends { id: string; name: string }>(tables: readonly T[]): T[] {
  const number = (name: string) => /^(?:stol|table)\s+(\d+)(?:\s|$)/i.exec(name.trim())?.[1];
  return [...tables].sort((a, b) => {
    const left = number(a.name), right = number(b.name);
    if (left !== undefined && right === undefined) return -1;
    if (left === undefined && right !== undefined) return 1;
    if (left !== undefined && right !== undefined && Number(left) !== Number(right)) return Number(left) - Number(right);
    return names.compare(a.name, b.name) || a.id.localeCompare(b.id);
  });
}

/** Small touch targets never silently turn a chair drop into a saved table-only assignment. */
export function getGuestDropIntent(target: SeatTarget | null, mobile: boolean, pointerType: string) {
  if (!target) return "miss" as const;
  if (mobile || pointerType === "touch" || target.seatNumber === null) return "choose" as const;
  return "assign" as const;
}

export type GuestFilter = "all" | "unassigned";
export function matchesGuestFilter(filter: GuestFilter, assignment: { seat_number: number | null } | undefined) {
  return filter === "all" || !assignment;
}

/** A missed drop is guidance, and has not attempted a database write. */
export function getSeatingSaveStatus(busy: boolean, message: string) {
  if (busy) return "saving" as const;
  return message && message !== "saved" && message !== "dropMiss" ? "error" as const : "saved" as const;
}
