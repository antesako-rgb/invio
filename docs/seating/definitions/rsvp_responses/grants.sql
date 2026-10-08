-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
-- EXISTING table grants unchanged; migration does not reset platform rights.
revoke all on function public.get_public_rsvp(text) from public,anon,authenticated,service_role;
grant execute on function public.get_public_rsvp(text) to anon,authenticated;
