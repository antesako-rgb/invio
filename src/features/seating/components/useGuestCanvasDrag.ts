"use client";
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent, type MouseEvent } from "react";
import type { ProjectGuest } from "@/features/project-guests/types/database";
import type { GuestDrag } from "./SeatingCanvas";

/** Touch uses the explicit grip so the list remains scrollable; mouse can also use the guest row. */
export function useGuestCanvasDrag({ onStarted, onDrop, onPlace, onCancelled }: {
  onStarted: () => void; onDrop: (id: string, x: number, y: number, pointerType: string) => void; onPlace: (person: ProjectGuest) => void;
  onCancelled?: () => void;
}) {
  const [drag, setDrag] = useState<GuestDrag | null>(null);
  const cleanup = useRef<(() => void) | null>(null);
  const pointerClick = useRef<HTMLButtonElement | null>(null);
  const callbacks = useRef({ onStarted, onDrop, onPlace, onCancelled });
  useLayoutEffect(() => { callbacks.current = { onStarted, onDrop, onPlace, onCancelled }; }, [onStarted, onDrop, onPlace, onCancelled]);
  useEffect(() => () => cleanup.current?.(), []);
  function start(event: PointerEvent<HTMLButtonElement>, person: ProjectGuest) {
    if (event.button !== 0) return;
    event.preventDefault(); cleanup.current?.();
    pointerClick.current = event.currentTarget;
    const id = event.pointerId, origin = { x:event.clientX,y:event.clientY };
    const name = [person.first_name,person.last_name].filter(Boolean).join(" ");
    // The mobile drawer can disappear mid-drag; keep capture on a stable element.
    const capture = document.documentElement;
    try { capture.setPointerCapture?.(id); } catch { /* Window listeners still handle the gesture. */ }
    const previousSelection = document.body.style.userSelect;
    const previousCursor = document.body.style.cursor;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";
    let frame: number | null = null;
    let latest: GuestDrag | null = null;
    let moved = false;
    let ended = false;
    function move(e: globalThis.PointerEvent) {
      if (ended || e.pointerId !== id) return;
      if (!moved && Math.hypot(e.clientX-origin.x,e.clientY-origin.y) < 6) return;
      e.preventDefault();
      if (!moved) { moved=true; callbacks.current.onStarted(); }
      if (ended) return;
      latest = { id:person.id,name,x:e.clientX,y:e.clientY,pointerType:e.pointerType };
      if (frame === null) frame = window.requestAnimationFrame(() => { frame=null; setDrag(latest); });
    }
    function finish(e: globalThis.PointerEvent) {
      if (ended || e.pointerId !== id) return;
      e.preventDefault();
      cleanup.current?.(); setDrag(null);
      if (moved) callbacks.current.onDrop(person.id,e.clientX,e.clientY,e.pointerType);
      else callbacks.current.onPlace(person);
    }
    function cancel(e?: Event) {
      if (ended) return;
      if (e && "pointerId" in e && e.pointerId !== id) return;
      cleanup.current?.(); setDrag(null);
      if (moved) callbacks.current.onCancelled?.();
    }
    function key(e: KeyboardEvent) { if (e.key === "Escape") { e.preventDefault(); cancel(); } }
    function secondPointer(e: globalThis.PointerEvent) { if (e.pointerId !== id) cancel(); }
    window.addEventListener("pointermove",move,{ passive:false,capture:true });
    window.addEventListener("pointerup",finish,true);
    window.addEventListener("pointercancel",cancel,true);
    window.addEventListener("lostpointercapture",cancel,true);
    window.addEventListener("pointerdown",secondPointer,true);
    window.addEventListener("keydown",key,true);
    window.addEventListener("blur",cancel);
    cleanup.current = () => {
      ended = true;
      window.removeEventListener("pointermove",move,true); window.removeEventListener("pointerup",finish,true);
      window.removeEventListener("pointercancel",cancel,true); window.removeEventListener("lostpointercapture",cancel,true);
      window.removeEventListener("pointerdown",secondPointer,true); window.removeEventListener("keydown",key,true); window.removeEventListener("blur",cancel);
      if (frame !== null) window.cancelAnimationFrame(frame);
      try { if (capture.hasPointerCapture?.(id)) capture.releasePointerCapture(id); } catch { /* The pointer may already have ended. */ }
      document.body.style.userSelect = previousSelection;
      document.body.style.cursor = previousCursor;
      cleanup.current=null;
    };
  }
  function consumePointerClick(event: MouseEvent<HTMLButtonElement>) {
    if (event.detail === 0 || event.currentTarget !== pointerClick.current) return false;
    pointerClick.current = null; event.preventDefault(); event.stopPropagation(); return true;
  }
  return { drag, start, consumePointerClick };
}
