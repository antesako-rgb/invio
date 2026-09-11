import {
  createServerClient as createSupabaseServerClient,
} from "@supabase/ssr";

import {
  cookies,
} from "next/headers";

import type {
  Database,
} from "./database.types";


/* ==========================================================================
   Supabase Server Client
========================================================================== */

export async function createServerClient() {
  const cookieStore =
    await cookies();

  return createSupabaseServerClient<Database>(
    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,

    process.env
      .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,

    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(
              ({
                name,
                value,
                options,
              }) => {
                cookieStore.set(
                  name,
                  value,
                  options
                );
              }
            );
          } catch {
            /*
             * createServerClient je pozvan iz
             * Server Componenta.
             *
             * Server Component ne smije
             * mijenjati cookieje.
             *
             * Session se osvježava u proxy.ts.
             */
          }
        },
      },
    }
  );
}