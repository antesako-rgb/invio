import {
  createServerClient,
} from "@supabase/ssr";

import createMiddleware
  from "next-intl/middleware";

import {
  NextRequest,
} from "next/server";

import type {
  Database,
} from "@/lib/supabase/database.types";

import {
  routing,
} from "@/i18n/routing";


/* ==========================================================================
   Intl Middleware
========================================================================== */

const handleI18nRouting =
  createMiddleware(
    routing
  );


/* ==========================================================================
   Proxy
========================================================================== */

export default async function proxy(
  request: NextRequest
) {
  /* ==========================================================================
     Internationalization
  ========================================================================== */

  const response =
    handleI18nRouting(
      request
    );


  /* ==========================================================================
     Supabase
  ========================================================================== */

  console.log(
    "[proxy env]",
    {
      hasSupabaseUrl:
        Boolean(
          process.env
            .NEXT_PUBLIC_SUPABASE_URL
        ),

      hasSupabasePublishableKey:
        Boolean(
          process.env
            .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
        ),
    }
  );

  const supabase =
    createServerClient<Database>(
      process.env
        .NEXT_PUBLIC_SUPABASE_URL!,

      process.env
        .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,

      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },

          setAll(
            cookiesToSet
          ) {
            cookiesToSet.forEach(
              ({
                name,
                value,
              }) => {
                request.cookies.set(
                  name,
                  value
                );
              }
            );

            cookiesToSet.forEach(
              ({
                name,
                value,
                options,
              }) => {
                response.cookies.set(
                  name,
                  value,
                  options
                );
              }
            );
          },
        },
      }
    );


  /* ==========================================================================
     Session
  ========================================================================== */

  await supabase.auth.getClaims();


  /* ==========================================================================
     Response
  ========================================================================== */

  return response;
}


/* ==========================================================================
   Config
========================================================================== */

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};