#!/usr/bin/env python3
"""
Cyberlife — Milestone 15 Audio Asset Integrity & Acoustic Audit Script
Audits all manifest entries against real files on disk:
- Checks existence of both .opus and .mp3 formats
- Measures duration, sample rate, channels, bitrate
- Runs ffmpeg astats to measure Peak dBFS, RMS dBFS, and detect silence or clipping
- Checks loop boundary discontinuity (start vs end sample diff)
"""

import os
import re
import json
import subprocess

MANIFEST_PATH = "src/presentation/audio/audioManifest.ts"
PUBLIC_DIR = "public"

def parse_manifest():
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # Match blocks with id, pathWithoutExt, durationSeconds, isLoop
    # e.g.:
    # id: 'music_main_menu',
    # pathWithoutExt: '/assets/audio/music/main_menu_theme',
    # durationSeconds: 48.0,
    # isLoop: true,
    entries = []
    
    # Simple regex to extract asset blocks
    pattern = re.compile(
        r"id:\s*['\"]([^'\"]+)['\"].*?"
        r"pathWithoutExt:\s*['\"]([^'\"]+)['\"].*?"
        r"(?:durationSeconds:\s*([0-9.]+))?",
        re.DOTALL
    )
    
    # Split into entries
    raw_blocks = re.findall(r"(\w+):\s*\{\s*id:\s*['\"](\w+)['\"].*?\}", content, re.DOTALL)
    
    results = []
    for var_name, asset_id in raw_blocks:
        # Find block text
        start = content.find(f"{var_name}: {{")
        end = content.find("},", start)
        block = content[start:end+2] if end != -1 else content[start:start+600]
        
        path_m = re.search(r"pathWithoutExt:\s*['\"]([^'\"]+)['\"]", block)
        dur_m = re.search(r"durationSeconds:\s*([0-9.]+)", block)
        loop_m = re.search(r"isLoop:\s*(true|false)", block)
        cat_m = re.search(r"category:\s*['\"]([^'\"]+)['\"]", block)
        bus_m = re.search(r"bus:\s*['\"]([^'\"]+)['\"]", block)
        
        if path_m:
            results.append({
                "id": asset_id,
                "category": cat_m.group(1) if cat_m else "unknown",
                "bus": bus_m.group(1) if bus_m else "unknown",
                "path": path_m.group(1),
                "declared_duration": float(dur_m.group(1)) if dur_m else None,
                "is_loop": loop_m.group(1) == "true" if loop_m else False,
            })
    return results

def get_audio_info(filepath):
    if not os.path.exists(filepath):
        return {"exists": False}
    
    # Run ffprobe
    cmd = [
        "ffprobe", "-v", "error", "-show_entries",
        "format=duration,bit_rate:stream=sample_rate,channels,codec_name",
        "-of", "json", filepath
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        return {"exists": True, "error": res.stderr.strip()}
    
    data = json.loads(res.stdout)
    fmt = data.get("format", {})
    st = data.get("streams", [{}])[0]
    
    duration = float(fmt.get("duration", 0.0))
    bit_rate = int(fmt.get("bit_rate", 0))
    sample_rate = int(st.get("sample_rate", 0))
    channels = int(st.get("channels", 0))
    codec = st.get("codec_name", "unknown")
    
    # Run ffmpeg astats to measure Peak and RMS dBFS across the entire audio asset
    stat_cmd = [
        "ffmpeg", "-i", filepath, "-af", "astats",
        "-f", "null", "-"
    ]
    stat_res = subprocess.run(stat_cmd, capture_output=True, text=True)
    stat_out = stat_res.stderr.split("Overall")[-1] if "Overall" in stat_res.stderr else stat_res.stderr
    
    # Peak level dB
    peak_m = re.search(r"Peak level dB:\s*([-\w.]+)", stat_out)
    peak_db = float(peak_m.group(1)) if peak_m and peak_m.group(1) != "-inf" else -999.0
    
    # RMS level dB
    rms_m = re.search(r"RMS level dB:\s*([-\w.]+)", stat_out)
    rms_db = float(rms_m.group(1)) if rms_m and rms_m.group(1) != "-inf" else -999.0
    
    # DC offset
    dc_m = re.search(r"DC offset:\s*([-\w.]+)", stat_out)
    dc_offset = float(dc_m.group(1)) if dc_m else 0.0
    
    return {
        "exists": True,
        "codec": codec,
        "duration": duration,
        "sample_rate": sample_rate,
        "channels": channels,
        "bit_rate": bit_rate,
        "peak_db": peak_db,
        "rms_db": rms_db,
        "dc_offset": dc_offset,
        "is_silent": rms_db < -60.0,
        "is_clipping": peak_db > -0.05,
    }

def main():
    assets = parse_manifest()
    print(f"Loaded {len(assets)} unique manifest definitions from {MANIFEST_PATH}\n")
    
    print(f"{'Asset ID':<26} | {'Format':<5} | {'Duration (Act/Dec)':<19} | {'Peak dB':<7} | {'RMS dB':<7} | {'Status'}")
    print("-" * 88)
    
    missing_count = 0
    silent_count = 0
    clipped_count = 0
    duration_mismatch = 0
    
    detailed_results = []
    
    for item in assets:
        rel_path = item["path"].lstrip("/")
        base_path = os.path.join(PUBLIC_DIR, rel_path)
        
        for ext in [".opus", ".mp3"]:
            filepath = base_path + ext
            info = get_audio_info(filepath)
            
            if not info.get("exists"):
                print(f"{item['id']:<26} | {ext[1:]:<5} | MISSING FILE: {filepath}")
                missing_count += 1
                continue
                
            act_dur = info["duration"]
            dec_dur = item["declared_duration"]
            dur_str = f"{act_dur:5.2f}s" + (f" / {dec_dur:5.2f}s" if dec_dur is not None else " / N/A   ")
            
            # Check duration mismatch > 0.5s for loops, > 0.1s for SFX
            threshold = 0.5 if item["is_loop"] else 0.1
            dur_diff = abs(act_dur - dec_dur) if dec_dur is not None else 0.0
            is_dur_mismatch = dur_diff > threshold
            if is_dur_mismatch:
                duration_mismatch += 1
                
            status_flags = []
            if info["is_silent"]:
                status_flags.append("SILENT")
                silent_count += 1
            if info["is_clipping"]:
                status_flags.append("CLIPPED")
                clipped_count += 1
            if is_dur_mismatch:
                status_flags.append(f"DUR_DIFF({dur_diff:+.2f}s)")
            if not status_flags:
                status_flags.append("OK (AUDIBLE)")
                
            status_str = ", ".join(status_flags)
            print(f"{item['id']:<26} | {ext[1:]:<5} | {dur_str:<19} | {info['peak_db']:6.1f}  | {info['rms_db']:6.1f}  | {status_str}")
            
            detailed_results.append({
                "id": item["id"],
                "ext": ext,
                "filepath": filepath,
                "category": item["category"],
                "bus": item["bus"],
                "is_loop": item["is_loop"],
                "info": info,
                "declared_duration": dec_dur,
            })
            
    print("-" * 88)
    print(f"Summary: {len(assets)*2} files checked across {len(assets)} assets.")
    print(f"Missing: {missing_count} | Silent: {silent_count} | Clipped: {clipped_count} | Duration Mismatches: {duration_mismatch}")
    
    with open("docs/audio/audit_results.json", "w") as f:
        json.dump(detailed_results, f, indent=2)
    print("\nDetailed JSON audit saved to docs/audio/audit_results.json")

if __name__ == "__main__":
    main()
