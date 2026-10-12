"use client";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import Konva from "konva";
import { Group, Rect, Transformer } from "react-konva";
import { CanvasGesture, cancelNodeGesture } from "../../validation/canvasGesture";
import { type SeatingElement } from "../../elements/model";
import { elementBoxFits, elementDragPosition } from "../../elements/interaction";
import type { TableColors } from "../TableDecorations";
import DanceFloorAppearanceRenderer from "../appearance/DanceFloorAppearanceRenderer";
import { appearanceOf } from "../../appearance/model";
import { SEATING_APPEARANCE_RELEASE_ENABLED } from "../../appearance/release";
import DanceFloorVisual from "./DanceFloorVisual";
import StageVisual from "./StageVisual";
import DjBoothVisual from "./DjBoothVisual";

export default function ElementShape({ element, selected, disabled, hand, scale, colors, roomWidth, roomHeight, onSelect, onChange, registerCancellation }: {
  element: SeatingElement; selected: boolean; disabled: boolean; hand: boolean; scale: number; colors: TableColors;
  roomWidth: number; roomHeight: number;
  onSelect: (openDetails?: boolean) => void; onChange: (e: SeatingElement) => void; registerCancellation: (cancel: () => void) => () => void;
}) {
  const node = useRef<Konva.Rect>(null), transformer = useRef<Konva.Transformer>(null);
  const gesture = useRef(new CanvasGesture());
  const [preview, setPreview] = useState<SeatingElement | null>(null);
  const saved = useRef({ x: element.x_cm, y: element.y_cm, width: element.width_cm, height: element.height_cm, rotation: element.rotation_deg });
  const cancel = useCallback(() => {
    gesture.current.cancel();
    if (node.current) cancelNodeGesture(node.current, transformer.current, saved.current);
    setPreview(null);
  }, []);
  useLayoutEffect(() => {
    saved.current = { x: element.x_cm, y: element.y_cm, width: element.width_cm, height: element.height_cm, rotation: element.rotation_deg };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cancel();
  }, [element.x_cm, element.y_cm, element.width_cm, element.height_cm, element.rotation_deg, cancel]);
  useLayoutEffect(() => {
    const unregister = registerCancellation(cancel);
    return () => { cancel(); unregister(); };
  }, [cancel, registerCancellation]);
  const editable = !disabled && !hand && !element.locked;
  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!selected || !editable) cancel();
    if (selected && editable && node.current && transformer.current) transformer.current.nodes([node.current]);
  }, [selected, editable, cancel]);
  function model() {
    const n = node.current!;
    return { ...element, x_cm: Math.round(n.x()), y_cm: Math.round(n.y()),
      width_cm: Math.round(element.width_cm * n.scaleX()), height_cm: Math.round(element.height_cm * n.scaleY()),
      rotation_deg: ((Math.round(n.rotation()) % 360) + 360) % 360 };
  }
  function finish(kind: "drag" | "transform") {
    if (!gesture.current.takeEnd(kind)) return;
    const next = model(); cancel();
    if (editable) onChange(next);
  }
  const shown = preview ?? element;
  const Visual = element.kind === "dance_floor" ? DanceFloorVisual : element.kind === "stage" ? StageVisual : DjBoothVisual;
  return <>
    <Rect ref={node} x={element.x_cm} y={element.y_cm} width={element.width_cm} height={element.height_cm}
      offsetX={element.width_cm / 2} offsetY={element.height_cm / 2} rotation={element.rotation_deg}
      fill="rgba(0,0,0,0)" stroke={selected ? colors.accent : undefined} strokeWidth={2} strokeScaleEnabled={false}
      draggable={editable} dragDistance={5}
      dragBoundFunc={position => {
        const parent = node.current?.getParent();
        if (!parent) return position;
        const transform = parent.getAbsoluteTransform();
        const point = transform.copy().invert().point(position);
        return transform.point(elementDragPosition(element, point, roomWidth, roomHeight));
      }}
      onMouseDown={event => { if (!hand && !element.locked) { event.cancelBubble = true; onSelect(false); } }}
      onTouchStart={event => { if (event.evt.touches.length === 1 && !hand && !element.locked) { event.cancelBubble = true; onSelect(false); } }}
      onClick={() => { if (!hand) onSelect(); }} onTap={() => { if (!hand) onSelect(); }}
      onDragStart={() => gesture.current.begin("drag")} onDragMove={() => { if (gesture.current.isActive("drag")) setPreview(model()); }} onDragEnd={() => finish("drag")}
      onTransformStart={() => gesture.current.begin("transform")} onTransform={() => { if (gesture.current.isActive("transform")) setPreview(model()); }} onTransformEnd={() => finish("transform")} />
    <Group x={shown.x_cm} y={shown.y_cm} rotation={shown.rotation_deg} listening={false}>
      {SEATING_APPEARANCE_RELEASE_ENABLED && element.kind === "dance_floor" ? <DanceFloorAppearanceRenderer width={shown.width_cm} height={shown.height_cm} value={appearanceOf(element)}/> : <Visual width={shown.width_cm} height={shown.height_cm} scale={scale} colors={colors} />}
      {selected && <Rect x={-shown.width_cm/2} y={-shown.height_cm/2} width={shown.width_cm} height={shown.height_cm} stroke={colors.accent} strokeWidth={2} strokeScaleEnabled={false} listening={false} />}
    </Group>
    {selected && editable && <Transformer ref={transformer} keepRatio={false} flipEnabled={false} ignoreStroke
      enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]} anchorSize={14} anchorCornerRadius={3}
      rotateAnchorOffset={34} borderStroke={colors.accent} anchorStroke={colors.accent}
      onMouseDown={event => { event.cancelBubble = true; }} onTouchStart={event => { if (event.evt.touches.length === 1) event.cancelBubble = true; }}
      boundBoxFunc={(oldBox, nextBox) => {
        const parent = node.current?.getParent();
        if (!parent) return oldBox;
        const origin = parent.getAbsoluteTransform().point({ x: 0, y: 0 });
        return elementBoxFits(element, nextBox, { ...origin, scale: parent.getAbsoluteScale().x }, roomWidth, roomHeight) ? nextBox : oldBox;
      }} />}
  </>;
}
