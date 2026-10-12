/** Konva accepts CanvasImageSource at runtime; its declaration narrows this to HTMLImageElement. */
export function patternImage(tile: HTMLCanvasElement | undefined): HTMLImageElement | undefined {
  return tile as unknown as HTMLImageElement | undefined;
}
