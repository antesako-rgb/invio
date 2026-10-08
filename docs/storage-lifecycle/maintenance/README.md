# Current maintenance status

SQL020 applied by operator and verified read-only: finalized-only claim, service_role EXECUTE only, empty search_path and SECURITY DEFINER. No pending SQL step remains here. Do not replay SQL020. Deploy application with cleanup disabled next. Actual isolated concurrency/cascade/lease tests remain unexecuted.

SQL021 is pending manual execution after its failed guard (ROLLBACK any open failed transaction first). It permits reported administrative service_role Vault SELECT, but blocks PUBLIC/anon/authenticated including column grants. It does not change Vault privileges. Verify decrypt wrappers and Data API exposure separately with scheduler/004.
