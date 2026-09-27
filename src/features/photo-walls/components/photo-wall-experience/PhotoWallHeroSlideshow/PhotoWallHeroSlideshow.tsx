"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { PhotoWallGalleryPhoto } from "@/features/photo-walls/types/photoWallPhoto.types";
import styles from "./PhotoWallHeroSlideshow.module.css";

const VISIBLE_PHOTOS = 3;
const SLIDE_INTERVAL = 5000;
const FADE_DURATION = 650;

interface PhotoWallHeroSlideshowProps {
  className?: string;
  photos: PhotoWallGalleryPhoto[];
}

export default function PhotoWallHeroSlideshow({ photos, className }: PhotoWallHeroSlideshowProps) {
  const [offset, setOffset] = useState(0);
  const [fadingCount, setFadingCount] = useState<number | null>(null);
  const seenIds = new Set<string>();
  const uniquePhotos = photos.filter(photo => {
    if (seenIds.has(photo.id)) return false;
    seenIds.add(photo.id);
    return true;
  });
  const photoCount = uniquePhotos.length;

  useEffect(() => {
    if (photoCount <= VISIBLE_PHOTOS) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let interval: number | undefined;
    let fadeTimeout: number | undefined;

    function stop() {
      window.clearInterval(interval);
      window.clearTimeout(fadeTimeout);
    }

    function start() {
      if (motion.matches) return;
      interval = window.setInterval(() => {
        setFadingCount(photoCount);
        fadeTimeout = window.setTimeout(() => {
          setOffset(current => (current + 1) % photoCount);
          setFadingCount(null);
        }, FADE_DURATION);
      }, SLIDE_INTERVAL);
    }

    function handleMotionChange() {
      stop();
      setFadingCount(null);
      start();
    }

    start();
    motion.addEventListener("change", handleMotionChange);
    return () => {
      stop();
      motion.removeEventListener("change", handleMotionChange);
    };
  }, [photoCount]);

  if (!photoCount) return null;

  const visiblePhotos = Array.from(
    { length: Math.min(VISIBLE_PHOTOS, photoCount) },
    (_, index) => uniquePhotos[((photoCount > VISIBLE_PHOTOS ? offset : 0) + index) % photoCount]
  );

  // Decorative duplicates of the accessible, interactive gallery below.
  return (
    <div
      className={[styles.slideshow, className].filter(Boolean).join(" ")}
      data-count={visiblePhotos.length}
      data-fading={photoCount > VISIBLE_PHOTOS && fadingCount === photoCount}
      aria-hidden="true"
    >
      {visiblePhotos.map((photo, index) => (
        <div className={styles.photo} data-position={index} key={photo.id}>
          <Image
            src={photo.imageUrl}
            alt=""
            width={photo.width}
            height={photo.height}
            unoptimized
            className={styles.image}
            draggable={false}
          />
        </div>
      ))}
    </div>
  );
}
