-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
revoke all on public.seating_tables from public,anon,authenticated;
grant select on public.seating_tables to authenticated;
revoke all on function public.manage_seating_table(uuid,bigint,uuid,text,text,text,integer,integer,integer,integer,integer,integer) from public,anon,authenticated,service_role;
grant execute on function public.manage_seating_table(uuid,bigint,uuid,text,text,text,integer,integer,integer,integer,integer,integer) to authenticated;

revoke all on function private.seating_geometry_fits(text,integer,integer,integer,integer,integer,integer,integer) from public,anon,authenticated,service_role;
