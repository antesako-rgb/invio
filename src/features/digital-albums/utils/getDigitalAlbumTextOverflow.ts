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
        text;

    const contentStyle = getComputedStyle(content);
    const clipsContent = ["hidden", "clip", "auto", "scroll"].includes(contentStyle.overflow);
    const maxHeight = Number.parseFloat(contentStyle.maxHeight);

    // Font ink can extend beyond a natural line box (notably Playfair Display).
    // scrollHeight alone therefore does not mean the text exceeds its layout.
    // Check scroll extents only against real constraints; natural text is
    // checked against its composition and page bounds below.
    let overflow =
      (clipsContent && content.clientWidth > 0 && content.scrollWidth > content.clientWidth + 2) ||
      (clipsContent && content.clientHeight > 0 && content.scrollHeight > content.clientHeight + 2) ||
      (Number.isFinite(maxHeight) && content.scrollHeight > maxHeight + 2);


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
