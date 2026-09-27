import type { PhotoWallMaterialContent } from "../../types/photoWallMaterialContent.types";

function record(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function text(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

// Read old JSON defensively; only the current Material domain enters rendering.
export function parsePhotoWallMaterialContent(input: unknown): PhotoWallMaterialContent {
  const value = record(input);
  const hero = record(value.hero);
  return {
    hero: {
      primary_name: text(hero.primary_name), secondary_name: text(hero.secondary_name),
      title: text(hero.title), subtitle: text(hero.subtitle),
      first_initial: text(hero.first_initial), second_initial: text(hero.second_initial),
    },
    description: text(value.description),
    date: { start_date: text(record(value.date).start_date) },
    time: { start_time: text(record(value.time).start_time) },
    location: { name: text(record(value.location).name), address: text(record(value.location).address) },
  };
}
