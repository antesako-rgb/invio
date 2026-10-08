"use client";
import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type Ref } from "react";
import { useTranslations } from "next-intl";
import Konva from "konva";
import { Stage, Layer, Rect, Group, Text, Line, Transformer } from "react-konva";
import { normalizeTableTransform, normalizeTablePosition, normalizeRoomTransform, zoomViewport, fitRoomViewport, resizeRoomViewport } from "../validation/editorGeometry";
import { CanvasGesture, cancelNodeGesture } from "../validation/canvasGesture";
import { chairPositions, getChairSize, tableContainsPoint, canAssignToTable, type Point } from "../validation/canvasInteraction";
import { seatingGeometryFits } from "../validation/seatingGeometry";
import type { SeatingTable, PlanData } from "../types";
import styles from "./SeatingWorkspace.module.css";

export type GuestDrag = { id: string; name: string; x: number; y: number };
export type SeatingCanvasControls = { fit: () => void; zoom: (factor: number) => void; hitTable: (x: number, y: number) => string | null };
type Colors = { fill: string; text: string; accent: string };
function stop(event: Konva.KonvaEventObject<Event>) { if ("touches" in event.evt && (event.evt as TouchEvent).touches.length > 1) return; event.cancelBubble = true; }

function TableShape({ table, selected, occupancy, disabled, hand, scale, drop, onSelect, onChange, onInvalid, colors, gestureCancelled, onBegin, registerCancellation }: {
  table: SeatingTable; selected: boolean; occupancy: number; disabled: boolean; hand: boolean; scale: number; drop: "allowed" | "full" | null;
  onSelect: () => void; onChange: (table: SeatingTable) => void; onInvalid: () => void; colors: Colors; gestureCancelled: () => boolean; onBegin: () => void;
  registerCancellation: (cancel: () => void) => () => void;
}) {
  const node = useRef<Konva.Rect>(null);
  const transformer = useRef<Konva.Transformer>(null);
  const [preview, setPreview] = useState<SeatingTable | null>(null);
  const gesture = useRef(new CanvasGesture());
  const savedGeometry = useRef({ x: table.x_cm, y: table.y_cm, width: table.width_cm, height: table.height_cm, rotation: table.rotation_deg });
  const cancel = useCallback(() => {
    gesture.current.cancel();
    if (node.current) cancelNodeGesture(node.current, transformer.current, savedGeometry.current);
    setPreview(null);
  }, []);
  useLayoutEffect(() => {
    savedGeometry.current = { x: table.x_cm, y: table.y_cm, width: table.width_cm, height: table.height_cm, rotation: table.rotation_deg };
    // Konva mutates node attrs outside React; reset that gesture and its preview together.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cancel();
  }, [table.x_cm, table.y_cm, table.width_cm, table.height_cm, table.rotation_deg, cancel]);
  useLayoutEffect(() => {
    const unregister = registerCancellation(cancel);
    return () => { cancel(); unregister(); };
  }, [cancel, registerCancellation]);
  useLayoutEffect(() => {
    // Removing a Konva Transformer does not restore the attached shape's attrs/preview.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!selected || disabled || hand) cancel();
  }, [selected, disabled, hand, cancel]);
  const shown = preview ?? table;
  useEffect(() => {
    if (selected && node.current && transformer.current) {
      transformer.current.nodes([node.current]); transformer.current.getLayer()?.batchDraw();
    }
  }, [selected, disabled, hand, table.width_cm, table.height_cm]);
  function model(kind: "drag" | "transform") {
    const shape = node.current!;
    if (kind === "drag") return normalizeTablePosition(table, shape.position());
    return normalizeTableTransform(table, { x: shape.x(), y: shape.y(), scaleX: shape.scaleX(), scaleY: shape.scaleY(), rotation: shape.rotation() });
  }
  function commit(kind: "drag" | "transform") {
    const shape = node.current;
    if (!shape || !gesture.current.takeEnd(kind)) return;
    const next = model(kind);
    cancel();
    if (gestureCancelled() || hand || disabled) return;
    if (next.width_cm < 10 || next.height_cm < 10 || next.width_cm > 10000 || next.height_cm > 10000) { onInvalid(); return; }
    onChange(next);
  }
  function start(event: Konva.KonvaEventObject<Event>) { if ("touches" in event.evt && (event.evt as TouchEvent).touches.length > 1) return; if (!hand) { onBegin(); stop(event); onSelect(); } }
  const chairSize = getChairSize(shown);
  const labelWidth = Math.max(shown.width_cm, 100 / scale);
  return <>
    <Group x={shown.x_cm} y={shown.y_cm} rotation={shown.rotation_deg} listening={false}>
      {chairPositions(shown).map((chair, index) => <Group key={index} x={chair.x} y={chair.y} rotation={chair.rotation}>
        <Rect width={chairSize} height={chairSize} offsetX={chairSize/2} offsetY={chairSize/2}
          cornerRadius={chairSize*.25} fill={colors.fill} stroke={selected ? colors.accent : colors.text} strokeWidth={1} strokeScaleEnabled={false} />
        <Line points={[-chairSize*.28,-chairSize*.3,chairSize*.28,-chairSize*.3]} stroke={selected ? colors.accent : colors.text}
          strokeWidth={1} strokeScaleEnabled={false} opacity={.65} lineCap="round" />
      </Group>)}
    </Group>
    <Rect ref={node} x={table.x_cm} y={table.y_cm} width={table.width_cm} height={table.height_cm}
      offsetX={table.width_cm/2} offsetY={table.height_cm/2} rotation={table.rotation_deg}
      draggable={!disabled && !hand} dragDistance={5} onMouseDown={start} onTouchStart={start}
      onClick={() => { if (!hand) onSelect(); }} onTap={() => { if (!hand) onSelect(); }}
      onDragStart={() => { gesture.current.begin("drag"); onBegin(); }}
      onDragMove={() => { if (gesture.current.isActive("drag")) setPreview(model("drag")); }}
      onTransform={() => { if (gesture.current.isActive("transform")) setPreview(model("transform")); }}
      onDragEnd={() => commit("drag")} onTransformStart={() => { gesture.current.begin("transform"); onBegin(); }} onTransformEnd={() => commit("transform")}
      cornerRadius={table.shape === "round" ? table.width_cm/2 : 8} fill={colors.fill}
      stroke={drop === "full" ? "#dc2626" : selected || drop ? colors.accent : colors.text} strokeWidth={selected || drop ? 3 : 1} strokeScaleEnabled={false} />
    {/* Label is independent of the rotated/scaled body: it always stays upright. */}
    <Text x={shown.x_cm-labelWidth/2} y={shown.y_cm-30/scale} width={labelWidth} height={60/scale}
      text={table.name + "\n" + occupancy + " / " + table.capacity} align="center" verticalAlign="middle" fontSize={Math.max(18, 12/scale)}
      fill={colors.text} listening={false} ellipsis wrap="none" />
    {selected && !disabled && !hand && <Transformer ref={transformer} onMouseDown={stop} onTouchStart={stop}
      flipEnabled={false} centeredScaling keepRatio={table.shape === "round"} rotateEnabled
      enabledAnchors={table.shape === "round" ? ["top-left", "top-right", "bottom-left", "bottom-right"] : undefined}
      anchorSize={12} rotateAnchorOffset={34} anchorCornerRadius={3} borderStroke={colors.accent} anchorStroke={colors.accent} />}
  </>;
}

