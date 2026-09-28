"use client";

import { type ReactNode, type RefObject, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Grid2X2, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Dialog, DialogPortal, DialogOverlay, DialogTitle, DialogCloseButton } from "@/components/ui/dialog/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer/Drawer";
import DigitalAlbumPagePreview from "../DigitalAlbumPagePreview/DigitalAlbumPagePreview";
import type { DigitalAlbumNavigation } from "../DigitalAlbumFlipBook/DigitalAlbumFlipBook";
import type { DigitalAlbumRendererPhoto } from "../types/digitalAlbumRenderer.types";
import type { DigitalAlbumDocument, DigitalAlbumDocumentPage } from "../../../types/digitalAlbumDocument.types";
import { indexDigitalAlbumPhotos } from "../utils/indexDigitalAlbumPhotos";
import styles from "./DigitalAlbumViewer.module.css";

// Mount page rendering only near the visible part of the thumbnail scroller.
function Thumbnail({ page, theme, photos, photosById }: {
  page: DigitalAlbumDocumentPage;
  theme: DigitalAlbumDocument["theme"];
  photos: DigitalAlbumRendererPhoto[];
  photosById: ReadonlyMap<string, DigitalAlbumRendererPhoto>;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "200px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <span ref={ref} className={styles.thumbnail} aria-hidden="true">
    {visible && <DigitalAlbumPagePreview page={page} theme={theme}
      rendererPhotos={photos} photosById={photosById} />}
  </span>;
}

interface Props {
  document: DigitalAlbumDocument;
  photos: DigitalAlbumRendererPhoto[];
  editorMode?: boolean;
  disabled?: boolean;
  visiblePageIndexes?: number[];
  children: (controls: {
    navigationRef: RefObject<DigitalAlbumNavigation | null>;
    soundEnabled: boolean;
    onVisiblePagesChange: (indexes: number[]) => void;
  }) => ReactNode;
}

export default function DigitalAlbumReaderFrame({ document: album, photos, children,
  editorMode = false, disabled = false, visiblePageIndexes }: Props) {
  const t = useTranslations("DigitalAlbums.viewer");
  const container = useRef<HTMLElement>(null);
  const pagesButton = useRef<HTMLButtonElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const sidePanelHost = useRef<HTMLDivElement>(null);
  const [canDockPages, setCanDockPages] = useState(false);
  const navigation = useRef<DigitalAlbumNavigation>(null);
  const [readerVisiblePages, setVisiblePages] = useState<number[]>([0]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenSupported, setFullscreenSupported] = useState(false);
  const [fullscreenError, setFullscreenError] = useState(false);
  const photosById = useMemo(() => indexDigitalAlbumPhotos(photos), [photos]);
  const visiblePages = visiblePageIndexes ?? readerVisiblePages;
  const count = album.pages.length;
  const first = Math.min(...visiblePages);
  const last = Math.max(...visiblePages);

  useEffect(() => {
    const element = container.current;
    setFullscreenSupported(!editorMode && Boolean(document.fullscreenEnabled && element?.requestFullscreen));
    const sync = () => setFullscreen(document.fullscreenElement === element);
    document.addEventListener("fullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      if (element && document.fullscreenElement === element) {
        void document.exitFullscreen().catch(() => {});
      }
    };
  }, [editorMode]);

  // Measure the available viewer space, not a desktop/fullscreen breakpoint.
  // Reserve the book's height-limited width before docking.
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    function measure() {
      if (!element) return;
      const style = getComputedStyle(element);
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const available = element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const editorSinglePage = editorMode && window.innerWidth <= 900;
      const albumWidth = Math.min(editorSinglePage ? 440 : 880,
        Math.max(0, window.innerHeight - (editorMode ? 12 : 7) * rem) * (editorSinglePage ? .6875 : 1.375));
      setIsMobile(window.innerWidth < (editorMode ? 768 : 769));
      setCanDockPages(window.innerWidth >= (editorMode ? 768 : 769) && available >= albumWidth + 21 * rem);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener("resize", measure);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [editorMode]);

  async function toggleFullscreen() {
    setFullscreenError(false);
    try {
      if (document.fullscreenElement === container.current) await document.exitFullscreen();
      else await container.current?.requestFullscreen();
    } catch { setFullscreenError(true); }
  }

  const pageGrid = (
          <div className={styles.grid}>
            {album.pages.map((page, index) => <button type="button" key={page.id}
              disabled={disabled} className={styles.page} data-viewer-page="" aria-label={t("page", { number: index + 1 })}
              aria-current={visiblePages.includes(index) ? "page" : undefined}
              onClick={() => { if (!canDockPages) setPagesOpen(false); navigation.current?.goTo(index); }}>
              <Thumbnail page={page} theme={album.theme} photos={photos} photosById={photosById} />
              <span>{index + 1}</span>
            </button>)}
          </div>
  );

  return <section ref={container} className={`${styles.root} ${editorMode ? styles.editor : ""}`}>
    <Dialog open={pagesOpen && !isMobile && !disabled} modal={!canDockPages} onOpenChange={(open, details) => {
      if (canDockPages && !open && (details.reason === "outside-press" || details.reason === "focus-out")) {
        details.cancel();
        return;
      }
      setPagesOpen(open);
    }}>
    <div className={styles.workspace} data-docked={pagesOpen && canDockPages && !isMobile && !disabled || undefined}>
    <div className={styles.album}>
      {children({ navigationRef: navigation, soundEnabled,
        onVisiblePagesChange: setVisiblePages })}
    </div>
      <div ref={sidePanelHost} className={styles.sidePanelHost} />
    </div>
      <nav className={styles.controls} aria-label={t("navigation")}>
        <button ref={pagesButton} disabled={disabled} type="button" className={styles.control} aria-label={t("pages")}
          aria-haspopup="dialog" aria-expanded={pagesOpen} onClick={() => setPagesOpen((open) => !open)}>
          <Grid2X2 aria-hidden="true" /><span className={styles.label}>{t("pages")}</span>
        </button>
        <button type="button" className={styles.control} disabled={disabled || first <= 0 || !count}
          aria-label={t("previous")} onClick={() => navigation.current?.previous()}>
          <ChevronLeft aria-hidden="true" />
        </button>
        <span className={styles.count} aria-live="polite" aria-atomic="true">
          {count ? first + 1 : 0} / {count}
        </span>
        <button type="button" className={styles.control} disabled={disabled || last >= count - 1}
          aria-label={t("next")} onClick={() => navigation.current?.next()}>
          <ChevronRight aria-hidden="true" />
        </button>
        <button type="button" className={styles.control} aria-pressed={soundEnabled}
          aria-label={t("sound")} title={t(soundEnabled ? "mute" : "unmute")}
          onClick={() => setSoundEnabled((value) => !value)}>
          {soundEnabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
        </button>
        {fullscreenSupported && <button type="button" className={styles.control}
          aria-label={t(fullscreen ? "exitFullscreen" : "fullscreen")} onClick={() => void toggleFullscreen()}>
          {fullscreen ? <Minimize aria-hidden="true" /> : <Maximize aria-hidden="true" />}
          <span className={styles.label}>{t(fullscreen ? "exitFullscreen" : "fullscreen")}</span>
        </button>}
      </nav>
      {pagesOpen && !isMobile && !disabled && <DialogPortal container={canDockPages ? sidePanelHost : container}>
        {!canDockPages && <DialogOverlay />}
        <DialogPrimitive.Popup className={`${styles.panel} ${canDockPages ? styles.dockedPanel : ""}`} finalFocus={pagesButton} initialFocus={() =>
          container.current?.querySelector<HTMLElement>('[data-viewer-page][aria-current="page"]') ?? false}>
          <div className={styles.heading}><DialogTitle>{t("pages")}</DialogTitle>
            <DialogCloseButton aria-label={t("close")} />
          </div>
          {pageGrid}
        </DialogPrimitive.Popup>
      </DialogPortal>}
    </Dialog>
    <Drawer open={pagesOpen && isMobile && !disabled} onOpenChange={setPagesOpen}>
      {isMobile && <DrawerContent portalContainer={container} className={styles.mobileDrawer}
        finalFocus={pagesButton} handleOnly>
        <DrawerHeader><DrawerTitle>{t("pages")}</DrawerTitle></DrawerHeader>
        {pageGrid}
      </DrawerContent>}
    </Drawer>
    {fullscreenError && <p role="status" className={styles.error}>{t("fullscreenError")}</p>}
  </section>;
}

