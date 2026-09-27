import type { DigitalAlbumPageContent, DigitalAlbumPageLayout } from "../types/digitalAlbumDocument.types";

// Fictional event; entirely separate from the production starter.
export const digitalAlbumDemoContent: DigitalAlbumPageContent = {
  title: "Ivana i Robert",
  date: "2026-09-27",
  subtitle: "Uspomene koje ostaju",
  text: "Dan ispunjen toplinom, osmijesima i ljudima koje volimo.",
};

export const digitalAlbumDemoPages: {
  layout: DigitalAlbumPageLayout;
  photos: string[];
  content?: DigitalAlbumPageContent;
}[] = [
  { layout: "cover", photos: ["sunset"] },
  { layout: "editorial", photos: ["embrace"], content: { title: "Naša priča", text: "Od prvog susreta do ovog dana, najviše pamtimo male trenutke. Pogled, zagrljaj i osmijeh. Ove stranice čuvaju dio naše priče." } },
  { layout: "portrait-plate", photos: ["bouquet"] },
  { layout: "portrait-diptych", photos: ["bouquet", "embrace"] },
  { layout: "split", photos: ["details"], content: { title: "Mali trenuci", text: "Cvijeće, nježni dodiri i tišina prije slavlja. Sitnice koje danu daju njegov poseban ritam." } },
  { layout: "story", photos: [], content: { title: "Naš dan", subtitle: "Početak jednog poglavlja", text: "Jutro je počelo tiho, a završilo smijehom. Između su ostali pogledi koje razumijemo samo mi i zagrljaji svih naših ljudi." } },
  { layout: "full-photo", photos: ["sunset"] },
  { layout: "three-grid", photos: ["sunset", "details", "reception"] },
  { layout: "landscape-plate", photos: ["reception"] },
  { layout: "quote", photos: [], content: { text: "Najljepše uspomene stvaramo zajedno.", subtitle: "Ivana i Robert" } },
  { layout: "hero-detail", photos: ["embrace", "details"] },
  { layout: "collage", photos: ["embrace", "details", "reception"], content: { title: "Zajedno", subtitle: "Trenuci za pamćenje" } },
  { layout: "hero-text", photos: ["reception"], content: { title: "Za istim stolom", text: "Svjetlost svijeća, poznati glasovi i priče koje traju do kasno. Najljepši dio večeri bili su ljudi s kojima smo je podijelili." } },
  { layout: "two-photos", photos: ["sunset", "reception"] },
  { layout: "portrait-pair-text", photos: ["bouquet", "details"], content: { title: "Bliskost", subtitle: "Sve što nam je važno" } },
  { layout: "four-grid", photos: ["bouquet", "embrace", "details", "sunset"] },
  { layout: "mixed-pair", photos: ["embrace", "reception"] },
  { layout: "mosaic", photos: ["sunset", "bouquet", "reception", "details", "embrace"] },
  { layout: "closing", photos: [], content: { title: "Hvala", text: "Hvala što ste dio naše priče i ovih uspomena." } },
  { layout: "cover", photos: ["embrace"], content: { subtitle: "Do sljedeće uspomene" } },
];
