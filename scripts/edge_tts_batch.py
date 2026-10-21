#!/usr/bin/env python3
"""
Cyberlife — Reusable Voice Synthesis Tool (edge-tts)

Supports:
1. Batch generation from JSON file or stdin:
     python3 scripts/edge_tts_batch.py batch.json
     python3 scripts/edge_tts_batch.py - < batch.json
2. Single-line synthesis:
     python3 scripts/edge_tts_batch.py --text "Hello Tade" --voice en-NG-EzinneNeural --out test.mp3
3. Inspect available voices:
     python3 scripts/edge_tts_batch.py --list-voices --lang en-NG
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
from typing import Optional, List, Dict, Any

try:
    import edge_tts
except ImportError:
    print(
        "[Error] The 'edge-tts' package is not installed.\n"
        "Install it via:\n"
        "    pip install edge-tts\n"
        "or run via uv:\n"
        "    uv run --with edge-tts python3 scripts/edge_tts_batch.py ...",
        file=sys.stderr,
    )
    sys.exit(1)


async def worker(queue: asyncio.Queue, total: int, done_box: list, force: bool = False):
    while not queue.empty():
        item = await queue.get()
        file_path = item["file"]

        # Ensure parent directory exists
        os.makedirs(os.path.dirname(os.path.abspath(file_path)), exist_ok=True)

        # Skip if already exists and non-empty unless force is specified
        if not force and os.path.exists(file_path) and os.path.getsize(file_path) > 0:
            done_box[0] += 1
            print(f"[{done_box[0]}/{total}] Cached: {item.get('id', file_path)}", flush=True)
            queue.task_done()
            continue

        try:
            comm = edge_tts.Communicate(
                item["text"],
                item["voice"],
                rate=item.get("rate", "+0%"),
                pitch=item.get("pitch", "+0Hz"),
            )
            await comm.save(file_path)
            done_box[0] += 1
            print(
                f"[{done_box[0]}/{total}] Rendered: {item.get('id', file_path)} ({item['voice']})",
                flush=True,
            )
        except Exception as e:
            print(f"FAILED {item.get('id', file_path)}: {e}", file=sys.stderr, flush=True)
        finally:
            queue.task_done()


async def run_batch(items: list, concurrency: int = 4, force: bool = False):
    total = len(items)
    if total == 0:
        print("No items in batch to render.")
        return

    queue: asyncio.Queue = asyncio.Queue()
    for item in items:
        queue.put_nowait(item)

    done_box = [0]
    workers = [
        asyncio.create_task(worker(queue, total, done_box, force=force))
        for _ in range(max(1, concurrency))
    ]
    await queue.join()
    for w in workers:
        w.cancel()


async def list_voices(lang_filter: str | None = None):
    voices = await edge_tts.list_voices()
    if lang_filter:
        voices = [
            v for v in voices
            if lang_filter.lower() in v.get("Locale", "").lower()
            or lang_filter.lower() in v.get("ShortName", "").lower()
        ]
    print(f"{'Short Name':<32} {'Gender':<8} {'Locale':<12} {'Friendly Name'}")
    print("-" * 80)
    for v in sorted(voices, key=lambda x: x.get("ShortName", "")):
        print(
            f"{v.get('ShortName', ''):<32} {v.get('Gender', ''):<8} {v.get('Locale', ''):<12} {v.get('FriendlyName', '')}"
        )


def parse_args():
    parser = argparse.ArgumentParser(
        description="Cyberlife Voice Synthesis Tool using Microsoft Edge online neural TTS."
    )
    parser.add_argument(
        "batch_file",
        nargs="?",
        default=None,
        help="Path to JSON file containing array of voice items (or '-' for stdin).",
    )
    parser.add_argument("--text", help="Single text string to synthesize.")
    parser.add_argument(
        "--voice",
        default="en-NG-EzinneNeural",
        help="Voice identifier (e.g. en-NG-EzinneNeural, en-NG-AbeoNeural, en-US-JennyNeural).",
    )
    parser.add_argument("--rate", default="+0%", help="Prosody rate modification (e.g. +3%, -5%).")
    parser.add_argument("--pitch", default="+0Hz", help="Prosody pitch modification (e.g. +2Hz, -4Hz).")
    parser.add_argument("--out", "-o", help="Output file path for single text synthesis.")
    parser.add_argument(
        "--concurrency",
        "-c",
        type=int,
        default=4,
        help="Number of concurrent workers for batch rendering (default: 4).",
    )
    parser.add_argument(
        "--force",
        "-f",
        action="store_true",
        help="Force regeneration even if output file already exists.",
    )
    parser.add_argument(
        "--list-voices",
        action="store_true",
        help="List available neural voices from Microsoft Edge TTS.",
    )
    parser.add_argument(
        "--lang",
        help="Optional language/locale filter when listing voices (e.g. 'en-NG', 'en-US').",
    )

    return parser.parse_args()


async def main():
    args = parse_args()

    if args.list_voices:
        await list_voices(args.lang)
        return

    # Single-line mode
    if args.text:
        out_path = args.out or "output.mp3"
        item = {
            "id": "cli_single",
            "file": out_path,
            "text": args.text,
            "voice": args.voice,
            "rate": args.rate,
            "pitch": args.pitch,
        }
        await run_batch([item], concurrency=1, force=args.force)
        return

    # Batch mode
    if args.batch_file:
        if args.batch_file == "-":
            content = sys.stdin.read()
        else:
            if not os.path.exists(args.batch_file):
                print(f"[Error] File not found: {args.batch_file}", file=sys.stderr)
                sys.exit(1)
            with open(args.batch_file, "r", encoding="utf-8") as f:
                content = f.read()

        try:
            items = json.load(content) if isinstance(content, dict) else json.loads(content)
            if not isinstance(items, list):
                print("[Error] Batch input must be a JSON array of items.", file=sys.stderr)
                sys.exit(1)
        except json.JSONDecodeError as err:
            print(f"[Error] Invalid JSON batch data: {err}", file=sys.stderr)
            sys.exit(1)

        await run_batch(items, concurrency=args.concurrency, force=args.force)
        return

    print("No input provided. Run with --help for usage details.", file=sys.stderr)
    sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
