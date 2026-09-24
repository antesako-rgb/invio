/**
 * Runs in both the editor browser and Puppeteer.
 * Keep this function self-contained.
 */
export function getDigitalAlbumTextOverflow(
  root:
    ParentNode | null
): string[] {
  if (!root) {
    throw new Error(
      "Album root is missing."
    );
  }

  const problems =
    new Set<string>();


  /* ==========================================================================
     Album Text
  ========================================================================== */

  for (
    const text of root.querySelectorAll<HTMLElement>(
      "[data-album-text]"
    )
  ) {
    if (
      !text.textContent?.trim()
    ) {
      continue;
    }

    const content =
      text.querySelector<HTMLElement>(
        "[data-album-text-value]"
      ) ?? text;

    const rect =
      content.getBoundingClientRect();

    if (
      !rect.width ||
      !rect.height
    ) {
      continue;
    }

    const page =
      text.closest<HTMLElement>(
        "[data-album-page]"
      );

    if (!page) {
      continue;
    }

    let parent:
      HTMLElement | null =
        text.parentElement;

    let overflow =
      content.clientWidth > 0 &&
      content.scrollWidth >
        content.clientWidth + 2;


    /* ==========================================================================
       Check Parent Bounds
    ========================================================================== */

    while (parent) {
      const style =
        getComputedStyle(
          parent
        );

      if (
        parent === page ||
        parent.hasAttribute(
          "data-album-text-area"
        ) ||
        [
          "hidden",
          "clip",
          "auto",
        ].includes(
          style.overflow
        )
      ) {
        const bounds =
          parent.getBoundingClientRect();

        if (
          rect.left <
            bounds.left - 2 ||
          rect.top <
            bounds.top - 2 ||
          rect.right >
            bounds.right + 2 ||
          rect.bottom >
            bounds.bottom + 2
        ) {
          overflow =
            true;
        }
      }

      if (
        parent === page
      ) {
        break;
      }

      parent =
        parent.parentElement;
    }


    /* ==========================================================================
       Overflow
    ========================================================================== */

    if (overflow) {
      problems.add(
        page.dataset.albumPage ??
          ""
      );
    }
  }


  /* ==========================================================================
     Return
  ========================================================================== */

  return [
    ...problems,
  ];
}