"use client";
import styles from "./PhotoWallLightbox.module.css";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Copy, Download, Loader2, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import IconButton from "@/components/ui/icon-button/IconButton";
import type { PhotoWallGalleryPhoto } from "@/features/photo-walls/types/photoWallPhoto.types";
import { downloadPhotoFile, fetchPhotoFile, getShareablePhotoUrl } from "./photoFileActions";

const subscribe = () => () => {};
const supportsNativeShare = () => typeof navigator.share === "function";

interface Props {
  photo: PhotoWallGalleryPhoto;
  allowDownload: boolean;
  allowShare: boolean;
}

export default function PhotoWallLightboxActions({ photo, allowDownload, allowShare }: Props) {
  const t = useTranslations("PhotoWalls.photoWall.lightboxActions");
  const nativeShare = useSyncExternalStore(subscribe, supportsNativeShare, () => false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [ready, setReady] = useState(false);
  const downloadRequest = useRef<AbortController | null>(null);
  const shareRequest = useRef<AbortController | null>(null);
  // Only retain a prepared file when another user gesture is required.
  const preparedShare = useRef<ShareData | null>(null);

  useEffect(() => () => {
    downloadRequest.current?.abort();
    shareRequest.current?.abort();
    preparedShare.current = null;
  }, []);

  async function handleDownload() {
    if (!allowDownload || downloadRequest.current) return;
    const request = new AbortController();
    downloadRequest.current = request;
    setDownloading(true);
    try {
      const file = await fetchPhotoFile(photo, request.signal);
      if (!request.signal.aborted) downloadPhotoFile(file);
    } catch {
      if (!request.signal.aborted) toast.error(t("downloadFailed"));
    } finally {
      downloadRequest.current = null;
      if (!request.signal.aborted) setDownloading(false);
    }
  }

  async function handleShare() {
    if (!allowShare || shareRequest.current) return;
    const request = new AbortController();
    shareRequest.current = request;
    setSharing(true);
    try {
      const url = getShareablePhotoUrl(photo.imageUrl);
      if (!supportsNativeShare()) {
        await navigator.clipboard.writeText(url);
        if (!request.signal.aborted) toast.success(t("linkCopied"));
        return;
      }

      let data = preparedShare.current;
      preparedShare.current = null;
      setReady(false);
      if (!data) {
        data = { url };
        // Probe support without downloading an image on unsupported browsers.
        const probe = new File([], "photo.webp", { type: "image/webp" });
        if (navigator.canShare?.({ files: [probe] })) {
          try {
            const file = await fetchPhotoFile(photo, request.signal);
            if (navigator.canShare({ files: [file] })) data = { files: [file] };
          } catch {
            // A failed file fetch can still fall back to the existing CDN URL.
          }
        }
      }
      if (request.signal.aborted) return;
      if (navigator.canShare && !navigator.canShare(data)) {
        await navigator.clipboard.writeText(url);
        if (!request.signal.aborted) toast.success(t("linkCopied"));
        return;
      }
      // Network latency may consume transient activation. Never auto-reopen a sheet.
      if (navigator.userActivation && !navigator.userActivation.isActive) {
        preparedShare.current = data;
        setReady(true);
        toast.info(t("shareReady"));
        return;
      }
      await navigator.share(data);
    } catch (error) {
      if (!request.signal.aborted && !(error instanceof DOMException && error.name === "AbortError")) {
        toast.error(t("shareFailed"));
      }
    } finally {
      shareRequest.current = null;
      if (!request.signal.aborted) setSharing(false);
    }
  }

  if (!allowDownload && !allowShare) return null;
  const shareLabel = ready ? t("sharePrepared") : nativeShare ? t("share") : t("copyLink");
  return (
    <div className={styles.fileActions} role="group" aria-label={t("label")}>
      {allowDownload && (
        <IconButton className={styles.fileAction} onClick={handleDownload}
          disabled={downloading} aria-busy={downloading} aria-label={t("download")} title={t("download")}>
          {downloading ? <Loader2 className={styles.busy} aria-hidden="true" /> : <Download aria-hidden="true" />}
        </IconButton>
      )}
      {allowShare && (
        <IconButton className={styles.fileAction} onClick={handleShare}
          disabled={sharing} aria-busy={sharing} aria-label={shareLabel} title={shareLabel}>
          {sharing ? <Loader2 className={styles.busy} aria-hidden="true" /> : nativeShare ? <Share2 aria-hidden="true" /> : <Copy aria-hidden="true" />}
        </IconButton>
      )}
      <span className={styles.srOnly} role="status">{ready ? t("shareReady") : ""}</span>
    </div>
  );
}
