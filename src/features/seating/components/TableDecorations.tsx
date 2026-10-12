"use client";
import { Group, Line, Rect, Text } from "react-konva";
import type Konva from "konva";
import { chairPositions, getChairSize, getSeatNameLayout, getTableLabelLayout } from "../validation/canvasInteraction";
import type { SeatingTable } from "../types";
import { TABLE_PRESETS, type TableTheme } from "../appearance/presets";

export type TableColors = { fill: string; text: string; accent: string; accentText: string };
export type VisualTable = Pick<SeatingTable, "shape" | "capacity" | "width_cm" | "height_cm" | "x_cm" | "y_cm" | "rotation_deg" | "name">;
export type TableSeatAssignment = { project_guest_id: string; seat_number: number | null };
type SeatPerson = { id: string; first_name: string; last_name: string | null };

/** The editor and creation preview share the same chairs and upright labels. */
export function TableChairs({ table, assignments = [], selected = false, colors, activeSeatNumber = null,
  onSeatSelect, disabled = false, hand = false, scale = 1, theme = "generic" }: {
  table: VisualTable; assignments?: readonly TableSeatAssignment[]; selected?: boolean; colors: TableColors;
  activeSeatNumber?: number | null; onSeatSelect?: (seatNumber: number) => void;
  disabled?: boolean; hand?: boolean; scale?: number; theme?: TableTheme;
}) {
  const size = getChairSize(table);
  const skin = theme === "generic" ? null : TABLE_PRESETS[theme];
  const occupiedSeats = new Set(assignments.flatMap(assignment => assignment.seat_number === null ? [] : [assignment.seat_number]));
  const interactive = !!onSeatSelect && !disabled && !hand;
  function start(event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
    if (!interactive || ("touches" in event.evt && event.evt.touches.length>1)) return;
    event.cancelBubble = true;
  }
  function select(event: Konva.KonvaEventObject<MouseEvent | TouchEvent>, seatNumber: number) {
    if (!interactive || ("touches" in event.evt && event.evt.touches.length>1)) return;
    event.cancelBubble = true;
    onSeatSelect?.(seatNumber);
  }
  return <Group x={table.x_cm} y={table.y_cm} rotation={table.rotation_deg} listening={interactive}>
    {chairPositions(table).map(chair => {
      const occupied = occupiedSeats.has(chair.seatNumber), active = activeSeatNumber === chair.seatNumber;
      return <Group key={chair.seatNumber} x={chair.x} y={chair.y} rotation={chair.rotation}
        onMouseDown={start} onTouchStart={start}
        onClick={event => select(event,chair.seatNumber)} onTap={event => select(event,chair.seatNumber)}>
        <Rect width={size} height={size} offsetX={size/2} offsetY={size/2}
          cornerRadius={size*.25} fill={occupied ? colors.accent : skin?.chair ?? colors.fill}
          stroke={occupied || selected || active ? colors.accent : skin?.frame ?? colors.text} strokeWidth={active ? 2.5 : skin ? 1.4 : 1}
          strokeScaleEnabled={false} hitStrokeWidth={interactive ? Math.max(0,10/Math.max(scale,.001)-size) : 0} />
        {skin && size*scale >= 8 && <>
          <Rect x={-size*.35} y={-size*.39} width={size*.7} height={size*.18} cornerRadius={size*.06}
            fill={occupied ? colors.accent : skin.chair} stroke={occupied ? colors.accentText : skin.seam} strokeWidth={size*.025} listening={false}/>
          <Line points={[-size*.3,size*.26,size*.3,size*.26]} stroke={occupied ? colors.accentText : skin.seam} strokeWidth={size*.025} opacity={.8} listening={false}/>
          {theme === "rustic_green" && <Line points={[-size*.42,-size*.24,-size*.42,size*.3,size*.42,size*.3,size*.42,-size*.24]} stroke={skin.frame} strokeWidth={size*.035} listening={false}/>}
          {(theme === "elegant_gold" || theme === "classic_ivory") && <>
            <Line points={[-size*.24,-size*.36,-size*.24,-size*.23,0,-size*.23,0,-size*.36,size*.24,-size*.36,size*.24,-size*.23]}
              stroke={occupied ? colors.accentText : skin.frame} strokeWidth={size*.025} opacity={.7} listening={false}/>
            <Rect x={-size*.3} y={-size*.15} width={size*.6} height={size*.34} cornerRadius={size*.1}
              stroke={occupied ? colors.accentText : skin.seam} strokeWidth={size*.018} opacity={.65} listening={false}/>
          </>}
        </>}
        <Line points={[-size*.28,-size*.3,size*.28,-size*.3]} stroke={occupied ? colors.accentText : selected ? colors.accent : colors.text}
          strokeWidth={1} strokeScaleEnabled={false} opacity={.65} lineCap="round" listening={false} />
        {!selected && occupied && <Line points={[-size*.19,-size*.02,-size*.03,size*.14,size*.23,-size*.15]} stroke={colors.accentText}
          strokeWidth={1} strokeScaleEnabled={false} lineCap="round" lineJoin="round" listening={false} />}
        {selected && size*scale>=22 && <Text x={0} y={0} width={size} height={size}
          text={String(chair.seatNumber)} fontSize={Math.min(size*.42,12/Math.max(scale,.001))}
          fill={occupied ? colors.accentText : colors.text} align="center" verticalAlign="middle"
          rotation={-table.rotation_deg-chair.rotation} offsetX={size/2} offsetY={size/2} listening={false} />}
      </Group>;
    })}
  </Group>;
}

