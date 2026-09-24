import "server-only";

import {
  existsSync,
} from "node:fs";


/* ==========================================================================
   Constants
========================================================================== */

const WINDOWS_CHROME_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];


/* ==========================================================================
   PDF Browser Executable Path
========================================================================== */

export function getPdfBrowserExecutablePath() {
  const configuredPath = process.env.PDF_BROWSER_EXECUTABLE_PATH;
  if (configuredPath) {
    if (!existsSync(/* turbopackIgnore: true */ configuredPath)) {
      throw new Error("PDF_BROWSER_EXECUTABLE_PATH does not exist.");
    }
    return configuredPath;
  }

  for (
    const executablePath
    of WINDOWS_CHROME_PATHS
  ) {
    if (
      existsSync(
        /* turbopackIgnore: true */ executablePath
      )
    ) {
      return executablePath;
    }
  }

  throw new Error(
    "Google Chrome executable was not found."
  );
}
