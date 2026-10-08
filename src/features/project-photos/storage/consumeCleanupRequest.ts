import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export async function consumeCleanupRequest(
  requestId: string,
  issuedAt: number,
): Promise<boolean> {
  const client = createAdminClient();
  const { data, error } = await client.rpc("storage_consume_cleanup_request", {
    p_request_id: requestId,
    p_timestamp: issuedAt,
  });
  if (error) throw new Error("Cleanup authorization unavailable");
  if (typeof data !== "boolean") {
    throw new Error("Invalid cleanup authorization result");
  }
  return data;
}
