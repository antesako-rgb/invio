"""Generate save-only SQL definitions from install. No database access."""
import argparse
from collections import defaultdict
import re
from sql_package import ROOT, statements

HEADER = "-- SAVE / REVIEW ONLY: save in SQL Editor; DO NOT execute after install.\n-- Initial application: install/001-018 in README order, with atomic activation.\n"

def build():
    grouped = defaultdict(list)
    for path in sorted((ROOT / 'install').rglob('*.sql'), key=lambda p: p.name):
        for sql in statements(path.read_text(encoding='utf-8')):
            lower = sql.lower()
            # The two legacy registration RPCs were removed after installation.
            if lower in ('begin;', 'commit;') or lower.startswith('revoke execute on function public.create_invitation_photo('):
                continue
            match = re.match(r'create table ([\w.]+)', sql, re.I)
            if match:
                target = match[1].split('.')[-1] + '/table.sql'
            elif re.match(r'create index ', sql, re.I):
                target = re.search(r' on ([\w.]+)', sql, re.I)[1].split('.')[-1] + '/index.sql'
            elif re.match(r'(alter table|create policy) ', sql, re.I):
                match = re.search(r'(?:alter table| on) ([\w.]+)', sql, re.I)
                target = match[1].split('.')[-1] + '/rls.sql'
            elif re.match(r'revoke all on private\.', sql, re.I) and 'function ' not in lower:
                target = re.search(r'on ([\w.]+)', sql, re.I)[1].split('.')[-1] + '/grants.sql'
            elif re.match(r'create (or replace )?function ', sql, re.I):
                name = re.search(r'function ([\w.]+)', sql, re.I)[1]
                target = ('invitation' if name == 'private.invitation_document_photo_ids' else 'storage_lifecycle') + '/' + name + '.sql'
            elif re.match(r'create trigger ', sql, re.I):
                target = re.search(r' on ([\w.]+)', sql, re.I)[1].split('.')[-1] + '/trigger.sql'
            elif lower.startswith(('grant ', 'revoke ')):
                target = 'storage_lifecycle/grants.sql'
            else:
                raise ValueError('Unclassified SQL: ' + sql[:100])
            grouped[target].append('-- Source: install/' + path.relative_to(ROOT / 'install').as_posix() + '\n' + sql)
    # SQL020 was applied by the operator; override the historical install body.
    applied = ROOT / 'maintenance/020_finalized_only_cleanup.sql'
    for sql in statements(applied.read_text(encoding='utf-8')):
        if sql.lower().startswith('create or replace function public.storage_claim_cleanup('):
            grouped['storage_lifecycle/public.storage_claim_cleanup.sql'] = [
                '-- Source: maintenance/020_finalized_only_cleanup.sql (APPLIED)\n' + sql]
        elif sql.lower().startswith(('revoke ', 'grant ')):
            grouped['storage_lifecycle/grants.sql'].append(
                '-- Source: maintenance/020_finalized_only_cleanup.sql (APPLIED)\n' + sql)
    output = {name: HEADER + '\n' + '\n\n'.join(items) + '\n' for name, items in grouped.items()}
    planned_groups = defaultdict(list)
    for sql in statements((ROOT / 'maintenance/021_signed_cleanup_requests.sql').read_text(encoding='utf-8')):
        lower = sql.lower()
        target = None
        if lower.startswith('create table private.storage_cleanup_request_ids'):
            target = 'storage_cleanup_request_ids/table.sql'
        elif lower.startswith(('alter table private.storage_cleanup_request_ids', 'create policy deny_clients on private.storage_cleanup_request_ids')):
            target = 'storage_cleanup_request_ids/rls.sql'
        elif lower.startswith('revoke all on private.storage_cleanup_request_ids'):
            target = 'storage_cleanup_request_ids/grants.sql'
        elif lower.startswith('create function '):
            name = re.search(r'function ([\w.]+)', sql)[1]
            target = 'storage_lifecycle/' + name + '.sql'
        elif lower.startswith(('revoke ', 'grant ')):
            target = 'storage_lifecycle/signed_request_grants.sql'
        if target:
            planned_groups[target].append(sql)
    for name, items in planned_groups.items():
        output[name] = '-- PLANNED DEFINITION / SAVE ONLY. SQL021 NOT APPLIED; do not execute separately.\n' + '\n\n'.join(items) + '\n'
    return output

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    expected = build()
    for name, text in expected.items():
        path = ROOT / 'definitions' / name
        if args.check:
            if not path.exists() or path.read_text(encoding='utf-8') != text:
                raise SystemExit('Definition drift: ' + name)
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text, encoding='utf-8')
    actual = {p.relative_to(ROOT / 'definitions').as_posix() for p in (ROOT / 'definitions').rglob('*.sql')}
    if actual != set(expected):
        raise SystemExit('Definition inventory mismatch')
    print(f'{len(expected)} save-only definitions verified/generated; no DB access.')

if __name__ == '__main__':
    main()
