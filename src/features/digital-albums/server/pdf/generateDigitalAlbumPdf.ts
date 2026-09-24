import "server-only";

import puppeteer, { type Browser, type CookieData } from "puppeteer-core";
import { getPdfBrowserLaunchOptions } from "./getPdfBrowserLaunchOptions";
import { waitForDigitalAlbumPrintReady } from "./waitForDigitalAlbumPrintReady";

interface GenerateDigitalAlbumPdfOptions {
  printUrl: string;
  cookies: CookieData[];
}

// Limit simultaneous Chromium processes per warm function instance.
let activeExports = 0;

export class DigitalAlbumPdfError extends Error {
  constructor(public readonly stage: string, public readonly status = 500) {
    super("Digital album PDF export failed.");
  }
}

export async function generateDigitalAlbumPdf({
  printUrl,
  cookies,
}: GenerateDigitalAlbumPdfOptions) {
  if (activeExports >= 2) throw new DigitalAlbumPdfError("capacity", 503);
  activeExports++;
  let browser: Browser | undefined;
  let stage = "browser";
  try {
    browser = await puppeteer.launch(await getPdfBrowserLaunchOptions());
    const page = await browser.newPage();
    page.setDefaultTimeout(45_000);
    page.setDefaultNavigationTimeout(45_000);
    await browser.defaultBrowserContext().setCookie(...cookies);

    const origin = new URL(printUrl).origin;
    const bypass = process.env.VERCEL === "1"
      ? process.env.VERCEL_AUTOMATION_BYPASS_SECRET
      : undefined;
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      // Deployment-protection credentials must never reach CDN/Storage hosts.
      const sameOrigin = new URL(request.url()).origin === origin;
      if (request.isNavigationRequest() && request.frame() === page.mainFrame() && !sameOrigin) {
        void request.abort().catch(() => {});
        return;
      }
      const headers = { ...request.headers() };
      delete headers["x-vercel-protection-bypass"];
      if (sameOrigin && bypass) headers["x-vercel-protection-bypass"] = bypass;
      void request.continue({ headers }).catch(() => {});
    });

    stage = "navigation";
    await page.emulateMediaType("print");
    const response = await page.goto(printUrl, { waitUntil: "domcontentloaded" });
    if (!response?.ok()) throw new Error("Print route rejected the request.");
    // Reject login/error redirects even when they return HTTP 200.
    if (new URL(page.url()).pathname !== new URL(printUrl).pathname) {
      throw new Error("Print route redirected unexpectedly.");
    }

    stage = "assets";
    await waitForDigitalAlbumPrintReady(page);

    stage = "pdf";
    const pdf = await page.pdf({
      width: "440px",
      height: "640px",
      printBackground: true,
      preferCSSPageSize: true,
      timeout: 45_000,
      margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
    });
    if (!pdf.length) throw new Error("Empty PDF.");
    return Buffer.from(pdf);
  } catch {
    // Do not propagate browser errors containing URLs, cookies or signed assets.
    throw new DigitalAlbumPdfError(stage);
  } finally {
    try {
      if (browser) {
        let timer: ReturnType<typeof setTimeout> | undefined;
        try {
          await Promise.race([
            browser.close(),
            new Promise<never>((_, reject) => {
              timer = setTimeout(() => reject(new Error("Browser close timed out.")), 5_000);
            }),
          ]);
        } catch {
          browser.process()?.kill("SIGKILL");
          console.error("Digital album PDF browser cleanup required process termination.");
        } finally {
          clearTimeout(timer);
        }
      }
    } finally {
      activeExports--;
    }
  }
}
