import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";


/* ==========================================================================
   Not Found
========================================================================== */

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "Common.notFound" });
  return (
    <main
      lang={locale}
      className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center"
    >
      <span
        className="text-[6rem] font-extrabold leading-none text-primary"
      >w
        404
      </span>

      <h1 className="text-[2rem]">
        {t("title")}
      </h1>

      <p className="max-w-[500px] text-muted-foreground leading-[1.7]">
        {t("description")}
      </p>

      <Link
        href={getPathname({ locale, href: "/" })}
        className="mt-4 inline-flex h-[44px] items-center justify-center rounded-[var(--radius)] bg-primary px-6 font-semibold text-primary-foreground no-underline transition-opacity duration-200 ease-[ease] hover:opacity-90"
      >
        {t("backHome")}
      </Link>
    </main>
  );
}
