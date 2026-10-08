import type { SeatingTable } from "../types";
export type Point = { x: number; y: number };
/** Hit testing uses the same center and rotation as persisted geometry. */
export function tableContainsPoint(table: SeatingTable, point: Point): boolean {
  const angle = -table.rotation_deg * Math.PI / 180;
  const dx = point.x - table.x_cm, dy = point.y - table.y_cm;
  const x = dx * Math.cos(angle) - dy * Math.sin(angle);
  const y = dx * Math.sin(angle) + dy * Math.cos(angle);
  return table.shape === "round"
    ? x * x + y * y <= (table.width_cm / 2) ** 2
    : Math.abs(x) <= table.width_cm / 2 && Math.abs(y) <= table.height_cm / 2;
}
type ChairTable = Pick<SeatingTable, "shape" | "capacity" | "width_cm" | "height_cm">;
function rectangleSeatCounts(table: ChairTable) {
  const horizontal = Math.round(table.capacity * table.width_cm / (table.width_cm + table.height_cm));
  return [Math.ceil(horizontal/2), Math.ceil((table.capacity-horizontal)/2), Math.floor(horizontal/2), Math.floor((table.capacity-horizontal)/2)];
}
/** Match chair proportions to the body; dense capacities use the available edge spacing. */
export function getChairSize(table: ChairTable) {
  if (table.shape === "round") return Math.min(table.width_cm * .22, Math.PI * table.width_cm / table.capacity * .75);
  const spacing = rectangleSeatCounts(table).flatMap((count, edge) => count ? [(edge % 2 === 0 ? table.width_cm : table.height_cm) / (count+1)] : []);
  return Math.min(Math.min(table.width_cm,table.height_cm) * .3, Math.min(...spacing) * .8);
}
/** Chairs are decorative; dimensions/capacity and table assignments remain independent. */
export function chairPositions(table: ChairTable) {
  const gap = getChairSize(table)/2 + Math.min(table.width_cm,table.height_cm)*.025;
  if (table.shape === "round") return Array.from({ length: table.capacity }, (_, i) => {
    const angle = i * 2 * Math.PI / table.capacity - Math.PI / 2;
    return { x: Math.cos(angle) * (table.width_cm / 2 + gap), y: Math.sin(angle) * (table.height_cm / 2 + gap), rotation: angle * 180 / Math.PI + 90 };
  });
  // Split seats proportionally between opposite edge pairs, distribute evenly along each edge.
  const counts = rectangleSeatCounts(table);
  return counts.flatMap((count, edge) => Array.from({ length: count }, (_, i) => {
    const position = (i + 1) / (count + 1) - .5;
    if (edge === 0) return { x: position * table.width_cm, y: -table.height_cm / 2-gap, rotation: 0 };
    if (edge === 1) return { x: table.width_cm / 2+gap, y: position * table.height_cm, rotation: 90 };
    if (edge === 2) return { x: position * table.width_cm, y: table.height_cm / 2+gap, rotation: 180 };
    return { x: -table.width_cm / 2-gap, y: position * table.height_cm, rotation: 270 };
  }));
}
export function canAssignToTable(capacity: number, tableId: string, guestId: string, assignments: { table_id: string; project_guest_id: string }[]) {
  return assignments.filter(item => item.table_id === tableId && item.project_guest_id !== guestId).length < capacity;
}
