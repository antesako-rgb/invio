# Datoteke SQL prijedloga i arhitekture preseta

Novi preset frontend aktiviran je nakon ručne primjene migracije, read-only provjere i regeneracije native tipova. Nijedna primijenjena migracija nije izmijenjena.

Novi paket:

- `supabase/migrations/20261012223000_seating_preset_styles.sql`
- `supabase/verify/assert/seating_preset_styles_preflight.sql`
- `supabase/verify/assert/seating_preset_styles.sql`
- `supabase/verify/inspect/seating_preset_styles.sql`
- `supabase/tests/negative/seating_preset_styles.local.cjs`
- `supabase/manifests/check-seating-preset-styles.cjs`
- `supabase/manifests/seating-preset-styles.baseline.json`
- `supabase/manifests/seating-preset-styles.expected.json`
- `supabase/manifests/seating-preset-styles.dev-review.json`
- `supabase/manifests/seating-preset-styles.change.json`
- `supabase/install/20261012223000_seating_preset_styles/README.md`
- `supabase/install/20261012223000_seating_preset_styles/FILES.md`

Kanonske definicije pripremljenog budućeg stanja:

- `supabase/schemas/seating/seating_tables/table.sql`
- `supabase/schemas/seating/seating_plans/functions/private.normalize_seating_appearance.sql`
- `supabase/schemas/seating/seating_plans/functions/public.set_seating_appearance.sql`
- `supabase/schemas/seating/seating_templates/functions/private.validate_seating_template.sql`
- `supabase/schemas/seating/seating_templates/functions/public.create_seating_plan_from_template.sql`

Ažurirana evidencija i lokalne provjere:

- `supabase/README.md`
- `supabase/manifests/coverage.json`
- `supabase/manifests/load-order.json`
- `supabase/manifests/files.sha256.json`
- `supabase/manifests/check-seating-appearance.cjs` — primijenjena migracija ostaje povijesni snapshot; buduće kanonske definicije provjerava novi paket.

`applications.json` ostaje nepromijenjen: novi prijedlog nije primijenjen.
Native DB tipovi i aktualni frontend ostaju usklađeni s današnjim DEV modelom.

## Frontend i provjere pripremljeni nakon odobrenja

- `src/features/seating/appearance/presets.ts`
- `src/features/seating/appearance/presetPatterns.ts`
- `src/features/seating/appearance/release.ts`
- `src/features/seating/components/appearance/PresetPanel.tsx`
- `src/features/seating/components/appearance/PresetPreview.tsx`
- `src/features/seating/components/appearance/TableThemeRenderer.tsx`
- `src/features/seating/components/appearance/RoomFloorRenderer.tsx`
- `src/features/seating/components/appearance/DanceFloorAppearanceRenderer.tsx`
- `src/features/seating/components/appearance/MaterialPanel.module.css`
- `src/features/seating/components/TableDecorations.tsx`
- `src/features/seating/components/SeatingCanvas.tsx`
- `src/features/seating/components/SeatingWorkspace.tsx`
- `src/features/seating/components/SeatingTablesPanel.tsx`
- `src/features/seating/components/SeatingTablePreview.tsx`
- `src/features/seating/components/CreateSeatingTableDialog.tsx`
- `src/features/seating/actions/setSeatingAppearanceAction.ts`
- `src/features/seating/types.ts`
- `src/features/seating/elements/model.ts`
- `src/features/seating/templates/seatingTemplate.schema.ts`
- `src/features/seating/templates/buildSeatingTemplate.ts`
- `src/features/seating/validation/duplicateTable.ts`
- `src/features/seating/tests/presetStyles.test.cjs`
- `src/features/seating/tests/editorGeometry.test.cjs`
- `src/messages/hr/seating.json`
- `src/messages/en/seating.json`

## Usklađivanje nakon ručne SQL primjene

- `src/features/seating/appearance/model.ts` — uklonjen stari granularni JSON model.
- `src/features/seating/appearance/patterns.ts` — uklonjeni stari proceduralni uzorci; zadržan Konva image helper.
- `src/lib/supabase/database.types.ts` — korisnički regenerirani tipovi normalizirani iz UTF-16 u UTF-8, bez prepisivanja definicija.
- `src/features/seating/tests/appearance.test.cjs`, `elements.test.cjs`, `workspacePanels.test.cjs` — aktualni model, zajednička tema i bez per-table/bulk UI-a.
- `supabase/manifests/seating-preset-styles.dev-verified.json` — dokaz aktualnog DEV kataloga i sigurnosti.
- Ledger, coverage, load-order, change manifesti i integrity checkeri usklađeni s primijenjenim stanjem.
- Uklonjeni `src/features/seating/components/appearance/MaterialPanel.tsx` i `TableAppearanceRenderer.tsx`.

## Vizualna dorada za svadbene događaje

Bez SQL promjene ili promjene identifikatora tema:

- `src/features/seating/appearance/presets.ts` — ivory/blush, garden sage, pearl white i champagne palete.
- `src/features/seating/appearance/presetPatterns.ts` — topliji materijali, pravi ponavljajući herringbone i suptilnije mramorne vene.
- `src/features/seating/components/appearance/TableThemeRenderer.tsx` — cvjetne rozete, zelenilo i svijeće izvan oznaka.
- `src/features/seating/components/TableDecorations.tsx` — detalji naslona i tapeciranih sjedala unutar istih chair footprints.
- `src/features/seating/components/appearance/DanceFloorAppearanceRenderer.tsx` — elegantniji obrubi podija.
- `src/features/seating/components/elements/StageVisual.tsx`, `DjBoothVisual.tsx` — topla drvena pozornica i svijetla event fasada DJ pulta.
- `src/features/seating/components/appearance/PresetPanel.tsx`, `MaterialPanel.module.css` — kratki opisi tema, čitljivije kartice i focus/hover stanje.
- `src/messages/hr/seating.json`, `src/messages/en/seating.json` — prijevodi opisa tema.

Generic ostaje jednostavan. Geometrija, gosti, dodjele, revizije i spremanje su
nepromijenjeni. 218 testova, TypeScript, lint i lokalni Konva preview prolaze.
