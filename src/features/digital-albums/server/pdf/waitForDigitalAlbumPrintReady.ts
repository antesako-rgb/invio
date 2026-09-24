import { getDigitalAlbumTextOverflow } from "../../utils/getDigitalAlbumTextOverflow";
import "server-only";

import type { Page } from "puppeteer-core";

export async function waitForDigitalAlbumPrintReady(page: Page) {
  await page.waitForSelector('[data-album-print-hydrated="true"]', { timeout: 45_000 });
  await page.evaluate(async () => {
    const root = document.querySelector('[data-album-print-hydrated="true"]');
    if (!root || !root.children.length) throw new Error("Print album is empty.");

    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        (async () => {
          const images = Array.from(root.querySelectorAll("img"));
          // Next Image defaults to lazy loading; pages below the viewport must load too.
          images.forEach((image) => { image.loading = "eager"; });

          const backgroundUrls = new Set<string>();
          for (const element of [root, ...root.querySelectorAll("*")]) {
            for (const pseudo of [null, "::before", "::after"]) {
              const background = getComputedStyle(element, pseudo).backgroundImage;
              for (const match of background.matchAll(/url\(["']?(.*?)["']?\)/g)) {
                backgroundUrls.add(match[1]);
              }
            }
          }
          await Promise.all([
            ...images.map(async (image) => {
              await image.decode();
              if (!image.naturalWidth) throw new Error("Print image failed to load.");
            }),
            ...Array.from(backgroundUrls, async (url) => {
              const image = new Image();
              image.src = url;
              await image.decode();
            }),
            document.fonts.ready,
          ]);
          if (Array.from(document.fonts).some((font) => font.status === "error")) {
            throw new Error("Print font failed to load.");
          }
          // Allow decoded assets and font metrics to participate in layout.
          await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
        })(),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error("Print assets timed out.")), 45_000);
        }),
      ]);
    } finally {
      clearTimeout(timer);
    }
  });
  const overflow = await page.evaluate(getDigitalAlbumTextOverflow, await page.$('[data-album-print-hydrated="true"]'));
  if (overflow.length) throw new Error("Album text exceeds the page boundaries.");
}
