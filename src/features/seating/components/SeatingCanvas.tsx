"use client";
import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type Ref } from "react";
import { useTranslations } from "next-intl";
import { createPortal } from "react-dom";
import Konva from "konva";
import { Check, GripVertical } from "lucide-react";
import { Stage, Layer, Rect, Group, Text, Transformer } from "react-konva";
import { normalizeTableRotation, normalizeTablePosition, normalizeRoomTransform, zoomViewport, fitRoomViewport, resizeRoomViewport, focusTableViewport } from "../validation/editorGeometry";
import { CanvasGesture, cancelNodeGesture } from "../validation/canvasGesture";
import { tableContainsPoint, getChairSize, hitGuestDropTarget, clientToRoomPoint, type Point } from "../validation/canvasInteraction";
import { getGuestDropIntent } from "../validation/seatingUx";
import { getSeatAssignmentIssue } from "../validation/seatAssignment";
import { TableChairs, TableLabel, TableSeatNames, type TableColors } from "./TableDecorations";
import TableSurface, { TABLE_RIM_FILL } from "./TableSurface";
import { seatingGeometryFits } from "../validation/seatingGeometry";
import type { SeatingTable, PlanData, SeatTarget } from "../types";
import styles from "./SeatingWorkspace.module.css";

export type GuestDrag = { id: string; name: string; x: number; y: number; pointerType?: string };
export type SeatingCanvasControls = { fit: () => void; focusTable: (id: string) => void; zoom: (factor: number) => void; hitTable: (x: number, y: number) => string | null; hitTarget: (x: number, y: number, pointerType?: string) => SeatTarget | null };
type Colors = TableColors;
function stop(event: Konva.KonvaEventObject<Event>) { if ("touches" in event.evt && (event.evt as TouchEvent).touches.length > 1) return; event.cancelBubble = true; }

function TableShape({ table, selected, occupancy, assignments, people, scale, seatsDisabled, dropSeatNumber, onSeatSelect, disabled, hand, drop, onSelect, onChange, colors, gestureCancelled, onBegin, registerCancellation }: {
  table: SeatingTable; selected: boolean; occupancy: number; disabled: boolean; hand: boolean; drop: "allowed" | "full" | null;
  assignments: PlanData["assignments"]; people: PlanData["people"]; scale: number; seatsDisabled: boolean; dropSeatNumber: number | null; onSeatSelect: (number: number) => void;
  onSelect: (openDetails?: boolean) => void; onChange: (table: SeatingTable) => void; colors: Colors; gestureCancelled: () => boolean; onBegin: () => void;
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
    return normalizeTableRotation(table, shape.rotation());
  }
  function commit(kind: "drag" | "transform") {
    const shape = node.current;
    if (!shape || !gesture.current.takeEnd(kind)) return;
    const next = model(kind);
    cancel();
    if (gestureCancelled() || hand || disabled) return;
    onChange(next);
  }
  function start(event: Konva.KonvaEventObject<Event>) { if ("touches" in event.evt && (event.evt as TouchEvent).touches.length > 1) return; if (!hand) { onBegin(); stop(event); onSelect(false); } }
  return <>
    <TableChairs table={shown} assignments={assignments} selected={selected} colors={colors} scale={scale}
      activeSeatNumber={dropSeatNumber} disabled={seatsDisabled} hand={hand} onSeatSelect={onSeatSelect} />
    <Rect ref={node} x={table.x_cm} y={table.y_cm} width={table.width_cm} height={table.height_cm}
      offsetX={table.width_cm/2} offsetY={table.height_cm/2} rotation={table.rotation_deg}
      draggable={!disabled && !hand} dragDistance={5} onMouseDown={start} onTouchStart={start}
      onClick={() => { if (!hand) onSelect(); }} onTap={() => { if (!hand) onSelect(); }}
      onDragStart={() => { gesture.current.begin("drag"); onBegin(); }}
      onDragMove={() => { if (gesture.current.isActive("drag")) setPreview(model("drag")); }}
      onTransform={() => { if (gesture.current.isActive("transform")) setPreview(model("transform")); }}
      onDragEnd={() => commit("drag")} onTransformStart={() => { gesture.current.begin("transform"); onBegin(); }} onTransformEnd={() => commit("transform")}
      cornerRadius={table.shape === "round" ? table.width_cm/2 : 8} fill={TABLE_RIM_FILL}
      stroke={drop === "full" ? "#dc2626" : selected || drop ? colors.accent : colors.text} strokeWidth={selected || drop ? 3 : 1} strokeScaleEnabled={false} />
    <TableSurface table={shown} colors={colors} scale={scale} />
    {/* Label stays upright inside the body and zooms together with the table. */}
    <TableLabel table={shown} occupancy={occupancy} colors={colors} />
    {getChairSize(shown)*scale >= (selected ? 18 : 24) && <TableSeatNames table={shown} assignments={assignments} people={people} colors={colors} scale={scale} />}
    {selected && !disabled && !hand && <Transformer ref={transformer} onMouseDown={stop} onTouchStart={stop}
      resizeEnabled={false} enabledAnchors={[]} rotateEnabled ignoreStroke
      anchorSize={12} rotateAnchorOffset={34} anchorCornerRadius={3} borderStroke={colors.accent} anchorStroke={colors.accent} />}
  </>;
}

