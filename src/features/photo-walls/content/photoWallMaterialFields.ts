import type { PhotoWallMaterialContent } from "../types/photoWallMaterialContent.types";

type Field = {
  label: string;
  type: "text" | "textarea" | "date" | "time";
  maxLength: number;
  get: (content: PhotoWallMaterialContent) => string | null;
  set: (content: PhotoWallMaterialContent, value: string | null) => PhotoWallMaterialContent;
};

export const photoWallMaterialFields = {
  "hero.title": { label: "title", type: "text", maxLength: 90, get: c => c.hero.title, set: (c, v) => ({ ...c, hero: { ...c.hero, title: v } }) },
  description: { label: "description", type: "textarea", maxLength: 240, get: c => c.description, set: (c, v) => ({ ...c, description: v }) },
  "hero.subtitle": { label: "subtitle", type: "text", maxLength: 110, get: c => c.hero.subtitle, set: (c, v) => ({ ...c, hero: { ...c.hero, subtitle: v } }) },
  "hero.primary_name": { label: "primaryName", type: "text", maxLength: 65, get: c => c.hero.primary_name, set: (c, v) => ({ ...c, hero: { ...c.hero, primary_name: v } }) },
  "hero.secondary_name": { label: "secondaryName", type: "text", maxLength: 65, get: c => c.hero.secondary_name, set: (c, v) => ({ ...c, hero: { ...c.hero, secondary_name: v } }) },
  "hero.first_initial": { label: "firstInitial", type: "text", maxLength: 3, get: c => c.hero.first_initial, set: (c, v) => ({ ...c, hero: { ...c.hero, first_initial: v } }) },
  "hero.second_initial": { label: "secondInitial", type: "text", maxLength: 3, get: c => c.hero.second_initial, set: (c, v) => ({ ...c, hero: { ...c.hero, second_initial: v } }) },
  "date.start_date": { label: "date", type: "date", maxLength: 10, get: c => c.date.start_date, set: (c, v) => ({ ...c, date: { start_date: v } }) },
  "time.start_time": { label: "time", type: "time", maxLength: 8, get: c => c.time.start_time, set: (c, v) => ({ ...c, time: { start_time: v } }) },
  "location.name": { label: "location", type: "text", maxLength: 100, get: c => c.location.name, set: (c, v) => ({ ...c, location: { ...c.location, name: v } }) },
  "location.address": { label: "address", type: "text", maxLength: 160, get: c => c.location.address, set: (c, v) => ({ ...c, location: { ...c.location, address: v } }) },
} satisfies Record<string, Field>;

export type PhotoWallMaterialField = keyof typeof photoWallMaterialFields;
