import type { SeatingAssignment, SeatingTable } from "../types";
export type PlacementMode="auto"|"manual";
export type ManualSeat={guest_id:string;seat_number:number};
export type ManualSeats=Record<string,number|null>;
/** Only empty chairs or this guest's current chair are offered. No displacement or swaps. */
export function getManualSeatOptions(table:Pick<SeatingTable,"id"|"capacity">,guestId:string,ids:readonly string[],choices:ManualSeats,assignments:readonly SeatingAssignment[]) {
 return Array.from({length:table.capacity},(_,i)=>i+1).filter(number=>
  !assignments.some(a=>a.table_id===table.id&&a.seat_number===number&&a.project_guest_id!==guestId)
  && !ids.some(id=>id!==guestId&&choices[id]===number));
}
export function getManualSeatIssue(table:Pick<SeatingTable,"id"|"capacity">,ids:readonly string[],choices:ManualSeats,assignments:readonly SeatingAssignment[]) {
 for(const id of ids){const number=choices[id];
  if(number==null)return "manualSeatsIncomplete" as const;
  if(!Number.isInteger(number)||number<1||number>table.capacity)return "seatRangeError" as const;
  if(!getManualSeatOptions(table,id,ids,choices,assignments).includes(number))return "seatOccupiedError" as const;
 }
 return null;
}
