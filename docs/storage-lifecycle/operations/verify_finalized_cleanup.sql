-- READ ONLY before/after optional SQL020; does not claim jobs or call mutation RPCs.
select pg_get_functiondef('public.storage_claim_cleanup(integer)'::regprocedure);
select has_function_privilege('service_role','public.storage_claim_cleanup(integer)','EXECUTE') as service_execute,
 has_function_privilege('anon','public.storage_claim_cleanup(integer)','EXECUTE') as anon_execute,
 has_function_privilege('authenticated','public.storage_claim_cleanup(integer)','EXECUTE') as auth_execute;
select state, result is not null as finalized_receipt, count(*)
from private.storage_objects group by state, result is not null;
