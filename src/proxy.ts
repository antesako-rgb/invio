import {
  createServerClient,
} from "@supabase/ssr";

import createMiddleware
  from "next-intl/middleware";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import type {
  Database,
} from "@/lib/supabase/database.types";

import {
  routing,
} from "@/i18n/routing";

import {
  locales,
} from "@/i18n/config";


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
  request:
    NextRequest
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

  const {
    data,
  } =
    await supabase.auth.getClaims();


  /* ==========================================================================
     Pathname
  ========================================================================== */

  const pathname =
    request.nextUrl.pathname;

  const segments =
    pathname
      .split("/")
      .filter(
        Boolean
      );

  const hasLocalePrefix =
    locales.includes(
      segments[0] as typeof locales[number]
    );

  const pathnameWithoutLocale =
    hasLocalePrefix
      ? `/${segments.slice(1).join("/")}`
      : pathname;


  /* ==========================================================================
     Protected Routes
  ========================================================================== */

  const isProtectedRoute =
    pathnameWithoutLocale === "/dashboard" ||
    pathnameWithoutLocale.startsWith(
      "/dashboard/"
    ) ||
    pathnameWithoutLocale === "/editor" ||
    pathnameWithoutLocale.startsWith(
      "/editor/"
    );

  if (
    isProtectedRoute &&
    !data?.claims
  ) {
    const loginUrl =
      request.nextUrl.clone();

    loginUrl.pathname =
      hasLocalePrefix
        ? `/${segments[0]}/prijava`
        : "/prijava";

    loginUrl.search =
      "";

    loginUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    );

    return NextResponse.redirect(
      loginUrl
    );
  }


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