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
  for (
    const executablePath
    of WINDOWS_CHROME_PATHS
  ) {
    if (
      existsSync(
        executablePath
      )
    ) {
      return executablePath;
    }
  }

  throw new Error(
    "Google Chrome executable was not found."
  );
}