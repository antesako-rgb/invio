# Datoteke ove promjene

Postoje?e povijesne docs SQL skripte nisu mijenjane ovim zadatkom.
Nema izmjene generated DB tipova ni konfiguracije okru?enja.

## Aplikacija i testovi

- `src/features/seating/elements/model.ts`
- `src/features/seating/elements/database.ts`
- `src/features/seating/elements/release.ts`
- `src/features/seating/actions/manageSeatingElementAction.ts`
- `src/features/seating/actions/createPlanFromTemplateAction.ts`
- `src/features/seating/repositories/getSeatingElements.ts`
- `src/features/seating/repositories/getSeatingPlan.ts`
- `src/features/seating/components/elements/ElementShape.tsx`
- `src/features/seating/components/elements/ElementsPanel.tsx`
- `src/features/seating/components/SeatingCanvas.tsx`
- `src/features/seating/components/SeatingWorkspace.tsx`
- `src/features/seating/services/seatingError.ts`
- `src/features/seating/templates/buildSeatingTemplate.ts`
- `src/features/seating/templates/getSeatingTemplates.ts`
- `src/features/seating/templates/seatingTemplate.schema.ts`
- `src/features/seating/tests/elements.test.cjs`
- `src/features/seating/tests/workspacePanels.test.cjs`
- `src/features/seating/tests/rsvpSyncActions.test.cjs`
- `src/messages/hr/seating.json`
- `src/messages/en/seating.json`

## Kanonske definicije

- `supabase/schemas/seating/seating_elements/functions/private.seating_element_guard.sql`
- `supabase/schemas/seating/seating_elements/functions/private.seating_element_valid.sql`
- `supabase/schemas/seating/seating_elements/functions/public.manage_seating_element.sql`
- `supabase/schemas/seating/seating_elements/grants.sql`
- `supabase/schemas/seating/seating_elements/indexes.sql`
- `supabase/schemas/seating/seating_elements/rls.sql`
- `supabase/schemas/seating/seating_elements/table.sql`
- `supabase/schemas/seating/seating_elements/triggers.sql`
- `supabase/schemas/seating/seating_plans/functions/private.lock_seating_plan.sql`
- `supabase/schemas/seating/seating_plans/functions/private.lock_seating_project.sql`
- `supabase/schemas/seating/seating_plans/functions/private.seating_authorize.sql`
- `supabase/schemas/seating/seating_plans/functions/private.seating_geometry_fits.sql`
- `supabase/schemas/seating/seating_plans/functions/private.seating_plan_guard.sql`
- `supabase/schemas/seating/seating_plans/functions/public.manage_seating_plan.sql`
- `supabase/schemas/seating/seating_plans/grants.sql`
- `supabase/schemas/seating/seating_plans/indexes.sql`
- `supabase/schemas/seating/seating_plans/rls.sql`
- `supabase/schemas/seating/seating_plans/table.sql`
- `supabase/schemas/seating/seating_plans/triggers.sql`
- `supabase/schemas/seating/seating_tables/functions/public.manage_seating_table.sql`
- `supabase/schemas/seating/seating_templates/functions/private.seating_template_guard.sql`
- `supabase/schemas/seating/seating_templates/functions/private.validate_seating_template.sql`
- `supabase/schemas/seating/seating_templates/functions/public.create_seating_plan_from_template.sql`
- `supabase/schemas/seating/seating_templates/grants.sql`
- `supabase/schemas/seating/seating_templates/indexes.sql`
- `supabase/schemas/seating/seating_templates/rls.sql`
- `supabase/schemas/seating/seating_templates/table.sql`
- `supabase/schemas/seating/seating_templates/triggers.sql`

## SQL paket i evidencija

- `supabase/README.md`
- `supabase/migrations/20261012180000_seating_elements.sql`
- `supabase/install/20261012180000_seating_elements/README.md`
- `supabase/verify/assert/seating_elements_preflight.sql`
- `supabase/verify/assert/seating_elements.sql`
- `supabase/verify/inspect/seating_elements.sql`
- `supabase/tests/negative/seating_elements.local.cjs`
- `supabase/tests/concurrency/seating_elements.md`
- `supabase/manifests/check-seating-elements.cjs`
- `supabase/manifests/seating-elements.dev-capture.json`
- `supabase/manifests/seating-elements.expected.json`
- `supabase/manifests/seating-elements.change.json`
- `supabase/manifests/coverage.json`
- `supabase/manifests/load-order.json`
- `supabase/manifests/files.sha256.json`

Tri postoje?a odobrena Visual modula ponovno se koriste bez izmjena.
DEV stanje potvr?eno je read-only usporedbom; migracija je evidentirana i lokalna integracija aktivirana nakon korisnikove potvrde.
