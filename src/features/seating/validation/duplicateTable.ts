import type { SeatingTable } from "../types";
import { getChairSize, getTablePreviewBounds } from "./canvasInteraction";
import { seatingGeometryFits } from "./seatingGeometry";

/** Conservative world bounds reserve room around the visible chairs as well as the body. */
function halfBounds(table: SeatingTable, chairs = false) {
  const dimensions = chairs ? getTablePreviewBounds(table) : { width: table.width_cm, height: table.height_cm };
  if (table.shape === "round") {
    // Circle chairs may rotate into a larger bound; a radial bound is safe at every angle.
    const radius = chairs ? table.width_cm/2+getChairSize(table)*(1+Math.SQRT2)/2+table.width_cm*.025 : table.width_cm/2;
    return { x: radius, y: radius };
  }
  const angle = table.rotation_deg*Math.PI/180;
  return { x: (Math.abs(Math.cos(angle))*dimensions.width+Math.abs(Math.sin(angle))*dimensions.height)/2,
    y: (Math.abs(Math.sin(angle))*dimensions.width+Math.abs(Math.cos(angle))*dimensions.height)/2 };
}

export function getDuplicateTableName(source: string, names: string[], suffix: (number: number) => string) {
  const existing = new Set(names);
  for (let number = 1; number <= names.length+1; number++) {
    const ending = suffix(number);
    let prefix = "";
    for (const character of source) {
      if (prefix.length+character.length+ending.length > 150) break;
      prefix += character;
    }
    const name = prefix.trimEnd()+ending;
    if (!existing.has(name)) return name;
  }
  throw new Error("No available copy name");
}

/** Find an unoccupied position, preserving legacy dimensions, angle and capacity exactly. */
export function getDuplicateTable(source: SeatingTable, tables: SeatingTable[], roomWidth: number, roomHeight: number, name: string): SeatingTable | null {
  const body = halfBounds(source), footprint = halfBounds(source,true);
  const gap = 20;
  const occupied = tables.map(table => ({ table, bounds: halfBounds(table,true) }));
  const candidate = (x: number, y: number) => {
    const table = { ...source, id: "", name, x_cm: Math.round(x), y_cm: Math.round(y) };
    if (!seatingGeometryFits(table,roomWidth,roomHeight)) return null;
    return occupied.every(item => Math.abs(table.x_cm-item.table.x_cm) >= footprint.x+item.bounds.x+gap ||
      Math.abs(table.y_cm-item.table.y_cm) >= footprint.y+item.bounds.y+gap) ? table : null;
  };
  const positions = [[source.x_cm+2*footprint.x+gap+1,source.y_cm], [source.x_cm-2*footprint.x-gap-1,source.y_cm],
    [source.x_cm,source.y_cm+2*footprint.y+gap+1], [source.x_cm,source.y_cm-2*footprint.y-gap-1]];
  // Include the edges of nearby furniture so a blocked immediate neighbour does
  // not force the copy to the first empty corner of a coarse room grid.
  for (const { table, bounds } of occupied) {
    for (const y of [source.y_cm,table.y_cm]) {
      positions.push([table.x_cm+bounds.x+footprint.x+gap+1,y], [table.x_cm-bounds.x-footprint.x-gap-1,y]);
    }
    for (const x of [source.x_cm,table.x_cm]) {
      positions.push([x,table.y_cm+bounds.y+footprint.y+gap+1], [x,table.y_cm-bounds.y-footprint.y-gap-1]);
    }
  }
  const minX = Math.ceil(body.x), maxX = Math.floor(roomWidth-body.x);
  const minY = Math.ceil(body.y), maxY = Math.floor(roomHeight-body.y);
  if (maxX < minX || maxY < minY) return null;
  // Bound the search even for very large rooms and tiny legacy tables.
  const columns = Math.min(50,Math.floor((maxX-minX)/(2*footprint.x+gap))+1);
  const rows = Math.min(50,Math.floor((maxY-minY)/(2*footprint.y+gap))+1);
  for (let row = 0; row < rows; row++) for (let column = 0; column < columns; column++) {
    const x = columns === 1 ? (minX+maxX)/2 : minX+column*(maxX-minX)/(columns-1);
    const y = rows === 1 ? (minY+maxY)/2 : minY+row*(maxY-minY)/(rows-1);
    positions.push([x,y]);
  }
  positions.sort(([ax,ay],[bx,by]) => (ax-source.x_cm)**2+(ay-source.y_cm)**2-((bx-source.x_cm)**2+(by-source.y_cm)**2));
  for (const [x,y] of positions) {
    const table = candidate(x,y);
    if (table) return table;
  }
  return null;
}
