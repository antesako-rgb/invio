export const ROOM_STYLES = ["neutral", "light_oak", "dark_oak", "marble", "tiles", "concrete"] as const;
export const FLOOR_STYLES = ["classic_parquet", "herringbone", "dark_wood", "white", "black_white", "minimal"] as const;

export function appearanceOf(row: unknown): unknown {
  return typeof row === "object" && row !== null && "appearance" in row ? row.appearance : {};
}
