import { elementFits, type SeatingElement } from "./model";

export type ElementBox = { x: number; y: number; width: number; height: number; rotation: number };
export type ElementViewport = { x: number; y: number; scale: number };

/** Konva Transformer boxes have an absolute rotated top-left and radians.
 * Persisted elements have a room-local center, integer cm and degrees. */
export function elementFromBox(element: SeatingElement, box: ElementBox, view: ElementViewport): SeatingElement {
  const cos = Math.cos(box.rotation), sin = Math.sin(box.rotation);
  return {
    ...element,
    x_cm: Math.round((box.x + cos * box.width / 2 - sin * box.height / 2 - view.x) / view.scale),
    y_cm: Math.round((box.y + sin * box.width / 2 + cos * box.height / 2 - view.y) / view.scale),
    width_cm: Math.round(box.width / view.scale), height_cm: Math.round(box.height / view.scale),
    rotation_deg: ((Math.round(box.rotation * 180 / Math.PI) % 360) + 360) % 360,
  };
}

export function elementBoxFits(element: SeatingElement, box: ElementBox, view: ElementViewport, width: number, height: number) {
  return view.scale > 0 && box.width > 0 && box.height > 0 && elementFits(elementFromBox(element, box, view), width, height);
}

/** Clamp the rounded center, not an unrotated bounding box. Integer limits
 * ensure final rounding cannot push an otherwise valid footprint outside. */
export function elementDragPosition(element: SeatingElement, point: { x: number; y: number }, width: number, height: number) {
  const angle = element.rotation_deg * Math.PI / 180;
  const halfX = (Math.abs(Math.cos(angle)) * element.width_cm + Math.abs(Math.sin(angle)) * element.height_cm) / 2;
  const halfY = (Math.abs(Math.sin(angle)) * element.width_cm + Math.abs(Math.cos(angle)) * element.height_cm) / 2;
  const minX = Math.ceil(halfX - 1e-7), maxX = Math.floor(width - halfX + 1e-7);
  const minY = Math.ceil(halfY - 1e-7), maxY = Math.floor(height - halfY + 1e-7);
  if (minX > maxX || minY > maxY) return { x: element.x_cm, y: element.y_cm };
  return { x: Math.max(minX, Math.min(maxX, Math.round(point.x))), y: Math.max(minY, Math.min(maxY, Math.round(point.y))) };
}
