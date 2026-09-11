import "server-only";

import {
  createClient,
} from "@supabase/supabase-js";

import type {
  Database,
} from "./database.types";


/* ==========================================================================
   Supabase Admin Client
========================================================================== */

export function createAdminClient() {
  const supabaseUrl =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  const secretKey =
    process.env
      .SUPABASE_SECRET_KEY;

  if (
    !supabaseUrl ||
    !secretKey
  ) {
    throw new Error(
      "Supabase admin client nije konfiguriran."
    );
  }

  return createClient<Database>(
    supabaseUrl,
    secretKey,
    {
      auth: {
        autoRefreshToken:
          false,

        persistSession:
          false,

        detectSessionInUrl:
          false,
      },
    }
  );
}