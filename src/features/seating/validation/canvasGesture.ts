import type Konva from "konva";

type GestureKind = "drag" | "transform";
/** End events emitted by cancellation or a detached Transformer must not become writes. */
export class CanvasGesture {
  private kind: GestureKind | null = null;
  begin(kind: GestureKind) { this.kind = kind; }
  isActive(kind: GestureKind) { return this.kind === kind; }
  cancel() { this.kind = null; }
  takeEnd(kind: GestureKind) {
    if (!this.isActive(kind)) return false;
    this.cancel();
    return true;
  }
}

/** The caller invalidates its gesture before this: stopTransform/stopDrag can emit end events. */
export function cancelNodeGesture(node: Konva.Rect, transformer: Konva.Transformer | null, saved: {
  x: number; y: number; width: number; height: number; rotation?: number;
}) {
  transformer?.stopTransform();
  if (node.isDragging()) node.stopDrag();
  node.setAttrs({ ...saved, rotation: saved.rotation ?? 0, scaleX: 1, scaleY: 1 });
  transformer?.forceUpdate();
  node.getLayer()?.batchDraw();
}
