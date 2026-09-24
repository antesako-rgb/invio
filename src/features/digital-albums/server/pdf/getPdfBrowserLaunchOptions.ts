import "server-only";

import type { LaunchOptions } from "puppeteer-core";
import { getPdfBrowserExecutablePath } from "./getPdfBrowserExecutablePath";

// Pin together with package.json/package-lock.json and the release pack.
const CHROMIUM_VERSION = "153.0.0";
let executablePromise: Promise<string> | undefined;

export async function getPdfBrowserLaunchOptions(): Promise<LaunchOptions> {
  const common: LaunchOptions = {
    timeout: 30_000,
    protocolTimeout: 60_000,
    defaultViewport: { width: 440, height: 640, deviceScaleFactor: 1 },
  };

  // next build/start on a developer machine must still use local Chrome.
  if (process.env.VERCEL !== "1") {
    return {
      ...common,
      executablePath: getPdfBrowserExecutablePath(),
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    };
  }

  if (process.platform !== "linux" || !["x64", "arm64"].includes(process.arch)) {
    throw new Error("Unsupported serverless Chromium platform.");
  }

  const { default: chromium } = await import("@sparticuz/chromium-min");
  const packUrl = new URL(process.env.PDF_CHROMIUM_PACK_URL ||
    `https://github.com/Sparticuz/chromium/releases/download/v${CHROMIUM_VERSION}/chromium-v${CHROMIUM_VERSION}-pack.${process.arch}.tar`);
  if (packUrl.protocol !== "https:" || packUrl.username || packUrl.password) {
    throw new Error("PDF_CHROMIUM_PACK_URL must be a trusted HTTPS release pack.");
  }

  // Share extraction between concurrent cold requests. The package reuses
  // /tmp/chromium on warm invocations; never share browser sessions/cookies.
  executablePromise ??= chromium.executablePath(packUrl.href).catch((error) => {
    executablePromise = undefined;
    throw error;
  });
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const executablePath = await Promise.race([
      executablePromise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Chromium initialization timed out.")), 75_000);
      }),
    ]);
    return { ...common, executablePath, headless: "shell", args: chromium.args };
  } finally {
    clearTimeout(timer);
  }
}
