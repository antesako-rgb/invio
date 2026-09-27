import { getDigitalAlbumTextOverflow } from "../../utils/getDigitalAlbumTextOverflow";
import "server-only";

import type { Page } from "puppeteer-core";

export class PdfAssetError extends Error {
  constructor(public readonly stage: string, public readonly details: Record<string, unknown> = {}) {
    super(stage);
  }
}

export async function waitForDigitalAlbumPrintReady(page: Page) {
  try { await page.waitForSelector('[data-album-print-hydrated="true"]', { timeout: 45_000 }); } catch {
    throw new PdfAssetError("assets:hydration", { reason: "readiness-failed" });
  }
  const result = await page.evaluate(async () => {
    try {
    const root = document.querySelector('[data-album-print-hydrated="true"]');
    if (!root || !root.children.length) throw { stage: "assets:hydration", details: { reason: "empty-album" } };
    if (root.querySelector('[data-album-missing-photo="true"]')) {
      throw { stage: "assets:photos", details: { reason: "unresolved-photo-reference" } };
    }

    const pending = { photos: 0, backgrounds: 0, fonts: 1 };
    const decode = async (image: HTMLImageElement, type: "photos" | "backgrounds") => {
      pending[type]++;
      try {
        await image.decode();
        if (!image.naturalWidth) throw new Error();
      } catch {
        // URL stays inside the server pipeline and is sanitized before logging.
        throw { stage: `assets:${type}`, details: {
          reason: "decode-failed", assetType: type, url: image.currentSrc || image.src,
          naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight,
          complete: image.complete,
        } };
      } finally { pending[type]--; }
    };
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
              await decode(image, "photos");
            }),
            ...Array.from(backgroundUrls, async (url) => {
              const image = new Image();
              image.src = url;
              await decode(image, "backgrounds");
            }),
            document.fonts.ready.then(() => { pending.fonts = 0; }, () => {
              throw { stage: "assets:fonts", details: { reason: "font-readiness-failed" } };
            }),
          ]);
          if (Array.from(document.fonts).some((font) => font.status === "error")) {
            throw { stage: "assets:fonts", details: { reason: "font-load-failed", fonts: Array.from(document.fonts)
              .filter((font) => font.status === "error").slice(0, 10)
              .map((font) => ({ family: font.family.replace(/[^a-zA-Z0-9 _,-]/g, "").slice(0, 100), status: font.status })) } };
          }
          // Allow decoded assets and font metrics to participate in layout.
          await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
        })(),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject({ stage: pending.photos ? "assets:photos" : pending.backgrounds ? "assets:backgrounds" : pending.fonts ? "assets:fonts" : "assets:hydration",
            details: { reason: "timeout", pending } }), 45_000);
        }),
      ]);
    } finally {
      clearTimeout(timer);
    }
    return null;
    } catch (error) {
      if (error && typeof error === "object" && "stage" in error && "details" in error) {
        return error as { stage: string; details: Record<string, unknown> };
      }
      return { stage: "assets:hydration", details: { reason: "readiness-evaluation-failed" } };
    }
  }).catch(() => { throw new PdfAssetError("assets:hydration", { reason: "browser-evaluation-failed" }); });
  if (result) throw new PdfAssetError(result.stage, result.details);
  let overflow: string[];
  const rootHandle = await page.$('[data-album-print-hydrated="true"]');
  try {
    overflow = await page.evaluate(getDigitalAlbumTextOverflow, rootHandle);
  } catch {
    throw new PdfAssetError("assets:text-overflow", { reason: "measurement-failed" });
  } finally { await rootHandle?.dispose(); }
  if (overflow.length) {
    const fields = await page.evaluate((ids) => {
      const pages = Array.from(document.querySelectorAll<HTMLElement>("[data-composition]"));
      const dimensions = (element: HTMLElement) => {
        const r = element.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height,
          scrollWidth: element.scrollWidth, scrollHeight: element.scrollHeight,
          clientWidth: element.clientWidth, clientHeight: element.clientHeight };
      };
      return pages.flatMap((page, index) => ids.includes(page.dataset.albumPage ?? "")
        ? Array.from(page.querySelectorAll<HTMLElement>("[data-album-text]")).filter((field) => {
          if (!field.textContent?.trim()) return false;
          const content = field.querySelector<HTMLElement>("[data-album-text-value]") ?? field;
          const rect = content.getBoundingClientRect();
          if (!rect.width || !rect.height) return false;
          const style = getComputedStyle(content);
          const clips = ["hidden", "clip", "auto", "scroll"].includes(style.overflow);
          const maxHeight = Number.parseFloat(style.maxHeight);
          if ((clips && content.clientWidth > 0 && content.scrollWidth > content.clientWidth + 2) ||
              (clips && content.clientHeight > 0 && content.scrollHeight > content.clientHeight + 2) ||
              (Number.isFinite(maxHeight) && content.scrollHeight > maxHeight + 2)) return true;
          let parent: HTMLElement | null = field;
          while (parent) {
            if (parent === page || parent.hasAttribute("data-album-text-area") ||
                ["hidden", "clip", "auto"].includes(getComputedStyle(parent).overflow)) {
              const bounds = parent.getBoundingClientRect();
              if (rect.left < bounds.left - 2 || rect.top < bounds.top - 2 ||
                  rect.right > bounds.right + 2 || rect.bottom > bounds.bottom + 2) return true;
            }
            if (parent === page) break;
            parent = parent.parentElement;
          }
          return false;
        }).map((field) => ({
          pageId: /^[a-zA-Z0-9-]{1,80}$/.test(page.dataset.albumPage ?? "") ? page.dataset.albumPage : "redacted",
          pageIndex: index, layout: page.dataset.composition,
          field: field.dataset.albumField ?? "caption", bounds: dimensions(field),
          content: dimensions(field.querySelector<HTMLElement>("[data-album-text-value]") ?? field),
          page: dimensions(page),
        })) : []).slice(0, 30);
    }, overflow).catch(() => []);
    throw new PdfAssetError("assets:text-overflow", { reason: "page-bounds-exceeded", fields });
  }
}
