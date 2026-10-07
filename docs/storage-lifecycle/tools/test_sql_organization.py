"""Local organization checks only: no SQL execution or network clients."""

import hashlib
import json
import unittest
from collections import Counter
from build_definitions import build as build_definitions

from sql_package import ROOT, statements

def build_install():
    return {p.relative_to(ROOT / "install").as_posix(): p.read_text(encoding="utf-8")
            for p in sorted((ROOT / "install").rglob("*.sql"), key=lambda p: p.name)}

def install_source():
    return "\n".join(build_install().values())


class SqlOrganizationTests(unittest.TestCase):
    def test_install_is_complete_transactional_and_activation_is_last(self):
        install = build_install()
        self.assertEqual(len(install), 18)
        for name, text in install.items():
            parsed = list(statements(text))
            self.assertEqual(parsed[0].lower(), "begin;")
            self.assertEqual(parsed[-1].lower(), "commit;")

            if name != "activation/018_ACTIVATE.sql":
                self.assertTrue(any(sql.startswith("revoke all ") for sql in parsed))
                self.assertFalse(any(sql.startswith(("create trigger ", "grant execute ")) for sql in parsed))
        activation = install["activation/018_ACTIVATE.sql"]
        self.assertIn("from public, anon, authenticated, service_role", activation)
        self.assertIn("to service_role", activation)

    def test_nested_install_order_and_inventory(self):
        expected = list(build_install())
        actual = sorted((ROOT / "install").rglob("*.sql"), key=lambda path: path.name)
        self.assertEqual([path.relative_to(ROOT / "install").as_posix() for path in actual], expected)
        self.assertEqual([p.name[:3] for p in actual], [f"{n:03d}" for n in range(1, 19)])
        checksums = json.loads((ROOT / "tests/install_checksums.json").read_text(encoding="utf-8"))
        self.assertEqual({p.relative_to(ROOT / "install").as_posix(): hashlib.sha256(p.read_bytes()).hexdigest() for p in actual}, checksums)

    def test_save_only_definitions_preserve_every_install_statement(self):
        definitions = build_definitions()
        original = [sql for sql in statements(install_source()) if sql.lower() not in ("begin;", "commit;")
                    and not sql.lower().startswith("revoke execute on function public.create_invitation_photo(")]
        originals_020 = list(statements((ROOT / "maintenance/020_finalized_only_cleanup.sql").read_text(encoding="utf-8")))
        original = [sql for sql in original if not sql.lower().startswith("create function public.storage_claim_cleanup(")]
        original.extend(sql for sql in originals_020 if sql.lower() not in ("begin;", "commit;"))
        extracted = []
        for name, text in definitions.items():
            self.assertTrue(text.startswith("-- SAVE / REVIEW ONLY"))
            self.assertEqual((ROOT / "definitions" / name).read_text(encoding="utf-8"), text)
            extracted.extend(statements(text))
        self.assertEqual(Counter(original), Counter(extracted))

    def test_storage_objects_definitions_have_no_empty_trigger(self):
        definitions = build_definitions()
        self.assertEqual({name for name in definitions if name.startswith("storage_objects/")},
                         {"storage_objects/table.sql", "storage_objects/index.sql",
                          "storage_objects/rls.sql", "storage_objects/grants.sql"})

    def test_splitter_keeps_function_strings_and_dollar_bodies_intact(self):
        body = "create function sample() returns text as $body$ begin return 'value; -- not a comment'; end; $body$ language plpgsql;"
        self.assertEqual(list(statements(f"-- header\nbegin;\n{body}\ncommit;")), ["begin;", body, "commit;"])
        self.assertEqual(list(statements("select 'it''s;a'; -- trailing\n")), ["select 'it''s;a';"])

    def test_queue_checks_references_before_global_ambiguity_without_quarantine(self):
        source = install_source()
        queue = next(sql for sql in statements(source) if sql.startswith("create function private.storage_queue("))
        refs = queue.index("if private.storage_has_references(o.storage_key)")
        ambiguity = queue.index("-- Global uncertainty")
        exact_alias = queue.index("-- An exact alias")
        self.assertLess(refs, ambiguity)
        self.assertNotIn("state = 'quarantined'", queue[ambiguity:exact_alias])

    def test_reference_ids_include_ledger_and_lock_fails_fast(self):
        source = list(statements(install_source()))
        refs = next(sql for sql in source if sql.startswith("create function private.storage_has_references("))
        self.assertIn("select id from private.storage_objects where storage_key = p_key", refs)
        self.assertIn("select photo_id from private.storage_legacy_review", refs)
        self.assertIn("join object_ids o on o.id = ids.photo_id", refs)
        gate = next(sql for sql in source if sql.startswith("create function private.storage_lock("))
        self.assertIn("pg_try_advisory_xact_lock", gate)
        self.assertIn("errcode = '40001'", gate)
        self.assertNotIn("pg_catalog.pg_advisory_xact_lock(", gate)

    def test_document_and_association_guards_cover_both_identity_axes(self):
        source = install_source()
        self.assertIn("create function private.storage_document_guard()", source)
        self.assertIn("private.invitation_document_photo_ids(new.document)", source)
        self.assertIn("private.digital_album_document_photo_ids(new.document)", source)
        self.assertIn("before insert or update of document, project_id", source)
        self.assertIn("new.photo_id is distinct from old.photo_id", source)
        for parent in ("invitation_id", "album_id", "photo_wall_id"):
            self.assertIn(f"to_jsonb(old)->'{parent}'", source)

    def test_completion_checks_wall_clock_after_job_lock_and_preserves_quarantine(self):
        source = list(statements(install_source()))
        ack = next(sql for sql in source if sql.startswith("create function public.storage_finish_cleanup("))
        self.assertLess(ack.index("select * into o"), ack.index("select * into j"))
        self.assertLess(ack.index("select * into j"), ack.index("j.lease_until <= clock_timestamp()"))
        self.assertIn("o.state <> 'deleting'", ack)
        self.assertIn("j.lease_token is distinct from p_lease_token", ack)


if __name__ == "__main__":
    unittest.main()
