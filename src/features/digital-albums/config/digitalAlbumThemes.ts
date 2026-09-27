export const DIGITAL_ALBUM_THEMES = {
  classic: { preview: "/digital-albums/theme-previews/classic.webp" },
  modern: { preview: "/digital-albums/theme-previews/modern.webp" },
  editorial: { preview: "/digital-albums/theme-previews/editorial.webp" },
} as const;

export type AlbumThemeId = keyof typeof DIGITAL_ALBUM_THEMES;
export const DIGITAL_ALBUM_THEME_IDS = Object.keys(DIGITAL_ALBUM_THEMES) as AlbumThemeId[];
export function isDigitalAlbumTheme(value: unknown): value is AlbumThemeId {
  return typeof value === "string" && Object.hasOwn(DIGITAL_ALBUM_THEMES, value);
}
