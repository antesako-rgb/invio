-- READ ONLY: inspects actual function source and tests fixed literals only.
-- Does not call storage_queue or mutate any rows; reads no user or secret values.
select row_number() over() as pattern_number,
 length(m[1])-length(replace(m[1],chr(92),'')) as backslash_count,
 'projects/abc/photos/def.webp' ~ m[1] as canonical_webp_matches,
 'projects/abc/photos/defXwebp' ~ m[1] as missing_dot_matches,
 'https://example.com/photo.webp' ~ m[1] as url_matches,
 'projects/abc/../def.webp' ~ m[1] as traversal_matches
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
cross join lateral regexp_matches(p.prosrc,'!~ ''([^'']+)''','g') m
where n.nspname='private' and p.proname='storage_queue';
-- Expected TWO rows: 1, true, false, false, false for each pattern.
