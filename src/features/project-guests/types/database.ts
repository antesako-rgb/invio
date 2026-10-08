import type { Database } from "@/lib/supabase/database.types";
export type { Database as SeatingDatabase };
export type ProjectGuest = Database["public"]["Tables"]["project_guests"]["Row"] & {
    invitationNames?: string[];
    invitationIds?: string[];
};

// PostgreSQL function arguments can be NULL; generated RPC types omit that
// nullability. Call only after the action has validated its operation schema.
export function nullableRpcArgs<Name extends keyof Database["public"]["Functions"]>(
    args: { [K in keyof Database["public"]["Functions"][Name]["Args"]]: Database["public"]["Functions"][Name]["Args"][K] | null },
): Database["public"]["Functions"][Name]["Args"] {
    return args as Database["public"]["Functions"][Name]["Args"];
}