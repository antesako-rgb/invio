"use client";
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import type { ProjectGuest } from "@/features/project-guests/types/database";
import type { GuestDrag } from "./SeatingCanvas";

/** List remains scrollable: only the explicit grip starts a pointer gesture. */
export function useGuestCanvasDrag({ onStarted, onDrop, onPlace }: {
  onStarted: () => void; onDrop: (id: string, x: number, y: number) => void; onPlace: (person: ProjectGuest) => void;
}) {
  const [drag, setDrag] = useState<GuestDrag | null>(null);
  const cleanup = useRef<(() => void) | null>(null);
  const callbacks = useRef({ onStarted, onDrop, onPlace });
  useLayoutEffect(() => { callbacks.current = { onStarted, onDrop, onPlace }; }, [onStarted, onDrop, onPlace]);
  useEffect(() => () => cleanup.current?.(), []);
  function start(event: PointerEvent<HTMLButtonElement>, person: ProjectGuest) {
    if (event.button !== 0) return;
    event.preventDefault(); cleanup.current?.();
    const id = event.pointerId, origin = { x:event.clientX,y:event.clientY };
    const name = [person.first_name,person.last_name].filter(Boolean).join(" ");
    let moved = false;
    function move(e: globalThis.PointerEvent) {
      if (e.pointerId !== id) return;
      if (!moved && Math.hypot(e.clientX-origin.x,e.clientY-origin.y) < 6) return;
      e.preventDefault();
      if (!moved) { moved=true; callbacks.current.onStarted(); }
      setDrag({ id:person.id,name,x:e.clientX,y:e.clientY });
    }
    function finish(e: globalThis.PointerEvent) {
      if (e.pointerId !== id) return;
      cleanup.current?.(); setDrag(null);
      if (moved) callbacks.current.onDrop(person.id,e.clientX,e.clientY);
      else callbacks.current.onPlace(person);
    }
    function cancel() { cleanup.current?.(); setDrag(null); }
    function key(e: KeyboardEvent) { if (e.key === "Escape") cancel(); }
    window.addEventListener("pointermove",move,{ passive:false });
    window.addEventListener("pointerup",finish);
    window.addEventListener("pointercancel",cancel);
    window.addEventListener("keydown",key);
    window.addEventListener("blur",cancel);
    cleanup.current = () => {
      window.removeEventListener("pointermove",move); window.removeEventListener("pointerup",finish);
      window.removeEventListener("pointercancel",cancel); window.removeEventListener("keydown",key); window.removeEventListener("blur",cancel);
      cleanup.current=null;
    };
  }
  return { drag, start };
}
