/** Self-contained: executed inside Chromium, not in the Node process. */
export async function validateDigitalAlbumFonts() {
  const root = document.querySelector<HTMLElement>('[data-album-print-hydrated="true"]');
  if (!root) return { reason: "font-root-missing", fonts: [] };
  const requests = new Map<string, { family: string; style: string; weight: string; text: string; status: string }>();
  const primary = (value: string) => value.split(",")[0].trim().replace(/^["']|["']$/g, "");
  const add = (family: string, style: string, weight: string, text: string) => {
    const key = `${family}:${style}:${weight}`;
    const previous = requests.get(key);
    requests.set(key, { family, style, weight, text: (previous?.text ?? "") + text, status: "loading" });
  };
  const themeStyle = getComputedStyle(root);
  for (const token of ["--album-title-font", "--album-body-font", "--album-script-font"]) {
    add(primary(themeStyle.getPropertyValue(token)), "normal", "400", "BESbswy");
  }
  // Include actual glyphs, weights and styles; never send user text to logging.
  for (const element of root.querySelectorAll<HTMLElement>("[data-album-text]")) {
    if (!element.textContent?.trim()) continue;
    const style = getComputedStyle(element);
    add(primary(style.fontFamily), style.fontStyle, style.fontWeight, element.textContent);
  }
  const safe = (value: string) => value.replace(/[^a-zA-Z0-9 _.,-]/g, "").slice(0, 100);
  const details = () => Array.from(requests.values()).filter((request) => request.status !== "loaded")
    .slice(0, 20).map(({ family, style, weight, status }) => ({ family: safe(family), style: safe(style), weight: safe(weight), status }));
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.all(Array.from(requests.values(), async (request) => {
        const family = request.family;
        if (!family || !Array.from(document.fonts).some((face) => primary(face.family) === family)) {
          request.status = "unregistered";
          return;
        }
        try {
          const spec = `${request.style} ${request.weight} 16px ${JSON.stringify(family)}`;
          const faces = await document.fonts.load(spec, request.text);
          request.status = faces.length && faces.every((face) => face.status === "loaded") && document.fonts.check(spec, request.text)
            ? "loaded" : "error";
        } catch { request.status = "error"; }
      })).then(() => {
        const fonts = details();
        return fonts.length ? { reason: "required-font-load-failed", fonts } : null;
      }),
      new Promise<{ reason: string; fonts: ReturnType<typeof details> }>((resolve) => {
        timer = setTimeout(() => resolve({ reason: "required-font-timeout", fonts: details() }), 45_000);
      }),
    ]);
  } finally { clearTimeout(timer); }
}
