"use client";

import { useEffect, useState } from "react";
import {
  type EditorMobilePanelChangeDetails,
} from "@/features/editor/components/EditorMobilePanel/EditorMobilePanel";

export const DIGITAL_ALBUM_MOBILE_DEFAULT_SNAP_POINT = 0.35;

// Album-specific policy: the non-modal sheet stays open while using the canvas.
// The shared drawer still handles Escape, explicit close and handle swipes.
export default function useDigitalAlbumMobilePanel() {
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [mobileSnapPoint, setMobileSnapPoint] = useState(DIGITAL_ALBUM_MOBILE_DEFAULT_SNAP_POINT);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)");
    function handleViewportChange() {
      if (!mobile.matches) setMobilePanelOpen(false);
    }
    mobile.addEventListener("change", handleViewportChange);
    return () => mobile.removeEventListener("change", handleViewportChange);
  }, []);

  function changeMobilePanelOpen(open: boolean, details?: EditorMobilePanelChangeDetails) {
    // OpenPageFlip can retarget the slot's pointer release to the book.
    if (!open && (details?.reason === "outside-press" || details?.reason === "focus-out")) {
      details.cancel();
      return;
    }
    setMobilePanelOpen(open);
  }

  return { mobilePanelOpen, setMobilePanelOpen, mobileSnapPoint, setMobileSnapPoint, changeMobilePanelOpen };
}
