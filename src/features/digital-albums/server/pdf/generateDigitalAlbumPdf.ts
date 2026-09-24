import "server-only";

import puppeteer
  from "puppeteer-core";

import {
  getPdfBrowserExecutablePath,
} from "@/features/digital-albums/server/pdf/getPdfBrowserExecutablePath";


/* ==========================================================================
   Types
========================================================================== */

interface DigitalAlbumPdfCookie {
  name:
    string;

  value:
    string;

  domain:
    string;

  path?:
    string;
}

interface GenerateDigitalAlbumPdfOptions {
  printUrl:
    string;

  cookies:
    DigitalAlbumPdfCookie[];
}


/* ==========================================================================
   Generate Digital Album PDF
========================================================================== */

export async function generateDigitalAlbumPdf({
  printUrl,
  cookies,
}: GenerateDigitalAlbumPdfOptions) {
  const browser =
    await puppeteer.launch({
      executablePath:
        getPdfBrowserExecutablePath(),

      headless:
        true,

      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
    });

  try {
    const page =
      await browser.newPage();


    /* ==========================================================================
       Authentication
    ========================================================================== */

    if (
      cookies.length >
        0
    ) {
      await page.setCookie(
        ...cookies
      );
    }


    /* ==========================================================================
       Open Print View
    ========================================================================== */

    await page.goto(
      printUrl,
      {
        waitUntil:
          "networkidle0",
      }
    );


    /* ==========================================================================
       Fonts
    ========================================================================== */

    await page.evaluate(
      async () => {
        await document.fonts.ready;
      }
    );


    /* ==========================================================================
       Images
    ========================================================================== */



    /* ==========================================================================
       PDF
    ========================================================================== */

    const pdf =
      await page.pdf({
        width:
          "440px",

        height:
          "640px",

        printBackground:
          true,

        preferCSSPageSize:
          true,

        margin: {
          top:
            "0px",

          right:
            "0px",

          bottom:
            "0px",

          left:
            "0px",
        },
      });

    return Buffer.from(
      pdf
    );
  } finally {
    await browser.close();
  }
}