/** Names are derived from project people and concrete saved seats, never assignment order. */
export function TableSeatNames({ table, assignments, people, colors, scale = 1 }: {
  table: VisualTable; assignments: readonly TableSeatAssignment[]; people: readonly SeatPerson[];
  colors: TableColors; scale?: number;
}) {
  const personById = new Map(people.map(person => [person.id,person]));
  return <Group listening={false}>
    {assignments.map(assignment => {
      if (assignment.seat_number === null) return null;
      const person = personById.get(assignment.project_guest_id);
      const layout = getSeatNameLayout(table,assignment.seat_number,scale);
      if (!person || !layout) return null;
      const name = [person.first_name,person.last_name].filter(Boolean).join(" ");
      return <Group key={assignment.project_guest_id} x={layout.x} y={layout.y}>
        <Rect width={layout.width} height={layout.height} fill={colors.fill} opacity={.94}
          cornerRadius={3/Math.max(scale,.001)} />
        <Text width={layout.width} height={layout.height} text={name} align="center" verticalAlign="middle"
          fontSize={layout.fontSize} lineHeight={layout.lineHeight} fill={colors.text} padding={2/Math.max(scale,.001)}
          wrap="word" ellipsis />
      </Group>;
    })}
  </Group>;
}

export function TableLabel({ table, occupancy, colors }: { table: VisualTable; occupancy: number; colors: TableColors }) {
  const label = getTableLabelLayout(table);
  return <Group x={table.x_cm} y={table.y_cm} listening={false}>
    <Text x={-label.width/2} y={-label.height/2} width={label.width} height={label.nameHeight}
      text={table.name} align="center" verticalAlign="middle" fontSize={label.nameFontSize} lineHeight={label.lineHeight}
      fontStyle="bold" fill={colors.text} ellipsis wrap="none" />
    <Text x={-label.width/2} y={-label.height/2+label.nameHeight+label.gap} width={label.width} height={label.occupancyHeight}
      text={occupancy + " / " + table.capacity} align="center" verticalAlign="middle" fontSize={label.occupancyFontSize} lineHeight={label.lineHeight}
      fill={colors.text} ellipsis wrap="none" />
  </Group>;
}
