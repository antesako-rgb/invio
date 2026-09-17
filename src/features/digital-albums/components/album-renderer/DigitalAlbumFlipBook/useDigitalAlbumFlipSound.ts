import {
  useEffect,
  useRef,
} from "react";

import type {
  Frame,
} from "@openpageflip/core";


/* ==========================================================================
   Constants
========================================================================== */

const DEFAULT_SOUND_SRC =
  "/sounds/page-flip.mp3";

const DEFAULT_VOLUME =
  0.35;


/* ==========================================================================
   Types
========================================================================== */

interface UseDigitalAlbumFlipSoundOptions {
  enabled?:
    boolean;

  soundSrc?:
    string;

  volume?:
    number;
}


/* ==========================================================================
   Digital Album Flip Sound
========================================================================== */

export default function useDigitalAlbumFlipSound({
  enabled = true,
  soundSrc = DEFAULT_SOUND_SRC,
  volume = DEFAULT_VOLUME,
}: UseDigitalAlbumFlipSoundOptions = {}) {
  /* ==========================================================================
     Refs
  ========================================================================== */

  const audioRef =
    useRef<HTMLAudioElement | null>(
      null
    );

  const isFlippingRef =
    useRef(
      false
    );


  /* ==========================================================================
     Audio
  ========================================================================== */

  useEffect(
    () => {
      const audio =
        new Audio(
          soundSrc
        );

      audio.preload =
        "auto";

      audio.volume =
        Math.max(
          0,
          Math.min(
            1,
            volume
          )
        );

      audioRef.current =
        audio;

      return () => {
        audio.pause();

        audioRef.current =
          null;
      };
    },
    [
      soundSrc,
      volume,
    ]
  );


  /* ==========================================================================
     Play
  ========================================================================== */
function play() {
  if (!enabled) {
    return;
  }

  const audio =
    audioRef.current;

  if (!audio) {
    return;
  }

  audio.pause();

  audio.currentTime =
    0;

  void audio
    .play()
    .catch(
      () => {
        // Browser may block audio
        // before the first user interaction.
      }
    );
}

  /* ==========================================================================
     Frame
  ========================================================================== */

  function handleFlipSoundFrame(
    frame:
      Frame
  ) {
    const isFlipping =
      frame.flip !== null;

    if (
      isFlipping &&
      !isFlippingRef.current
    ) {
      isFlippingRef.current =
        true;

      play();

      return;
    }

    if (!isFlipping) {
      isFlippingRef.current =
        false;
    }
  }


  /* ==========================================================================
     Return
  ========================================================================== */

  return {
    handleFlipSoundFrame,
  };
}