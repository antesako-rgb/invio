import type { SeatingTable } from "../types";

type Result = { success: boolean; code?: string; data?: unknown };

/** Existing RPCs commit individually. Stop on the first failure; never retry a possibly committed write. */
export async function updateTableSizes(tables: SeatingTable[], revision: number,
  update: (table: SeatingTable, expectedRevision: number) => Promise<Result>) {
  let updated = 0;
  for (const table of tables) {
    let result: Result;
    try { result = await update(table, revision); }
    catch { return { success: false as const, code: "STANDARDIZE_PARTIAL", updated }; }
    if (!result.success) return { success: false as const, code: updated > 0 || result.code !== "REVISION_CONFLICT" ? "STANDARDIZE_PARTIAL" : "REVISION_CONFLICT", updated };
    const data = result.data;
    if (!data || typeof data !== "object" || !("id" in data) || data.id !== table.id ||
      !("revision" in data) || !Number.isSafeInteger(data.revision) || data.revision !== revision+1)
      return { success: false as const, code: "STANDARDIZE_PARTIAL", updated };
    revision = data.revision as number;
    updated++;
  }
  return { success: true as const, data: { revision, updated } };
}
