"use client";

import DigitalAlbumFlipBook
  from "@/features/digital-albums/components/album-renderer/DigitalAlbumFlipBook/DigitalAlbumFlipBook";

import {
  digitalAlbumDemoPages,
} from "./DigitalAlbumDemoPages";

import styles
  from "./DigitalAlbumDemo.module.css";


/* ==========================================================================
   Digital Album Demo
========================================================================== */

export default function DigitalAlbumDemo() {
  return (
    <main
      className={
        styles.root
      }
    >
      <div
        className={
          styles.header
        }
      >
        <span
          className={
            styles.eyebrow
          }
        >
          DIGITALNI ALBUM
        </span>

        <h1>
          Naše uspomene
        </h1>

        <p>
          Ana & Marko · 15. lipnja 2027.
        </p>
      </div>

      <div
        className={
          styles.bookArea
        }
      >
        <DigitalAlbumFlipBook
          width={
            480
          }
          height={
            640
          }
        >
          {digitalAlbumDemoPages}
        </DigitalAlbumFlipBook>
      </div>

      <p
        className={
          styles.hint
        }
      >
        Povuci stranicu ili koristi strelice
      </p>
    </main>
  );
}