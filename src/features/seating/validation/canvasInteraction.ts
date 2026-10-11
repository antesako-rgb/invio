import type { SeatingTable, SeatTarget } from "../types";
import { getLongTableSeatCounts, getLongTableChairSpacing } from "./longTableGeometry";
export type Point = { x: number; y: number };
/** Use live canvas bounds so scrolling, layout shifts and CSS scaling cannot offset a drop. */
export function clientToRoomPoint(point: Point, frame: { left: number; top: number; right: number; bottom: number }, view: { x: number; y: number; scale: number }, size: { width: number; height: number }): Point | null {
  const width = frame.right-frame.left,height = frame.bottom-frame.top;
  if (width <= 0 || height <= 0 || size.width <= 0 || size.height <= 0 || !Number.isFinite(view.scale) || view.scale <= 0
    || point.x < frame.left || point.x > frame.right || point.y < frame.top || point.y > frame.bottom) return null;
  return { x: ((point.x-frame.left)*size.width/width-view.x)/view.scale,y: ((point.y-frame.top)*size.height/height-view.y)/view.scale };
}
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

/** A compact upright label inside the inscribed circle: angle cannot change font or width. */
export function getTableLabelLayout(table: Pick<SeatingTable, "shape" | "width_cm" | "height_cm">) {
  const size = table.shape === "round" ? table.width_cm : Math.min(table.width_cm,table.height_cm);
  const lineHeight = 1.2, nameFontSize = size*.15, occupancyFontSize = size*.12;
  const nameHeight = nameFontSize*lineHeight+size*.005;
  const occupancyHeight = occupancyFontSize*lineHeight+size*.005;
  const gap = size*.015;
  return { width:size*.8,height:nameHeight+gap+occupancyHeight,nameFontSize,occupancyFontSize,nameHeight,occupancyHeight,gap,lineHeight };
}
type ChairTable = Pick<SeatingTable, "shape" | "capacity" | "width_cm" | "height_cm">;
type PositionedChairTable = ChairTable & Pick<SeatingTable, "x_cm" | "y_cm" | "rotation_deg">;
export type ChairPosition = Point & { rotation: number; seatNumber: number };
export function getSeatSide(table: Pick<SeatingTable, "shape">, seatNumber: number): "round" | "top" | "bottom" | "left" | "right" {
  if (table.shape === "round") return "round";
  if (seatNumber === 1 || seatNumber === 3) return "left";
  if (seatNumber === 2 || seatNumber === 4) return "right";
  return seatNumber%2 ? "top" : "bottom";
}
/** Match chair proportions to the body; dense capacities use the available edge spacing. */
export function getChairSize(table: ChairTable) {
  if (table.shape === "round") return Math.min(table.width_cm * .22, Math.PI * table.width_cm / table.capacity * .75);
  return Math.min(table.height_cm*.25,getLongTableChairSpacing(table.capacity,table.width_cm,table.height_cm)*.8);
}
/** Preview includes the decorative chairs, not only the table body's dimensions. */
export function getTablePreviewBounds(table: ChairTable) {
  const halfChair = getChairSize(table)/2;
  const chairs = chairPositions(table).map(chair => {
    const angle = chair.rotation*Math.PI/180;
    const extent = halfChair*(Math.abs(Math.cos(angle))+Math.abs(Math.sin(angle)));
    return { x: Math.abs(chair.x)+extent, y: Math.abs(chair.y)+extent };
  });
  return {
    width: 2*Math.max(table.width_cm/2,...chairs.map(chair => chair.x)),
    height: 2*Math.max(table.height_cm/2,...chairs.map(chair => chair.y)),
  };
}
/** Saved seat identities do not depend on the order in which the chair edges are drawn. */
export function chairPositions(table: ChairTable): ChairPosition[] {
  const gap = getChairSize(table)/2 + Math.min(table.width_cm,table.height_cm)*.025;
  if (table.shape === "round") return Array.from({ length: table.capacity }, (_, i) => {
    const angle = i * 2 * Math.PI / table.capacity - Math.PI / 2;
    return { x: Math.cos(angle) * (table.width_cm / 2 + gap), y: Math.sin(angle) * (table.height_cm / 2 + gap), rotation: angle * 180 / Math.PI + 90, seatNumber: i+1 };
  });
  const counts = getLongTableSeatCounts(table.capacity);
  return [counts.top,counts.right,counts.bottom,counts.left].flatMap((count, edge) => Array.from({ length: count }, (_, i) => {
    const position = (i+1)/(count+1)-.5;
    const along = position*table.width_cm;
    const end = position*table.height_cm;
    if (edge === 0) return { x: along, y: -table.height_cm / 2-gap, rotation: 0, seatNumber: 5+i*2 };
    if (edge === 1) return { x: table.width_cm / 2+gap, y: end, rotation: 90, seatNumber: 2+i*2 };
    if (edge === 2) return { x: along, y: table.height_cm / 2+gap, rotation: 180, seatNumber: 6+i*2 };
    return { x: -table.width_cm / 2-gap, y: end, rotation: 270, seatNumber: 1+i*2 };
  }));
}

