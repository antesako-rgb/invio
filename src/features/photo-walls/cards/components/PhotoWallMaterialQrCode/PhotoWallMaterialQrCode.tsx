"use client";

import { QRCodeSVG } from "qrcode.react";
import { useTranslations } from "next-intl";
import { QrCode } from "lucide-react";
import styles from "./PhotoWallMaterialQrCode.module.css";

export default function PhotoWallMaterialQrCode({ value }: { value: string | null }) {
  const t = useTranslations("PhotoWalls.editor");
  return (
    <div className={styles.root} role="img" aria-label={value ? t("qr.label") : t("qr.sample")}>
      {value ? <QRCodeSVG value={value} size={320} level="M" marginSize={4} bgColor="#ffffff" fgColor="#111111" />
        : <div className={styles.placeholder}><QrCode aria-hidden="true" /><span>{t("qr.sample")}</span></div>}
    </div>
  );
}
