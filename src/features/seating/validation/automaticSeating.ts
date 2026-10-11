import type { PlanData, SeatingAssignment, SeatingTable } from "../types";
export type BatchSeatMode = "auto" | "include";
export type GuestScope = "unassigned" | "here" | "other" | "all" | "project";
export function guestMatchesScope(id: string, scope: GuestScope, tableId: string | null, current: PlanData) {
 const member = current.participants.some(p => p.project_guest_id === id);
 const assignment = current.assignments.find(a => a.project_guest_id === id);
 if (scope === "project") return !member;
 if (!member) return false;
 return scope === "all" || (scope === "unassigned" ? !assignment : scope === "here" ? assignment?.table_id === tableId : !!assignment && assignment.table_id !== tableId);
}
/** Preview only. RPC repeats capacity and lowest-free-seat allocation under the plan lock. */
export function previewAutomaticSeats(table: Pick<SeatingTable,"id"|"capacity">, ids: readonly string[], assignments: readonly SeatingAssignment[], mode: BatchSeatMode = "auto") {
 const selected = new Set(ids);
 const existing = assignments.filter(a => a.table_id === table.id);
 const occupancy = existing.length + ids.filter(id => !existing.some(a => a.project_guest_id === id)).length;
 const used = new Set(existing.filter(a => a.seat_number !== null && (mode === "auto" || !selected.has(a.project_guest_id))).map(a => a.seat_number as number));
 const seats = ids.map(guestId => {
  const previous = existing.find(a => a.project_guest_id === guestId);
  let seatNumber = mode === "auto" ? previous?.seat_number ?? null : null;
  if (mode === "auto" && seatNumber === null) {
   seatNumber = Array.from({length: table.capacity},(_,i)=>i+1).find(n => !used.has(n)) ?? null;
   if (seatNumber !== null) used.add(seatNumber);
  }
  return { guestId, seatNumber };
 });
 return { seats, occupancy, overflow: Math.max(0, occupancy - table.capacity) };
}