/** Project local geometry into the unchanged centimetre coordinate system of the room. */
function chairWorldPosition(table: PositionedChairTable, chair: ChairPosition): Point {
  const radians = table.rotation_deg*Math.PI/180;
  return {
    x: table.x_cm+chair.x*Math.cos(radians)-chair.y*Math.sin(radians),
    y: table.y_cm+chair.x*Math.sin(radians)+chair.y*Math.cos(radians),
  };
}

export function getSeatWorldPosition(table: PositionedChairTable, seatNumber: number): Point | null {
  const chair = chairPositions(table).find(item => item.seatNumber === seatNumber);
  return chair ? chairWorldPosition(table,chair) : null;
}

/** Match the rotated chair body, with an optional larger circular target measured in cm. */
export function chairContainsPoint(table: PositionedChairTable, seatNumber: number, point: Point, minRadius = 0): boolean {
  const chair = chairPositions(table).find(item => item.seatNumber === seatNumber);
  if (!chair) return false;
  return chairMatchesPoint(table,chair,point,minRadius);
}

function chairMatchesPoint(table: PositionedChairTable, chair: ChairPosition, point: Point, minRadius: number): boolean {
  const world = chairWorldPosition(table,chair), dx = point.x-world.x, dy = point.y-world.y;
  const angle = -(table.rotation_deg+chair.rotation)*Math.PI/180;
  const x = dx*Math.cos(angle)-dy*Math.sin(angle), y = dx*Math.sin(angle)+dy*Math.cos(angle);
  const halfSize = getChairSize(table)/2;
  return (Math.abs(x)<=halfSize && Math.abs(y)<=halfSize) || Math.hypot(dx,dy)<=Math.max(0,minRadius);
}

/** Closest matching chair wins when mobile targets overlap; table draw order breaks ties. */
export function hitSeat(tables: readonly SeatingTable[], point: Point, minRadius = 0): { tableId: string; seatNumber: number } | null {
  let closest: { tableId: string; seatNumber: number; distance: number } | null = null;
  for (let index=tables.length-1;index>=0;index--) {
    const table = tables[index];
    for (const chair of chairPositions(table)) {
      if (!chairMatchesPoint(table,chair,point,minRadius)) continue;
      const center = chairWorldPosition(table,chair), distance = Math.hypot(point.x-center.x,point.y-center.y);
      if (!closest || distance<closest.distance) closest = { tableId: table.id,seatNumber: chair.seatNumber,distance };
    }
  }
  return closest ? { tableId: closest.tableId,seatNumber: closest.seatNumber } : null;
}