export default function SeatingCanvas({ widthCm, heightCm, tables, assignments, people, onSeatSelect, selectedId, disabled, onSelect, onChange, onRoomChange, onInvalid, pan, controlsRef, guestDrag, editingSeat, seatClicksDisabled = false, mobile = false }: {
  controlsRef: Ref<SeatingCanvasControls>; pan: boolean; widthCm: number; heightCm: number; tables: SeatingTable[]; assignments: PlanData["assignments"];
  people: PlanData["people"]; onSeatSelect: (tableId: string, seatNumber: number) => void;
  selectedId: string | null; disabled: boolean; onSelect: (id: string | null, openDetails?: boolean) => void; onChange: (table: SeatingTable) => void;
  onRoomChange: (width: number, height: number) => void; onInvalid: () => void;
  guestDrag: GuestDrag | null; editingSeat: boolean; seatClicksDisabled?: boolean; mobile?: boolean;
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
  useLayoutEffect(() => {
    if (!guestDrag || !container.current) return;
    const rect = container.current.getBoundingClientRect();
    // Keep drag feedback aligned after a banner, drawer or scroll changes the frame.
    setFrame(previous => previous.left === rect.left && previous.top === rect.top && previous.right === rect.right && previous.bottom === rect.bottom
      ? previous : { left:rect.left,top:rect.top,right:rect.right,bottom:rect.bottom });
  }, [guestDrag]);
  const [roomPreview, setRoomPreview] = useState<ReturnType<typeof normalizeRoomTransform> | null>(null);
  const [colors, setColors] = useState<Colors>({ fill: "#ffffff", text: "#242424", accent: "#6557ff", accentText: "#ffffff" });
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
    if (hand || disabled || editingSeat) cancelAll();
    else if (selectedId) cancelRoom();
  }, [hand, disabled, editingSeat, selectedId, cancelAll, cancelRoom]);
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
      setColors({ fill: value("--card", "#ffffff"), text: value("--foreground", "#242424"), accent: value("--primary", "#6557ff"), accentText: value("--primary-foreground", "#ffffff") });
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
    if (!selectedId && !disabled && !hand && !editingSeat && room.current && roomTransformer.current) {
      roomTransformer.current.nodes([room.current]); roomTransformer.current.getLayer()?.batchDraw();
    }
  }, [selectedId, disabled, hand, editingSeat, widthCm, heightCm]);
  function zoom(factor: number, pointer = { x: size.width/2, y: size.height/2 }) { cancelAll(); setView(old => zoomViewport(old, factor, pointer)); }
  function canvasPoint(x: number, y: number) {
    const rect = container.current?.getBoundingClientRect(), node = stage.current;
    if (!rect || !node) return null;
    return clientToRoomPoint({ x,y },rect,{ x:node.x(),y:node.y(),scale:node.scaleX() },{ width:node.width(),height:node.height() });
  }
  function hitTable(x: number, y: number) {
    const point = canvasPoint(x,y);
    return point ? [...tables].reverse().find(table => tableContainsPoint(table, point))?.id ?? null : null;
  }
  function hitTarget(x: number, y: number, pointerType = "mouse"): SeatTarget | null {
    const point = canvasPoint(x, y);
    const node = stage.current,rect = container.current?.getBoundingClientRect();
    if (!point || !node || !rect) return null;
    const screenScale = node.scaleX()*Math.min(rect.width/node.width(),rect.height/node.height());
    return hitGuestDropTarget(tables,point,screenScale,pointerType);
  }
  function focusTable(id: string) {
    const table = tables.find(item => item.id === id);
    if (!table) return;
    cancelAll(); setView(focusTableViewport(table, size));
  }
  useImperativeHandle(controlsRef, () => ({ fit: () => fit(size.width, size.height), focusTable, zoom, hitTable, hitTarget }));
  const ghost = guestDrag ? clientToRoomPoint(guestDrag,frame,view,size) : null;
  const screenScale = view.scale*Math.min((frame.right-frame.left)/size.width,(frame.bottom-frame.top)/size.height);
  const dropTarget = ghost ? hitGuestDropTarget(tables,ghost,screenScale,guestDrag?.pointerType) : null;
  const target = tables.find(table => table.id === dropTarget?.tableId);
  const dropIssue = target && guestDrag ? getSeatAssignmentIssue(target,guestDrag.id,dropTarget?.seatNumber ?? null,assignments) : null;
  function begin(event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
    if ("touches" in event.evt && event.evt.touches.length > 1) {
      cancelAll(); setPinching(true); return;
    }
    cancelGesture.current = false;
    if (!hand && (event.target === stage.current || event.target === room.current)) onSelect(null, false);
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
    <div ref={container} className={styles.canvas} data-hand={hand} data-guest-drag={!!guestDrag} role="region" tabIndex={0} onMouseDown={() => container.current?.focus({ preventScroll:true })}
      onTouchCancelCapture={() => { cancelAll(); setPinching(false); }} onPointerCancelCapture={() => { cancelAll(); setPinching(false); }} aria-label={t("canvasLabel")}>
      <Stage ref={stage} width={size.width} height={size.height} x={view.x} y={view.y} scaleX={view.scale} scaleY={view.scale}
        draggable={!pinching && !guestDrag} dragDistance={5} onMouseDown={begin} onTouchStart={begin}
        onDragEnd={event => { if (event.target === stage.current) setView(old => ({ ...old, x:event.target.x(), y:event.target.y() })); }}
        onTouchMove={touchMove} onTouchEnd={event => { if (!event.evt.touches.length) { pinch.current=null; setPinching(false); } }}
        onWheel={event => { event.evt.preventDefault(); const pointer=stage.current?.getPointerPosition(); if (pointer) zoom(event.evt.deltaY<0 ? 1.1 : 1/1.1,pointer); }}>
        <Layer>
          <Rect ref={room} width={widthCm} height={heightCm} fill={colors.fill} stroke={colors.text} strokeWidth={1} strokeScaleEnabled={false}
            onTransformStart={() => { cancelGesture.current = false; roomGesture.current.begin("transform"); }}
            onTransform={() => { if (roomGesture.current.isActive("transform")) setRoomPreview(previewRoom()); }} onTransformEnd={commitRoom} />
          <Group x={roomPreview?.x ?? 0} y={roomPreview?.y ?? 0}>
          <Text x={0} y={-26/view.scale} text={t("roomSize", { width:roomPreview?.width ?? widthCm, height:roomPreview?.height ?? heightCm })} fontSize={12/view.scale} fill={colors.text} listening={false} />
          {tables.map(table => <TableShape key={table.id} table={table} selected={selectedId === table.id} disabled={disabled || !!editingSeat || !!roomPreview} hand={hand}
            colors={colors} occupancy={assignments.filter(item => item.table_id === table.id).length}
            assignments={assignments.filter(item => item.table_id === table.id)} people={people} scale={view.scale} seatsDisabled={disabled || !!roomPreview || seatClicksDisabled}
            dropSeatNumber={dropTarget?.tableId === table.id ? dropTarget.seatNumber : null} onSeatSelect={number => onSeatSelect(table.id, number)}
            drop={target?.id === table.id && guestDrag ? dropIssue ? "full" : "allowed" : null}
            onSelect={openDetails => onSelect(table.id, openDetails)}
            onBegin={() => { cancelGesture.current=false; }} gestureCancelled={() => cancelGesture.current}
            registerCancellation={registerCancellation}
            onChange={next => { if (seatingGeometryFits(next,widthCm,heightCm)) onChange(next); else onInvalid(); }} />)}
          </Group>
          {!selectedId && !disabled && !hand && !editingSeat && <Transformer ref={roomTransformer} onMouseDown={stop} onTouchStart={stop} rotateEnabled={false} keepRatio={false}
            flipEnabled={false} enabledAnchors={["top-left","top-center","top-right","middle-left","middle-right","bottom-left","bottom-center","bottom-right"]} anchorSize={14} anchorCornerRadius={3} borderStroke={colors.accent} anchorStroke={colors.accent} />}
        </Layer>
      </Stage>
    </div>
    {guestDrag && createPortal(<div className={styles.guestDragOverlay}>
      <span className={styles.guestDragCursor} data-invalid={!!dropIssue} style={{ left:guestDrag.x,top:guestDrag.y }} aria-hidden="true" />
      <div className={styles.guestDragPreview} data-invalid={!!dropIssue} style={{ left:Math.max(8,Math.min(guestDrag.x+16,window.innerWidth-248)),top:Math.max(8,guestDrag.y-90) }} role="status">
        <div><GripVertical size={16} aria-hidden="true" /><strong>{guestDrag.name}</strong></div>
        {target && <span>{target.name}{dropTarget?.seatNumber != null ? " · "+t("seatNumber",{number:dropTarget.seatNumber}) : ""}</span>}
        <small>{dropIssue ? t(dropIssue) : target ? t(getGuestDropIntent(dropTarget,mobile,guestDrag.pointerType ?? "mouse") === "assign" ? "guestDropAssign" : "guestDropChoose") : t("guestDragTarget")}</small>
      </div>
    </div>,document.body)}
    <p className={styles.canvasHint}>{t("canvasHelp")}</p>
    <div className={styles.seatLegend} role="group" aria-label={t("seatLegend")}>
      <span><span className={styles.occupiedSeat} aria-hidden="true"><Check /></span>{t("occupiedSeat")}</span>
      <span><span className={styles.freeSeat} aria-hidden="true" />{t("freeSeat")}</span>
      <span className={styles.seatNamesHint}>{t("seatNamesZoom")}</span>
    </div>
  </div>;
}
