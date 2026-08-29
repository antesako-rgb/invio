/* ==========================================================================
   Countries
========================================================================== */

export interface Country {
  code:
    string;

  timezone:
    string;
}


export const COUNTRIES: Country[] = [
  {
    code: "HR",
    timezone:
      "Europe/Zagreb",
  },
  {
    code: "BA",
    timezone:
      "Europe/Sarajevo",
  },
  {
    code: "RS",
    timezone:
      "Europe/Belgrade",
  },
  {
    code: "SI",
    timezone:
      "Europe/Ljubljana",
  },
  {
    code: "ME",
    timezone:
      "Europe/Podgorica",
  },
  {
    code: "MK",
    timezone:
      "Europe/Skopje",
  },
  {
    code: "XK",
    timezone:
      "Europe/Belgrade",
  },
  {
    code: "AL",
    timezone:
      "Europe/Tirane",
  },
  {
    code: "AT",
    timezone:
      "Europe/Vienna",
  },
  {
    code: "DE",
    timezone:
      "Europe/Berlin",
  },
  {
    code: "IT",
    timezone:
      "Europe/Rome",
  },
  {
    code: "HU",
    timezone:
      "Europe/Budapest",
  },
  {
    code: "SK",
    timezone:
      "Europe/Bratislava",
  },
  {
    code: "CZ",
    timezone:
      "Europe/Prague",
  },
  {
    code: "PL",
    timezone:
      "Europe/Warsaw",
  },
  {
    code: "FR",
    timezone:
      "Europe/Paris",
  },
  {
    code: "ES",
    timezone:
      "Europe/Madrid",
  },
  {
    code: "PT",
    timezone:
      "Europe/Lisbon",
  },
  {
    code: "NL",
    timezone:
      "Europe/Amsterdam",
  },
  {
    code: "BE",
    timezone:
      "Europe/Brussels",
  },
  {
    code: "GB",
    timezone:
      "Europe/London",
  },
  {
    code: "IE",
    timezone:
      "Europe/Dublin",
  },
  {
    code: "CH",
    timezone:
      "Europe/Zurich",
  },
  {
    code: "SE",
    timezone:
      "Europe/Stockholm",
  },
  {
    code: "NO",
    timezone:
      "Europe/Oslo",
  },
  {
    code: "DK",
    timezone:
      "Europe/Copenhagen",
  },
  {
    code: "FI",
    timezone:
      "Europe/Helsinki",
  },
  {
    code: "RO",
    timezone:
      "Europe/Bucharest",
  },
  {
    code: "BG",
    timezone:
      "Europe/Sofia",
  },
  {
    code: "GR",
    timezone:
      "Europe/Athens",
  },
];


/* ==========================================================================
   Helpers
========================================================================== */

export function getCountry(
  countryCode?: string | null
): Country | undefined {
  return COUNTRIES.find(
    (country) =>
      country.code ===
      countryCode
  );
}


export function getCountryTimezone(
  countryCode?: string | null
): string | undefined {
  return getCountry(
    countryCode
  )?.timezone;
}


export function isValidCountryCode(
  countryCode?: string | null
): boolean {
  return COUNTRIES.some(
    (country) =>
      country.code ===
      countryCode
  );
}


/* ==========================================================================
   Localized Country Helpers
========================================================================== */

export function getCountryLabel(
  countryCode: string,
  locale: string
): string {
  const displayNames =
    new Intl.DisplayNames(
      [locale],
      {
        type: "region",
      }
    );

  return (
    displayNames.of(
      countryCode
    ) ??
    countryCode
  );
}

export interface CountryOption {
  value:
    string;

  label:
    string;
}
export function getCountryOptions(
  locale: string
): CountryOption[] {
  return COUNTRIES.map(
    (country) => ({
      value:
        country.code,

      label:
        getCountryLabel(
          country.code,
          locale
        ),
    })
  );
}


/* ==========================================================================
   Location
========================================================================== */

export function formatLocation(
  city: string | null | undefined,
  countryCode: string | null | undefined,
  locale: string
): string {
  return [
    city?.trim(),

    countryCode
      ? getCountryLabel(
          countryCode,
          locale
        )
      : null,
  ]
    .filter(Boolean)
    .join(", ");
}