export default function SeatingCanvas({ widthCm, heightCm, tables, assignments, selectedId, disabled, onSelect, onChange, onRoomChange, onInvalid, pan, controlsRef, guestDrag, placingGuestId, onPlace }: {
  controlsRef: Ref<SeatingCanvasControls>; pan: boolean; widthCm: number; heightCm: number; tables: SeatingTable[]; assignments: PlanData["assignments"];
  selectedId: string | null; disabled: boolean; onSelect: (id: string | null) => void; onChange: (table: SeatingTable) => void;
  onRoomChange: (width: number, height: number) => void; onInvalid: () => void;
  guestDrag: GuestDrag | null; placingGuestId: string | null; onPlace: (tableId: string) => void;
}) {
  const t = useTranslations("Seating");
  const container = useRef<HTMLDivElement>(null);
  const stage = useRef<Konva.Stage>(null), room = useRef<Konva.Rect>(null), roomTransformer = useRef<Konva.Transformer>(null);
  const [size, setSize] = useState({ width: 800, height: 544 });
  const [view, setView] = useState({ x: 24, y: 24, scale: .35 });
  const [space, setSpace] = useState(false);
  const [pinching, setPinching] = useState(false);
  const pinch = useRef<{ distance: number; center: Point } | null>(null);
  const cancelGesture = useRef(false);
  const roomGesture = useRef(new CanvasGesture());
  const tableCancellations = useRef(new Set<() => void>());
  const registerCancellation = useCallback((cancel: () => void) => {
    tableCancellations.current.add(cancel);
    return () => { tableCancellations.current.delete(cancel); };
  }, []);
  const roomDimensions = useRef({ width: widthCm, height: heightCm });
  useLayoutEffect(() => { roomDimensions.current = { width: widthCm, height: heightCm }; }, [widthCm, heightCm]);
  const lastSize = useRef<{ width: number; height: number } | null>(null);
  const [frame, setFrame] = useState({ left: 0, top: 0, right: 0, bottom: 0 });
  const [roomPreview, setRoomPreview] = useState<ReturnType<typeof normalizeRoomTransform> | null>(null);
  const [colors, setColors] = useState<Colors>({ fill: "#ffffff", text: "#242424", accent: "#6557ff" });
  const hand = pan || space || pinching || !!guestDrag;
  const cancelRoom = useCallback(() => {
    roomGesture.current.cancel();
    const dims = roomDimensions.current;
    if (room.current) cancelNodeGesture(room.current, roomTransformer.current, { x: 0, y: 0, width: dims.width, height: dims.height });
    setRoomPreview(null);
  }, []);
  const cancelAll = useCallback(() => {
    cancelGesture.current = true;
    cancelRoom();
    for (const cancel of tableCancellations.current) cancel();
    stage.current?.stopDrag();
    pinch.current = null;
  }, [cancelRoom]);
  useLayoutEffect(() => {
    // Synchronize interrupted external Konva transforms before switching interaction modes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (hand || disabled || placingGuestId) cancelAll();
    else if (selectedId) cancelRoom();
  }, [hand, disabled, placingGuestId, selectedId, cancelAll, cancelRoom]);
  const fit = useCallback((width: number, height: number) => {
    cancelAll();
    const dims = roomDimensions.current;
    setView(fitRoomViewport(dims.width,dims.height,{ width,height }));
  }, [cancelAll]);
  useEffect(() => {
    const element = container.current; if (!element) return;
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width < 1 || height < 1) return;
      const previousSize = lastSize.current;
      // Konva stores an absolute pointer/box at transform start. Invalidate the
      // unfinished gesture BEFORE responsive fitting changes the Stage scale.
      if (previousSize && (width !== previousSize.width || height !== previousSize.height)) cancelAll();
      setSize({ width, height });
      const dims = roomDimensions.current;
      setView(old => resizeRoomViewport(old,previousSize,{ width,height },dims.width,dims.height));
      lastSize.current = { width,height };
      const rect = element.getBoundingClientRect(); setFrame({ left:rect.left,top:rect.top,right:rect.right,bottom:rect.bottom });
      const css = getComputedStyle(element);
      const value = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
      setColors({ fill: value("--card", "#ffffff"), text: value("--foreground", "#242424"), accent: value("--primary", "#6557ff") });
    });
    observer.observe(element); return () => observer.disconnect();
  }, [cancelAll]);
  useEffect(() => {
    function down(event: KeyboardEvent) {
      if (event.code !== "Space" || event.repeat || (event.target instanceof HTMLElement && (event.target.isContentEditable || /INPUT|TEXTAREA|SELECT|BUTTON/.test(event.target.tagName)))) return;
      event.preventDefault(); cancelAll(); setSpace(true);
    }
    function up(event: KeyboardEvent) { if (event.code === "Space") setSpace(false); }
    function blur() { cancelAll(); setSpace(false); setPinching(false); }
    window.addEventListener("keydown", down); window.addEventListener("keyup", up); window.addEventListener("blur", blur);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); window.removeEventListener("blur", blur); };
  }, [cancelAll]);
  useEffect(() => {
    if (!selectedId && !disabled && !hand && !placingGuestId && room.current && roomTransformer.current) {
      roomTransformer.current.nodes([room.current]); roomTransformer.current.getLayer()?.batchDraw();
    }
  }, [selectedId, disabled, hand, placingGuestId, widthCm, heightCm]);
  function zoom(factor: number, pointer = { x: size.width/2, y: size.height/2 }) { cancelAll(); setView(old => zoomViewport(old, factor, pointer)); }
  function canvasPoint(x: number, y: number) {
    const rect = container.current?.getBoundingClientRect(), node = stage.current;
    if (!rect || !node || x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return null;
    return { x: (x-rect.left-node.x())/node.scaleX(), y: (y-rect.top-node.y())/node.scaleY() };
  }
  function hitTable(x: number, y: number) {
    const point = canvasPoint(x,y);
    return point ? [...tables].reverse().find(table => tableContainsPoint(table, point))?.id ?? null : null;
  }
  useImperativeHandle(controlsRef, () => ({ fit: () => fit(size.width, size.height), zoom, hitTable }));
  const ghost = guestDrag && guestDrag.x >= frame.left && guestDrag.x <= frame.right && guestDrag.y >= frame.top && guestDrag.y <= frame.bottom ? { x:(guestDrag.x-frame.left-view.x)/view.scale,y:(guestDrag.y-frame.top-view.y)/view.scale } : null;
  const target = ghost ? [...tables].reverse().find(table => tableContainsPoint(table, ghost)) : null;
  function begin(event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
    if ("touches" in event.evt && event.evt.touches.length > 1) {
      cancelAll(); setPinching(true); return;
    }
    cancelGesture.current = false;
    if (!hand && (event.target === stage.current || event.target === room.current)) onSelect(null);
  }
  function touchMove(event: Konva.KonvaEventObject<TouchEvent>) {
    if (event.evt.touches.length !== 2) return;
    event.evt.preventDefault();
    if (!pinch.current) cancelAll();
    setPinching(true);
    const [a,b] = Array.from(event.evt.touches), rect = container.current!.getBoundingClientRect();
    const center = { x: (a.clientX+b.clientX)/2-rect.left, y: (a.clientY+b.clientY)/2-rect.top };
    const distance = Math.hypot(a.clientX-b.clientX, a.clientY-b.clientY);
    const previous = pinch.current;
    if (previous) setView(old => {
      const next = zoomViewport(old, distance/previous.distance, previous.center);
      return { ...next, x: next.x+center.x-previous.center.x, y: next.y+center.y-previous.center.y };
    });
    pinch.current = { distance, center };
  }
  function previewRoom() {
    const node = room.current!;
    return normalizeRoomTransform(widthCm,heightCm,{ x:node.x(),y:node.y(),scaleX:node.scaleX(),scaleY:node.scaleY() });
  }
  function commitRoom() {
    if (!roomGesture.current.takeEnd("transform")) return;
    const next = previewRoom();
    cancelRoom();
    if (hand || disabled || cancelGesture.current) return;
    if (next.width < 100 || next.width > 100000 || next.height < 100 || next.height > 100000 || tables.some(table => !seatingGeometryFits(table,next.width,next.height))) { onInvalid(); return; }
    // Top/left handles shift the visual origin. Keep that framing in the viewport;
    // only room dimensions are persisted, table cm coordinates stay unchanged.
    setView(old => ({ ...old,x:old.x+next.x*old.scale,y:old.y+next.y*old.scale }));
    onRoomChange(next.width,next.height);
  }
  return <div className={styles.canvasWorkspace}>
    <div ref={container} className={styles.canvas} data-hand={hand} role="region" tabIndex={0} onMouseDown={() => container.current?.focus({ preventScroll:true })}
      onTouchCancelCapture={() => { cancelAll(); setPinching(false); }} onPointerCancelCapture={() => { cancelAll(); setPinching(false); }} aria-label={t("canvasLabel")}>
      <Stage ref={stage} width={size.width} height={size.height} x={view.x} y={view.y} scaleX={view.scale} scaleY={view.scale}
        draggable={!pinching && !guestDrag && !placingGuestId} dragDistance={5} onMouseDown={begin} onTouchStart={begin}
        onDragEnd={event => { if (event.target === stage.current) setView(old => ({ ...old, x:event.target.x(), y:event.target.y() })); }}
        onTouchMove={touchMove} onTouchEnd={event => { if (!event.evt.touches.length) { pinch.current=null; setPinching(false); } }}
        onWheel={event => { event.evt.preventDefault(); const pointer=stage.current?.getPointerPosition(); if (pointer) zoom(event.evt.deltaY<0 ? 1.1 : 1/1.1,pointer); }}>
        <Layer>
          <Rect ref={room} width={widthCm} height={heightCm} fill={colors.fill} stroke={colors.text} strokeWidth={1} strokeScaleEnabled={false}
            onTransformStart={() => { cancelGesture.current = false; roomGesture.current.begin("transform"); }}
            onTransform={() => { if (roomGesture.current.isActive("transform")) setRoomPreview(previewRoom()); }} onTransformEnd={commitRoom} />
          <Group x={roomPreview?.x ?? 0} y={roomPreview?.y ?? 0}>
          <Text x={0} y={-26/view.scale} text={t("roomSize", { width:roomPreview?.width ?? widthCm, height:roomPreview?.height ?? heightCm })} fontSize={12/view.scale} fill={colors.text} listening={false} />
          {tables.map(table => <TableShape key={table.id} table={table} selected={selectedId === table.id} disabled={disabled || !!placingGuestId || !!roomPreview} hand={hand}
            scale={view.scale} colors={colors} occupancy={assignments.filter(item => item.table_id === table.id).length}
            drop={target?.id === table.id && guestDrag ? canAssignToTable(table.capacity,table.id,guestDrag.id,assignments) ? "allowed" : "full" : null}
            onSelect={() => { if (placingGuestId) onPlace(table.id); else onSelect(table.id); }}
            onBegin={() => { cancelGesture.current=false; }} gestureCancelled={() => cancelGesture.current} onInvalid={onInvalid}
            registerCancellation={registerCancellation}
            onChange={next => { if (seatingGeometryFits(next,widthCm,heightCm)) onChange(next); else onInvalid(); }} />)}
          </Group>
          {!selectedId && !disabled && !hand && !placingGuestId && <Transformer ref={roomTransformer} onMouseDown={stop} onTouchStart={stop} rotateEnabled={false} keepRatio={false}
            flipEnabled={false} enabledAnchors={["top-left","top-center","top-right","middle-left","middle-right","bottom-left","bottom-center","bottom-right"]} anchorSize={14} anchorCornerRadius={3} borderStroke={colors.accent} anchorStroke={colors.accent} />}
          {ghost && guestDrag && <Group x={ghost.x} y={ghost.y} listening={false}>
            <Rect x={12/view.scale} y={-32/view.scale} width={180/view.scale} height={32/view.scale} fill={colors.accent} cornerRadius={8/view.scale} />
            <Text x={20/view.scale} y={-24/view.scale} width={164/view.scale} fontSize={13/view.scale} text={guestDrag.name} fill="#ffffff" ellipsis wrap="none" />
          </Group>}
        </Layer>
      </Stage>
    </div>
    <p className={styles.canvasHint}>{t("canvasHelp")}</p>
  </div>;
}
