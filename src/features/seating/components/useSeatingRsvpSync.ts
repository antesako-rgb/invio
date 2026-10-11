"use client";
import { useEffect, useEffectEvent, useRef } from "react";

/** Sync on opening/source changes, explicit refresh, and returning to an idle editor. */
export function useSeatingRsvpSync({ planId, source, enabled, refresh, onSync }: {
  planId: string | null; source: string | null; enabled: boolean; refresh: number; onSync: () => Promise<boolean>;
}) {
  const lastOpening = useRef<string | null>(null);
  const pendingReturn = useRef(false);
  const inFlight = useRef(false);
  const lastAttempt = useRef<number | null>(null);
  const sync = useEffectEvent(onSync);
  const runSync = useEffectEvent(() => {
    if (inFlight.current) return;
    inFlight.current = true;
    lastAttempt.current = Date.now();
    void sync().finally(() => { inFlight.current = false; });
  });
  const returnToEditor = useEffectEvent(() => {
    if (document.visibilityState !== "visible") return;
    // Browsers emit focus and visibilitychange for the same return. Avoid repeated
    // requests when switching windows quickly; explicit refresh still runs immediately.
    if (inFlight.current || (lastAttempt.current !== null && Date.now() - lastAttempt.current < 30_000)) return;
    if (!enabled) { pendingReturn.current = true; return; }
    pendingReturn.current = false;
    runSync();
  });
  useEffect(() => {
    if (!source || !planId) { lastOpening.current = null; pendingReturn.current = false; return; }
    const key = planId + ":" + source + ":" + refresh;
    if (!enabled || (lastOpening.current === key && !pendingReturn.current)) return;
    // Mark before calling, so busy/refresh renders cannot repeat an uncertain write.
    lastOpening.current = key;
    pendingReturn.current = false;
    runSync();
  }, [planId, source, enabled, refresh]);
  useEffect(() => {
    if (!source) return;
    const onReturn = () => returnToEditor();
    window.addEventListener("focus", onReturn);
    document.addEventListener("visibilitychange", onReturn);
    return () => {
      window.removeEventListener("focus", onReturn);
      document.removeEventListener("visibilitychange", onReturn);
    };
  }, [source]);
}
