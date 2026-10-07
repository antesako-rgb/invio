import { z } from "zod";

const uuid = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

export const storageKeySchema = z.string().regex(
  new RegExp(`^projects/${uuid}/photos/${uuid}\\.webp$`),
);
