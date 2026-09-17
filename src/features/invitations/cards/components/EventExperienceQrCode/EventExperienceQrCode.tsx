"use client";

import {
  QRCodeSVG,
} from "qrcode.react";

import "./EventExperienceQrCode.css";


/* ==========================================================================
   Types
========================================================================== */

interface EventExperienceQrCodeProps {
  value:
    string;

  size?:
    number;

  ariaLabel?:
    string;
}


/* ==========================================================================
   Event Experience QR Code
========================================================================== */

export default function EventExperienceQrCode({
  value,
  size = 220,
  ariaLabel = "QR kod",
}: EventExperienceQrCodeProps) {
  return (
    <div
      className="event-experience-qr-code"
      role="img"
      aria-label={
        ariaLabel
      }
    >
      <QRCodeSVG
        value={
          value
        }
        size={
          size
        }
        level="H"
        marginSize={
          2
        }
      />
    </div>
  );
}