/** Match canvas draw order: a front table's visible body/chairs cover all earlier tables. */
export function hitSeatingTarget(tables: readonly SeatingTable[], point: Point): SeatTarget | null {
  for (let index=tables.length-1;index>=0;index--) {
    const table = tables[index];
    // Table bodies are drawn after their own chairs, so the visible body wins any overlap.
    if (tableContainsPoint(table,point)) return { tableId: table.id,seatNumber: null };
    const seat = hitSeat([table],point);
    if (seat) return seat;
  }
  return null;
}

/** A near miss opens the table picker; only an exact chair hit can save a specific seat. */
export function hitGuestDropTarget(tables: readonly SeatingTable[], point: Point, scale: number, pointerType = "mouse"): SeatTarget | null {
  const exact = hitSeatingTarget(tables,point);
  if (exact) return exact;
  if (!Number.isFinite(scale) || scale <= 0) return null;
  const tolerance = (pointerType === "touch" ? 24 : 18)/scale;
  let closest: { tableId: string; distance: number } | null = null;
  for (let index=tables.length-1;index>=0;index--) {
    const table = tables[index];
    const angle = -table.rotation_deg*Math.PI/180;
    const dx = point.x-table.x_cm,dy = point.y-table.y_cm;
    const x = dx*Math.cos(angle)-dy*Math.sin(angle),y = dx*Math.sin(angle)+dy*Math.cos(angle);
    let distance = table.shape === "round" ? Math.max(0,Math.hypot(x,y)-table.width_cm/2)
      : Math.hypot(Math.max(0,Math.abs(x)-table.width_cm/2),Math.max(0,Math.abs(y)-table.height_cm/2));
    const halfChair = getChairSize(table)/2;
    for (const chair of chairPositions(table)) {
      const chairAngle = -chair.rotation*Math.PI/180;
      const cx = x-chair.x,cy = y-chair.y;
      const localX = cx*Math.cos(chairAngle)-cy*Math.sin(chairAngle),localY = cx*Math.sin(chairAngle)+cy*Math.cos(chairAngle);
      distance = Math.min(distance,Math.hypot(Math.max(0,Math.abs(localX)-halfChair),Math.max(0,Math.abs(localY)-halfChair)));
    }
    if (distance <= tolerance && (!closest || distance < closest.distance)) closest = { tableId:table.id,distance };
  }
  return closest ? { tableId:closest.tableId,seatNumber:null } : null;
}

/** Upright name boxes depend on unrotated dimensions and zoom, never a rotated bounding box. */
export function getSeatNameLayout(table: PositionedChairTable, seatNumber: number, scale = 1) {
  const chair = chairPositions(table).find(item => item.seatNumber === seatNumber);
  if (!chair) return null;
  const viewScale = Number.isFinite(scale) && scale>0 ? scale : 1;
  const size = getChairSize(table);
  const spacing = table.shape === "round" ? Math.PI*table.width_cm/table.capacity
    : getLongTableChairSpacing(table.capacity,table.width_cm,table.height_cm);
  const width = Math.min(90,spacing*viewScale*.9)/viewScale;
  const fontSize = Math.max(10,Math.min(12,size*viewScale*.32))/viewScale;
  const lineHeight = 1.15, height = fontSize*lineHeight*2+4/viewScale;
  const angle = (table.rotation_deg+chair.rotation)*Math.PI/180;
  const normal = { x: Math.sin(angle),y: -Math.cos(angle) };
  const anchor = chairWorldPosition(table,chair);
  const distance = size/2+Math.abs(normal.x)*width/2+Math.abs(normal.y)*height/2+4/viewScale;
  return { x: anchor.x+normal.x*distance-width/2,y: anchor.y+normal.y*distance-height/2,
    width,height,fontSize,lineHeight,anchor };
}
export function canAssignToTable(capacity: number, tableId: string, guestId: string, assignments: { table_id: string; project_guest_id: string }[]) {
  return assignments.filter(item => item.table_id === tableId && item.project_guest_id !== guestId).length < capacity;
}
