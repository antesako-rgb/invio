import {
  getTranslations,
} from "next-intl/server";


/* ==========================================================================
   Home Page
========================================================================== */

export default async function HomePage() {
  const t =
    await getTranslations(
      "Common"
    );

  return (
    <main>
      <h1>
        {t("appName")}
      </h1>
    </main>
  );
}