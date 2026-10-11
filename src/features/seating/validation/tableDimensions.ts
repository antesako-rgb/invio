import type { SeatingTable } from "../types";
import { getLongTableWidth } from "./longTableGeometry";

/** Round size is fixed; long tables share a depth and derive width from their capacity. */
export function getStandardTableDimensions(shape: SeatingTable["shape"], roomWidth: number, roomHeight: number, capacity = 8) {
  if (shape === "rectangle") {
    // Adapt the depth once for an eight-seat standard, never shrink it as seats increase.
    const height_cm = Math.max(10,Math.min(206,2*Math.floor(roomWidth/2),2*Math.floor(roomHeight/2)));
    return { width_cm:getLongTableWidth(capacity,height_cm),height_cm };
  }
  const width_cm = Math.max(10,Math.min(229,2*Math.floor(roomWidth/2),2*Math.floor(roomHeight/2)));
  return { width_cm,height_cm:width_cm };
}

export function getStandardTableUpdates(tables: SeatingTable[], shape: SeatingTable["shape"], roomWidth: number, roomHeight: number) {
  return tables.filter(table => table.shape === shape).flatMap(table => {
    const dimensions = getStandardTableDimensions(shape,roomWidth,roomHeight,table.capacity);
    return table.width_cm === dimensions.width_cm && table.height_cm === dimensions.height_cm ? [] : [{ ...table,...dimensions }];
  });
}

/** Seat changes preserve depth, center and angle. Round tables keep both dimensions. */
export function withTableCapacity(table: SeatingTable, capacity: number): SeatingTable {
  if (table.shape === "round") return { ...table,capacity };
  // Preserve extra length from existing/templates tables; increasing seats must not shorten one.
  const extraLength = Math.max(0,table.width_cm-getLongTableWidth(table.capacity,table.height_cm));
  const width = getLongTableWidth(capacity,table.height_cm)+extraLength;
  return { ...table,capacity,width_cm:capacity<table.capacity ? Math.min(table.width_cm,width) : Math.max(table.width_cm,width) };
}
