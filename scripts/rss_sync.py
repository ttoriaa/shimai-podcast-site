#!/usr/bin/env python3
"""Incremental RSS sync without Node.js.

Behavior:
- Uses If-None-Match / If-Modified-Since when state exists.
- On 304: exits as not changed.
- On 200: hashes content; compares with previous hash.
- Runs update command only when RSS changed.
- Validates required output paths.
- Writes .cache/rss_state.json.
- Optional commit/push.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import pathlib
import subprocess
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone


def to_bool(value: str | None, default: bool = False) -> bool:
    if value is None or value == "":
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def load_json(path: pathlib.Path, fallback: dict) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return fallback


def ensure_parent(path: pathlib.Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def has_files_recursively(directory: pathlib.Path) -> bool:
    for p in directory.rglob("*"):
        if p.is_file():
            return True
    return False


def validate_required_path(path_like: str) -> None:
    p = pathlib.Path(path_like).resolve()
    if not p.exists():
        raise RuntimeError(f"Required path not found: {path_like}")
    if p.is_file() and p.stat().st_size <= 0:
        raise RuntimeError(f"Required file is empty: {path_like}")
    if p.is_dir() and not has_files_recursively(p):
        raise RuntimeError(f"Required directory has no files: {path_like}")


def append_github_output(key: str, value: str) -> None:
    output_file = os.environ.get("GITHUB_OUTPUT")
    if not output_file:
        return
    with open(output_file, "a", encoding="utf-8") as f:
        f.write(f"{key}={value}\n")


def run_shell(command: str) -> None:
    subprocess.run(command, shell=True, check=True)


def main() -> int:
    parser = argparse.ArgumentParser(description="Incremental RSS sync script (Python)")
    parser.add_argument("--rss-url", default=os.environ.get("RSS_URL", ""))
    parser.add_argument("--update-command", default=os.environ.get("UPDATE_COMMAND", ""))
    parser.add_argument("--state-file", default=os.environ.get("STATE_FILE", ".cache/rss_state.json"))
    parser.add_argument("--changed-paths", default=os.environ.get("CHANGED_PATHS", "public/data"))
    parser.add_argument("--dry-run", default=os.environ.get("DRY_RUN", "false"))
    parser.add_argument("--auto-commit", default=os.environ.get("AUTO_COMMIT", "false"))
    parser.add_argument("--auto-push", default=os.environ.get("AUTO_PUSH", "false"))
    args = parser.parse_args()

    rss_url = (args.rss_url or "").strip()
    if not rss_url:
        print("Missing RSS URL. Pass --rss-url or RSS_URL.", file=sys.stderr)
        append_github_output("changed", "false")
        return 1

    dry_run = to_bool(args.dry_run, False)
    auto_commit = to_bool(args.auto_commit, False)
    auto_push = to_bool(args.auto_push, False)

    state_path = pathlib.Path(args.state_file).resolve()
    prev = load_json(state_path, {})

    req = urllib.request.Request(rss_url, method="GET")
    if prev.get("etag"):
        req.add_header("If-None-Match", str(prev["etag"]))
    if prev.get("last_modified"):
        req.add_header("If-Modified-Since", str(prev["last_modified"]))

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            status = resp.getcode() or 200
            body_bytes = resp.read()
            etag = resp.headers.get("ETag", "")
            last_modified = resp.headers.get("Last-Modified", "")
    except urllib.error.HTTPError as e:
        if e.code == 304:
            print("RSS not changed (304).")
            append_github_output("changed", "false")
            append_github_output("http_status", "304")
            print("RSS check result: not_changed")
            print("HTTP status: 304")
            print(f"Executed update command: {args.update_command or '(none)'}")
            print("Commit status: skipped")
            print("Push status: skipped")
            return 0
        print(f"RSS request failed: HTTP {e.code}", file=sys.stderr)
        append_github_output("changed", "false")
        append_github_output("http_status", str(e.code))
        print("RSS check result: failed")
        print(f"HTTP status: {e.code}")
        print("Next action when failed: check RSS URL/network/auth and retry")
        return 1
    except Exception as e:
        print(f"RSS request failed: {e}", file=sys.stderr)
        append_github_output("changed", "false")
        print("RSS check result: failed")
        print("HTTP status: n/a")
        print("Next action when failed: check RSS URL/network and retry")
        return 1

    content_sha256 = hashlib.sha256(body_bytes).hexdigest()

    if prev.get("content_sha256") and prev.get("content_sha256") == content_sha256:
        print("RSS not changed (same content hash).")
        ensure_parent(state_path)
        state_path.write_text(
            json.dumps(
                {
                    "rss_url": rss_url,
                    "etag": etag or prev.get("etag", ""),
                    "last_modified": last_modified or prev.get("last_modified", ""),
                    "content_sha256": content_sha256,
                    "checked_at": datetime.now(timezone.utc).isoformat(),
                },
                ensure_ascii=False,
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )
        append_github_output("changed", "false")
        append_github_output("http_status", str(status))
        print("RSS check result: not_changed")
        print(f"HTTP status: {status}")
        print(f"Executed update command: {args.update_command or '(none)'}")
        print("Changed files summary: state file refreshed")
        print("Commit status: skipped")
        print("Push status: skipped")
        return 0

    print("RSS changed, executing update command.")
    update_command = (args.update_command or "").strip()

    if update_command:
        if dry_run:
            print(f"[dry-run] Skip command: {update_command}")
        else:
            try:
                run_shell(update_command)
            except subprocess.CalledProcessError as e:
                append_github_output("changed", "false")
                append_github_output("http_status", str(status))
                print("RSS check result: failed")
                print(f"HTTP status: {status}")
                print(f"Executed update command: {update_command}")
                print("Commit status: skipped")
                print("Push status: skipped")
                print(f"Next action when failed: fix update command (exit={e.returncode}) and retry")
                return 1

    changed_paths = [p.strip() for p in (args.changed_paths or "").split(",") if p.strip()]
    if not dry_run:
        try:
            for p in changed_paths:
                validate_required_path(p)
        except Exception as e:
            append_github_output("changed", "false")
            append_github_output("http_status", str(status))
            print("RSS check result: failed")
            print(f"HTTP status: {status}")
            print(f"Executed update command: {update_command or '(none)'}")
            print(f"Commit status: skipped")
            print(f"Push status: skipped")
            print(f"Next action when failed: fix output paths ({e})")
            return 1

    ensure_parent(state_path)
    state_path.write_text(
        json.dumps(
            {
                "rss_url": rss_url,
                "etag": etag,
                "last_modified": last_modified,
                "content_sha256": content_sha256,
                "checked_at": datetime.now(timezone.utc).isoformat(),
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    commit_status = "skipped"
    push_status = "skipped"

    if auto_commit and not dry_run:
        add_targets = " ".join(changed_paths + [str(pathlib.Path(args.state_file))])
        try:
            run_shell(f"git add {add_targets}")
            res = subprocess.run(
                'git commit -m "chore: sync podcast data from RSS"',
                shell=True,
                check=False,
                capture_output=True,
                text=True,
            )
            if res.returncode == 0:
                commit_status = "success"
            elif "nothing to commit" in (res.stdout + res.stderr).lower():
                commit_status = "skipped"
            else:
                commit_status = "failed"
        except Exception:
            commit_status = "failed"

        if auto_push and commit_status == "success":
            res = subprocess.run("git push", shell=True, check=False)
            push_status = "success" if res.returncode == 0 else "failed"

    append_github_output("changed", "true")
    append_github_output("http_status", str(status))

    print("RSS check result: changed")
    print(f"HTTP status: {status}")
    print(f"Executed update command: {update_command or '(none)'}")
    print("Changed files summary: " + (", ".join(changed_paths + [args.state_file]) if changed_paths else args.state_file))
    print(f"Commit status: {commit_status}")
    print(f"Push status: {push_status}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
