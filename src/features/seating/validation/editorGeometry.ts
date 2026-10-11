import type { SeatingTable } from "../types";
import { getTablePreviewBounds } from "./canvasInteraction";
export type Viewport = { x: number; y: number; scale: number };
export function zoomViewport(view: Viewport, factor: number, pointer: { x: number; y: number }): Viewport {
  const scale = Math.max(.0001, Math.min(20, view.scale * factor));
  const x = (pointer.x - view.x) / view.scale;
  const y = (pointer.y - view.y) / view.scale;
  return { scale, x: pointer.x - x * scale, y: pointer.y - y * scale };
}
/** Rotation changes only the angle; table dimensions and center remain fixed. */
export function normalizeTableRotation(table: SeatingTable, rotation: number): SeatingTable {
  return { ...table, rotation_deg: ((Math.round(rotation) % 360) + 360) % 360 };
}

/** Moving a table must never persist leftover canvas scaling or rotation. */
export function normalizeTablePosition(table: SeatingTable, position: { x: number; y: number }): SeatingTable {
  return { ...table, x_cm: Math.round(position.x), y_cm: Math.round(position.y) };
}

/** A resized room is normalized back to (0,0); its visual origin is absorbed by the viewport.
 * Tables retain their cm coordinates relative to the room, without batch table writes. */
export function normalizeRoomTransform(width: number, height: number, transform: {
  x: number; y: number; scaleX: number; scaleY: number;
}) {
  return { width: Math.round(width * transform.scaleX), height: Math.round(height * transform.scaleY),
    x: transform.x, y: transform.y };
}

export type CanvasSize = { width: number; height: number };
/** Focus furniture including rotated chairs; room/table centimetres stay untouched. */
export function focusTableViewport(table: SeatingTable, size: CanvasSize): Viewport {
  const bounds = getTablePreviewBounds(table);
  const angle = table.rotation_deg * Math.PI / 180;
  const width = Math.abs(Math.cos(angle)) * bounds.width + Math.abs(Math.sin(angle)) * bounds.height;
  const height = Math.abs(Math.sin(angle)) * bounds.width + Math.abs(Math.cos(angle)) * bounds.height;
  const padding = Math.min(56, size.width / 4, size.height / 4);
  const scale = Math.max(.0001, Math.min(20, (size.width - padding * 2) / width, (size.height - padding * 2) / height));
  return { scale, x: size.width / 2 - table.x_cm * scale, y: size.height / 2 - table.y_cm * scale };
}
export function fitRoomViewport(roomWidth: number, roomHeight: number, size: CanvasSize): Viewport {
  const padding = Math.min(size.width < 768 ? 24 : 44, size.width/4, size.height/4);
  const scale = Math.max(.0001, Math.min((size.width-padding*2)/roomWidth, (size.height-padding*2)/roomHeight));
  return { scale,x:(size.width-roomWidth*scale)/2,y:(size.height-roomHeight*scale)/2 };
}
/** Width changes (desktop/mobile, orientation) refit; height-only notices keep manual zoom. */
export function resizeRoomViewport(view: Viewport, previous: CanvasSize | null, next: CanvasSize, roomWidth: number, roomHeight: number): Viewport {
  if (!previous || Math.abs(next.width-previous.width) > 1) return fitRoomViewport(roomWidth,roomHeight,next);
  return { ...view,x:view.x+(next.width-previous.width)/2,y:view.y+(next.height-previous.height)/2 };
}
