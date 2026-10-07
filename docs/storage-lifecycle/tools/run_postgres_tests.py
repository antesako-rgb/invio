"""Run migrations ONLY in a freshly initialized local PostgreSQL cluster."""

import argparse
import os
from pathlib import Path
import shutil
import socket
import subprocess
import tempfile
import time

ROOT = Path(__file__).resolve().parent.parent


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-isolated", action="store_true", required=True)
    parser.add_argument("--pg-bin", type=Path, help="Local PostgreSQL bin directory")
    args = parser.parse_args()
    tools = {}
    for name in ("initdb", "pg_ctl", "psql"):
        candidate = args.pg_bin / (name + (".exe" if os.name == "nt" else "")) if args.pg_bin else shutil.which(name)
        if not candidate or not Path(candidate).is_file():
            print(f"NOT RUN: local PostgreSQL tool {name} is unavailable. No DB connection attempted.")
            return 2
        tools[name] = str(candidate)
    # Never accept a connection URL, existing data directory, remote host, or .env.
    env = {key: value for key, value in os.environ.items() if not key.startswith("PG")}
    base = ROOT.parents[1] / ".tmp" / "storage-postgres-tests"
    base.mkdir(parents=True, exist_ok=True)
    directory = Path(tempfile.mkdtemp(prefix="isolated-", dir=base)).resolve()
    data = directory / "data"
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        port = sock.getsockname()[1]
    subprocess.run([tools["initdb"], "-D", str(data), "-U", "postgres", "--auth=trust", "--encoding=UTF8", "--no-locale"], env=env, check=True, capture_output=True)
    command = [tools["psql"], "-X", "-h", "127.0.0.1", "-p", str(port), "-U", "postgres", "-d", "postgres",
               "-v", "ON_ERROR_STOP=1", "-v", "VERBOSITY=verbose", "-At"]
    children = []

    def sql(query, app="storage-test"):
        return subprocess.run(command + ["-c", query], env={**env, "PGAPPNAME": app}, text=True, capture_output=True, timeout=25)

    def wait_for(query):
        until = time.monotonic() + 4
        while time.monotonic() < until:
            result = sql(query)
            if result.returncode == 0 and result.stdout.strip() == "t":
                return
            time.sleep(0.1)
        raise AssertionError("Concurrent session did not reach the required lock state")

    def start(query, app):
        child = subprocess.Popen(command + ["-c", query], env={**env, "PGAPPNAME": app}, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        children.append(child)
        return child

    started = False
    try:
        subprocess.run([tools["pg_ctl"], "-D", str(data), "-l", str(directory / "postgres.log"), "-o", f"-h 127.0.0.1 -p {port}", "-w", "-t", "15", "start"], env=env, check=True, capture_output=True)
        started = True
        actual = sql("show data_directory")
        if actual.returncode or Path(actual.stdout.strip()).resolve() != data.resolve():
            raise AssertionError("Refusing to mutate a database outside the newly initialized cluster")
        installation = sorted((ROOT / "install").rglob("*.sql"), key=lambda path: path.name)
        if len(installation) != 18:
            raise AssertionError("Expected all 18 install scripts")
        for file in [ROOT / "tests/postgres/fixture.sql", *installation,
                     ROOT / "tests/postgres/assertions.sql", ROOT / "tests/postgres/completion_and_documents.sql",
                     ROOT / "tests/postgres/legacy_removal_rollback.sql"]:
            result = subprocess.run(command + ["-f", str(file)], env=env, text=True, capture_output=True, timeout=30)
            (directory / (file.name + ".log")).write_text(result.stdout + result.stderr, encoding="utf-8")
            if result.returncode:
                raise AssertionError(f"FAILED {file.name}; see isolated log {directory}")
            print(f"PASS: {file.name}")
        # Check fast retry instead of waiting while another transaction owns gate.
        holder = start("begin; select private.storage_lock(); select pg_sleep(5); rollback;", "storage-gate-holder")
        wait_for("select exists(select 1 from pg_stat_activity where application_name='storage-gate-holder' and wait_event='PgSleep')")
        busy = sql("begin; select private.storage_lock(); rollback;")
        if busy.returncode == 0 or "40001" not in busy.stderr:
            raise AssertionError("Gate contention did not abort with retryable 40001")
        holder.communicate(timeout=10)
        if holder.returncode:
            raise AssertionError("Gate holder failed")
        print("PASS: gate contention returns 40001")
        setup = sql("select public.storage_reserve_upload('00000000-0000-4000-8000-000000000200','invitation','00000000-0000-4000-8000-000000000003',null,'00000000-0000-4000-8000-000000000002'); select public.storage_finalize_upload('00000000-0000-4000-8000-000000000200',10,null);")
        if setup.returncode:
            raise AssertionError(setup.stderr)
        # Reproduce parent-first existing CRUD versus gate-first registration.
        holder = start("begin; select id from public.invitations where id='00000000-0000-4000-8000-000000000003' for update; select pg_sleep(5); update public.invitation_photos set description='synthetic' where photo_id='00000000-0000-4000-8000-000000000200'; commit;", "storage-parent-holder")
        wait_for("select exists(select 1 from pg_stat_activity where application_name='storage-parent-holder' and wait_event='PgSleep')")
        contender = start("select public.storage_reserve_upload('00000000-0000-4000-8000-000000000201','invitation','00000000-0000-4000-8000-000000000003',null,'00000000-0000-4000-8000-000000000002');", "storage-contender")
        wait_for("select exists(select 1 from pg_stat_activity where application_name='storage-contender' and wait_event_type='Lock')")
        _, stderr = holder.communicate(timeout=15)
        if holder.returncode == 0 or "40001" not in stderr or "40P01" in stderr:
            raise AssertionError("Parent-first trigger failed to break the gate/parent lock cycle")
        _, stderr = contender.communicate(timeout=15)
        if contender.returncode:
            raise AssertionError(stderr)
        print("PASS: parent-first/gate-first race aborts safely and contender progresses")
        # Document guards must hold the same gate for both document kinds.
        for table in ("invitations", "digital_albums"):
            document = '{"theme":"test","pages":[{"type":"gallery","layout":"grid","photos":[],"unplacedPhotos":[{"photoId":"00000000-0000-4000-8000-000000000200"}]}]}'
            holder = start(f"begin; update public.{table} set document='{document}'::jsonb; select pg_sleep(5); commit;", "storage-document-holder")
            wait_for("select exists(select 1 from pg_stat_activity where application_name='storage-document-holder' and wait_event='PgSleep')")
            busy = sql("select public.storage_request_cleanup('00000000-0000-4000-8000-000000000200');")
            if busy.returncode == 0 or "40001" not in busy.stderr:
                raise AssertionError("Document write did not own the storage gate")
            _, stderr = holder.communicate(timeout=10)
            if holder.returncode:
                raise AssertionError(stderr)
            print(f"PASS: {table} document save versus cleanup gate")
        # Concurrent metadata edit and attempted parent move on the same tuple.
        result = sql("insert into public.invitations(id,project_id) values ('00000000-0000-4000-8000-000000000007','00000000-0000-4000-8000-000000000001');")
        if result.returncode:
            raise AssertionError(result.stderr)
        holder = start("begin; update public.invitation_photos set description='safe' where photo_id='00000000-0000-4000-8000-000000000200'; select pg_sleep(5); commit;", "storage-association-holder")
        wait_for("select exists(select 1 from pg_stat_activity where application_name='storage-association-holder' and wait_event='PgSleep')")
        contender = start("update public.invitation_photos set invitation_id='00000000-0000-4000-8000-000000000007' where photo_id='00000000-0000-4000-8000-000000000200';", "storage-contender")
        wait_for("select exists(select 1 from pg_stat_activity where application_name='storage-contender' and wait_event_type='Lock')")
        holder.communicate(timeout=10)
        _, stderr = contender.communicate(timeout=10)
        if holder.returncode or contender.returncode == 0 or "22023" not in stderr:
            raise AssertionError("Concurrent parent move was accepted")
        print("PASS: concurrent association parent move rejected")
        result = sql("delete from public.project_photos where id='00000000-0000-4000-8000-000000000006'; delete from private.storage_legacy_review where photo_id='00000000-0000-4000-8000-000000000006'; select public.storage_reserve_upload('00000000-0000-4000-8000-000000000400','invitation','00000000-0000-4000-8000-000000000003',null,'00000000-0000-4000-8000-000000000002'); select public.storage_finalize_upload('00000000-0000-4000-8000-000000000400',10,null); delete from public.invitation_photos where photo_id='00000000-0000-4000-8000-000000000400'; select public.storage_claim_cleanup(3);")
        if result.returncode:
            raise AssertionError(result.stderr)
        reverse_setup = sql("select public.storage_reserve_upload('00000000-0000-4000-8000-000000000350','invitation','00000000-0000-4000-8000-000000000003',null,'00000000-0000-4000-8000-000000000002'); select public.storage_finalize_upload('00000000-0000-4000-8000-000000000350',10,null);")
        if reverse_setup.returncode:
            raise AssertionError(reverse_setup.stderr)
        holder = start("begin; delete from public.invitation_photos where photo_id='00000000-0000-4000-8000-000000000350'; select pg_sleep(5); commit;", "storage-unlink-holder")
        wait_for("select exists(select 1 from pg_stat_activity where application_name='storage-unlink-holder' and wait_event='PgSleep')")
        blocked_document = '{"theme":"test","pages":[{"type":"gallery","layout":"grid","photos":[],"unplacedPhotos":[{"photoId":"00000000-0000-4000-8000-000000000350"}]}]}'
        contender = start(f"update public.invitations set document='{blocked_document}'::jsonb where id='00000000-0000-4000-8000-000000000003';", "storage-contender")
        wait_for("select exists(select 1 from pg_stat_activity where application_name='storage-contender' and wait_event_type='Lock')")
        holder.communicate(timeout=10)
        _, stderr = contender.communicate(timeout=10)
        if holder.returncode or contender.returncode == 0 or "22023" not in stderr:
            raise AssertionError("Document save accepted an object deleted by concurrent unlink")
        print("PASS: unlink wins; concurrent retained document reference is rejected")
        token = sql("select lease_token from private.storage_cleanup_jobs where object_id='00000000-0000-4000-8000-000000000400';").stdout.strip()
        # Completion waits on a job row; expiry must be checked AFTER that wait.
        holder = start("begin; update private.storage_cleanup_jobs set lease_until=clock_timestamp()+interval '1 second' where object_id='00000000-0000-4000-8000-000000000400'; select pg_sleep(5); commit;", "storage-lease-holder")
        wait_for("select exists(select 1 from pg_stat_activity where application_name='storage-lease-holder' and wait_event='PgSleep')")
        contender = start(f"select public.storage_finish_cleanup('00000000-0000-4000-8000-000000000400','{token}',true);", "storage-contender")
        wait_for("select exists(select 1 from pg_stat_activity where application_name='storage-contender' and wait_event_type='Lock')")
        holder.communicate(timeout=10)
        _, stderr = contender.communicate(timeout=10)
        if holder.returncode or contender.returncode == 0 or "22023" not in stderr:
            raise AssertionError("Lease expired during row-lock wait but completion succeeded")
        print("PASS: completion rejects lease expiry during lock wait")
        result = sql("update private.storage_cleanup_jobs set lease_until=clock_timestamp()+interval '1 hour' where object_id='00000000-0000-4000-8000-000000000400';")
        if result.returncode:
            raise AssertionError(result.stderr)
        holder = start("begin; update private.storage_objects set state='quarantined' where id='00000000-0000-4000-8000-000000000400'; select pg_sleep(5); commit;", "storage-quarantine-holder")
        wait_for("select exists(select 1 from pg_stat_activity where application_name='storage-quarantine-holder' and wait_event='PgSleep')")
        contender = start(f"select public.storage_finish_cleanup('00000000-0000-4000-8000-000000000400','{token}',true);", "storage-contender")
        wait_for("select exists(select 1 from pg_stat_activity where application_name='storage-contender' and wait_event_type='Lock')")
        holder.communicate(timeout=10)
        _, stderr = contender.communicate(timeout=10)
        state = sql("select state from private.storage_objects where id='00000000-0000-4000-8000-000000000400';")
        if holder.returncode or contender.returncode == 0 or "22023" not in stderr or state.stdout.strip() != "quarantined":
            raise AssertionError("Late completion overwrote quarantine")
        print("PASS: quarantine wins over concurrent late completion")
        print(f"PASS: isolated PostgreSQL checks; retained logs: {directory}")
        return 0
    finally:
        for child in children:
            if child.poll() is None:
                child.terminate()
                child.communicate(timeout=5)
        if started:
            subprocess.run([tools["pg_ctl"], "-D", str(data), "-m", "fast", "-w", "stop"], env=env, capture_output=True, timeout=20, check=True)
        # Retain synthetic cluster/logs for inspection; never delete existing dirs.


if __name__ == "__main__":
    raise SystemExit(main())
