#!/usr/bin/env python3
"""CLI for auditing a Three.js game and staging approved assets safely."""
from __future__ import annotations
import argparse, json, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))

from core.manager import AssetManager

def build_parser():
    p = argparse.ArgumentParser(description="Audit a game and stage licensed 3D assets for review.")
    p.add_argument("--project-root", default=str(ROOT), help="Game repository root (default: repository root)")
    p.add_argument("--review-dir", default=None, help="Review/staging directory (default: <project-root>/asset_review)")
    p.add_argument("--config", default=None, help="Optional JSON config file")
    sub = p.add_subparsers(dest="command", required=True)
    sub.add_parser("audit", help="Scan project assets and report likely gaps")
    d = sub.add_parser("discover", help="Discover and rank Poly Haven candidates from audit findings")
    d.add_argument("--query", action="append", help="Optional search term; can be repeated")
    dl = sub.add_parser("download", help="Download candidates into review staging")
    dl.add_argument("--dry-run", action="store_true", help="Show planned downloads without downloading")
    dl.add_argument("--approved", action="store_true", help="Download only candidates marked approved")
    dl.add_argument("--limit", type=int, default=10, help="Maximum candidate groups to download")
    r = sub.add_parser("review", help="List candidates and interactively approve/reject them")
    r.add_argument("--interactive", action="store_true", help="Prompt for each candidate")
    q = sub.add_parser("quarantine", help="Move a candidate group to quarantine")
    q.add_argument("candidate_id")
    rs = sub.add_parser("restore", help="Restore a quarantined candidate group")
    rs.add_argument("candidate_id")
    de = sub.add_parser("delete", help="Permanently delete a quarantined group (requires confirmation)")
    de.add_argument("candidate_id")
    de.add_argument("--yes", action="store_true", help="Confirm permanent deletion")
    sub.add_parser("report", help="Print a summary report")
    return p

def main(argv=None):
    args = build_parser().parse_args(argv)
    manager = AssetManager(args.project_root, args.review_dir, args.config)
    try:
        if args.command == "audit":
            result = manager.audit()
        elif args.command == "discover":
            result = manager.discover(args.query)
        elif args.command == "download":
            result = manager.download(dry_run=args.dry_run, approved_only=args.approved, limit=args.limit)
        elif args.command == "review":
            result = manager.review(interactive=args.interactive)
        elif args.command == "quarantine":
            result = manager.quarantine(args.candidate_id)
        elif args.command == "restore":
            result = manager.restore(args.candidate_id)
        elif args.command == "delete":
            result = manager.delete(args.candidate_id, confirmed=args.yes)
        else:
            result = manager.report()
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return 0
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

if __name__ == "__main__":
    raise SystemExit(main())
