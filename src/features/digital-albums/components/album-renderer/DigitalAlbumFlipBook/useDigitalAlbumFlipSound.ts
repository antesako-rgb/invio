import { useEffect, useRef } from "react";
import type { Frame } from "@openpageflip/core";

interface Options { enabled?: boolean; soundSrc?: string; volume?: number }

export default function useDigitalAlbumFlipSound({
  enabled = true, soundSrc = "/sounds/page-flip.mp3", volume = 0.35,
}: Options = {}) {
  const context = useRef<AudioContext | null>(null);
  const buffer = useRef<AudioBuffer | null>(null);
  const source = useRef<AudioBufferSourceNode | null>(null);
  const flipping = useRef(false);

  useEffect(() => {
    if (typeof AudioContext === "undefined") return;
    const audio = new AudioContext();
    const controller = new AbortController();
    let disposed = false;
    context.current = audio;
    // Unlock/resume in a user gesture, before the asynchronous animation frame.
    // Also handles browsers suspending audio while the tab is in the background.
    function unlock() {
      if (audio.state !== "running" && audio.state !== "closed") {
        void audio.resume().catch(() => {});
      }
    }
    function visibility() {
      if (document.hidden) {
        source.current?.stop();
        source.current = null;
        flipping.current = false;
      }
    }
    document.addEventListener("pointerdown", unlock, true);
    document.addEventListener("keydown", unlock, true);
    document.addEventListener("visibilitychange", visibility);
    void fetch(soundSrc, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load page-turn sound");
        return response.arrayBuffer();
      })
      .then((data) => audio.decodeAudioData(data))
      .then((decoded) => { if (!disposed) buffer.current = decoded; })
      .catch(() => { /* Sound is optional; navigation remains available. */ });
    return () => {
      disposed = true;
      controller.abort();
      document.removeEventListener("pointerdown", unlock, true);
      document.removeEventListener("keydown", unlock, true);
      document.removeEventListener("visibilitychange", visibility);
      source.current?.stop();
      source.current = null;
      buffer.current = null;
      context.current = null;
      flipping.current = false;
      void audio.close().catch(() => {});
    };
  }, [soundSrc]);

  useEffect(() => {
    if (!enabled) {
      source.current?.stop();
      source.current = null;
    }
  }, [enabled]);

  function handleFlipSoundFrame(frame: Frame) {
    const turning = frame.flip !== null;
    const started = turning && !flipping.current;
    flipping.current = turning;
    const audio = context.current;
    if (!started || !enabled || document.hidden || !buffer.current || audio?.state !== "running") return;
    source.current?.stop();
    const next = audio.createBufferSource();
    const gain = audio.createGain();
    next.buffer = buffer.current;
    gain.gain.value = Math.max(0, Math.min(1, volume));
    next.connect(gain).connect(audio.destination);
    next.onended = () => {
      next.disconnect();
      gain.disconnect();
      if (source.current === next) source.current = null;
    };
    source.current = next;
    next.start();
  }
  return { handleFlipSoundFrame };
}
