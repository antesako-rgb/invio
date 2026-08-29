"use client";

import type { ReactNode } from "react";

import Image from "next/image";

import styles from "./Avatar.module.css";

export interface AvatarProps {
  src?: string | null;
  alt: string;
  fallback?: string;
  children?: ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const IMAGE_SIZES = {
  xs: "32px",
  sm: "40px",
  md: "56px",
  lg: "72px",
  xl: "96px",
} as const;

export default function Avatar({
  src,
  alt,
 fallback,
  children,
  size = "md",
  className,
}: AvatarProps) {
  const imageSrc =
    src &&
    (src.startsWith("http") ||
      src.startsWith("blob:"))
      ? src
      : null;

  return (
    <span
      className={[
        styles.avatar,
        styles[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={alt}
          fill
          sizes={IMAGE_SIZES[size]}
          className={styles.image}
          unoptimized={imageSrc.startsWith("blob:")}
        />
      ) : children ? (
        children
      ) : (
        fallback
      )}
    </span>
  );
}