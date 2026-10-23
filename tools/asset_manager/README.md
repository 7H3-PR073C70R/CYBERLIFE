# Game Asset Manager

A local Python CLI that audits a React + Three.js + Vite project and stages Poly Haven assets for manual review. It never automatically copies assets into `public/assets` or modifies gameplay source.

## Requirements

- Python 3.10+
- Internet access for `discover` and `download`
- No third-party Python packages required

## Quick start

From your game repository root, copy `tools/asset_manager/` into the repository, then run:

```bash
python tools/asset_manager/asset_manager.py --project-root . audit
python tools/asset_manager/asset_manager.py --project-root . discover
python tools/asset_manager/asset_manager.py --project-root . download --dry-run
python tools/asset_manager/asset_manager.py --project-root . review --interactive
python tools/asset_manager/asset_manager.py --project-root . download --approved
python tools/asset_manager/asset_manager.py --project-root . report
```

`discover` searches the Poly Haven public API. Review candidates before downloading:
the initial workflow is intentionally conservative. Mark a candidate approved with
`review --interactive`; `download --approved` downloads only approved candidates.
Use `download --dry-run` to inspect a plan.

## Commands

```text
audit
discover [--query TERM ...]
download [--dry-run] [--approved] [--limit N]
review [--interactive]
quarantine CANDIDATE_ID
restore CANDIDATE_ID
delete CANDIDATE_ID --yes
report
```

Global options must appear before the command:

- `--project-root PATH`: project to scan
- `--review-dir PATH`: staging folder; default is `<project-root>/asset_review`
- `--config PATH`: optional JSON configuration

Example with a separate review drive:

```bash
python tools/asset_manager/asset_manager.py --project-root . --review-dir ../asset_review discover
```

## Workflow

1. `audit` scans source and asset files, records file types, large files, asset references and possible missing references.
2. `discover` queries Poly Haven for models, textures and HDRIs and stores candidates in a JSON manifest.
3. `review --interactive` lets you approve/reject discovered candidates.
4. `download --approved` stages approved files under `asset_review/<category>/<candidate-id>/`.
5. Review the downloaded files and license metadata manually before integrating them into the game.
6. Rejected assets can be quarantined, restored, or permanently deleted after explicit confirmation.

## Data and safety

- The manifest is at `asset_review/manifests/manifest.json`.
- Audit reports are stored under `asset_review/reports/`.
- Downloads are staged separately from production assets.
- Quarantine is reversible; permanent deletion only accepts quarantined candidates and requires `--yes`.
- The downloader enforces HTTPS and a provider host allowlist, a per-file size cap, non-empty files and atomic `.part` downloads.
- No downloaded file is executed.
- API/network failures are reported and do not silently invent assets.
- Asset reference scanning is heuristic: dynamic paths, aliases, remote assets and runtime-generated geometry can produce false positives/negatives.
- License metadata is recorded as CC0 for Poly Haven candidates, but the tool's output is not legal advice; verify current terms and any asset-specific metadata before commercial use.

## Current limitations

- Poly Haven is the only implemented provider. ambientCG and Sketchfab are documented extension points, not working adapters.
- Candidate ranking uses text matching against provider metadata; it does not visually inspect models.
- Model downloads prefer one `.glb` file. Some assets may not expose a GLB or may require external dependencies.
- Texture selection is heuristic and should be checked manually.
- Static source scanning cannot infer runtime scene quality or decide whether an asset fits the story.
- `retries` is reserved in config but bounded retries are not yet applied to API calls.
