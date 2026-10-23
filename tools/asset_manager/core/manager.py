from __future__ import annotations
import hashlib, json, os, re, shutil, time
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

API = "https://api.polyhaven.com"
USER_AGENT = "GameAssetManager/1.0 (local development tool)"
IGNORED_DIRS = {".git", "node_modules", "dist", "build", ".next", ".vite", "__pycache__", ".venv", "venv"}

def safe_id(value: str) -> str:
    return re.sub(r"[^A-Za-z0-9_.-]+", "_", value).strip("._")[:120] or "asset"

def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

class AssetManager:
    def __init__(self, project_root, review_dir=None, config_path=None):
        self.project = Path(project_root).expanduser().resolve()
        if not self.project.is_dir():
            raise ValueError(f"Project root is not a directory: {self.project}")
        self.review_dir = Path(review_dir).expanduser().resolve() if review_dir else self.project / "asset_review"
        self.review_dir.mkdir(parents=True, exist_ok=True)
        self.config = {
            "providers": ["polyhaven"],
            "candidate_count": 5,
            "max_download_bytes": 250 * 1024 * 1024,
            "timeout_seconds": 25,
            "retries": 2,
            "max_concurrent_downloads": 3,
            "search_terms": ["realistic environment", "concrete", "asphalt", "vegetation", "urban props"],
            "asset_categories": ["models", "textures", "hdris"],
            "production_assets_dir": "public/assets",
        }
        if config_path:
            cfg = json.loads(Path(config_path).read_text(encoding="utf-8"))
            self.config.update(cfg)
        self.review_dir.mkdir(parents=True, exist_ok=True)
        for d in ("reports", "manifests", "models", "textures", "hdris", "references", "quarantine", "downloads"):
            (self.review_dir / d).mkdir(exist_ok=True)
        self.manifest_path = self.review_dir / "manifests" / "manifest.json"
        self.manifest = self._load_manifest()

    def _load_manifest(self):
        if self.manifest_path.exists():
            try:
                data = json.loads(self.manifest_path.read_text(encoding="utf-8"))
                if isinstance(data, dict) and isinstance(data.get("candidates"), dict):
                    data.setdefault("audit_runs", [])
                    data.setdefault("requirements", [])
                    return data
            except (json.JSONDecodeError, OSError):
                pass
        return {"schema_version": 1, "created_at": self._now(), "updated_at": self._now(),
                "audit_runs": [], "requirements": [], "candidates": {}}

    @staticmethod
    def _now():
        return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    def _save(self):
        self.manifest["updated_at"] = self._now()
        tmp = self.manifest_path.with_suffix(".json.tmp")
        tmp.write_text(json.dumps(self.manifest, indent=2, ensure_ascii=False), encoding="utf-8")
        tmp.replace(self.manifest_path)

    def _walk_files(self):
        for base, dirs, names in os.walk(self.project):
            dirs[:] = [d for d in dirs if d not in IGNORED_DIRS and (Path(base) / d).resolve() != self.review_dir]
            for name in names:
                p = Path(base) / name
                try:
                    if p.is_file():
                        yield p
                except OSError:
                    continue

    def audit(self):
        ext_counts, assets, source_refs, large_files = {}, [], [], []
        all_files = list(self._walk_files())
        source_extensions = {".js", ".jsx", ".ts", ".tsx", ".json", ".html", ".css"}
        for p in all_files:
            ext = p.suffix.lower() or "[no extension]"
            ext_counts[ext] = ext_counts.get(ext, 0) + 1
            rel = p.relative_to(self.project).as_posix()
            if ext in {".glb", ".gltf", ".obj", ".fbx", ".blend"}:
                assets.append({"path": rel, "kind": "model", "bytes": p.stat().st_size})
            elif ext in {".png", ".jpg", ".jpeg", ".webp", ".ktx2", ".hdr", ".exr"}:
                kind = "environment" if ext in {".hdr", ".exr"} else "texture"
                assets.append({"path": rel, "kind": kind, "bytes": p.stat().st_size})
            if p.stat().st_size > 100 * 1024 * 1024:
                large_files.append({"path": rel, "bytes": p.stat().st_size})
            if ext in source_extensions and p.stat().st_size <= 5 * 1024 * 1024:
                try:
                    content = p.read_text(encoding="utf-8", errors="ignore")
                    # Heuristic only: static text matching cannot prove runtime use.
                    for match in re.findall(r"""['"]([^'"]+\.(?:glb|gltf|png|jpe?g|webp|ktx2|hdr|exr))['"]""", content, re.I):
                        if "://" not in match and not match.startswith("data:"):
                            source_refs.append({"source": rel, "reference": match})
                except OSError:
                    pass
        known = {Path(a["path"]).as_posix() for a in assets}
        missing_refs = []
        for ref in source_refs:
            candidates = {ref["reference"], "public/" + ref["reference"].lstrip("/"), "src/" + ref["reference"].lstrip("/")}
            if not any((self.project / c).exists() for c in candidates):
                missing_refs.append(ref)
        model_count = sum(a["kind"] == "model" for a in assets)
        texture_count = sum(a["kind"] == "texture" for a in assets)
        env_count = sum(a["kind"] == "environment" for a in assets)
        findings = []
        if model_count == 0:
            findings.append({"priority": "high", "finding": "No common 3D model files found", "suggestion": "Check whether models are remote, generated procedurally, or stored in an ignored/custom location."})
        if texture_count == 0:
            findings.append({"priority": "medium", "finding": "No common texture files found", "suggestion": "Inspect material definitions and remote texture loading."})
        if env_count == 0:
            findings.append({"priority": "medium", "finding": "No HDR/EXR environment maps found", "suggestion": "Consider an HDRI if image-based lighting fits the current renderer."})
        if missing_refs:
            findings.append({"priority": "high", "finding": f"{len(missing_refs)} possible missing asset references", "suggestion": "Review the references manually; aliases and runtime-generated paths may be false positives."})
        run = {"id": f"audit-{int(time.time())}", "timestamp": self._now(), "files_scanned": len(all_files),
               "extension_counts": dict(sorted(ext_counts.items())), "assets": assets, "source_references": source_refs,
               "possible_missing_references": missing_refs, "large_files_over_100mb": large_files, "findings": findings}
        self.manifest["audit_runs"].append(run)
        self.manifest["requirements"] = self._build_requirements(run)
        (self.review_dir / "reports" / f"{run['id']}.json").write_text(json.dumps(run, indent=2), encoding="utf-8")
        self._save()
        return {"audit_id": run["id"], "files_scanned": len(all_files), "asset_counts": {
            "models": model_count, "textures": texture_count, "environment_maps": env_count},
            "possible_missing_references": len(missing_refs), "findings": findings,
            "report": f"reports/{run['id']}.json"}

    def _build_requirements(self, run):
        requirements = []
        if not run["assets"] or not any(a["kind"] == "model" for a in run["assets"]):
            requirements.append({"id": "need-models", "category": "models", "description": "Realistic 3D environment props compatible with a browser game", "priority": "high", "status": "needed"})
        if not any(a["kind"] == "texture" for a in run["assets"]):
            requirements.append({"id": "need-textures", "category": "textures", "description": "PBR textures for realistic terrain, roads, walls and props", "priority": "medium", "status": "needed"})
        if not any(a["kind"] == "environment" for a in run["assets"]):
            requirements.append({"id": "need-hdris", "category": "hdris", "description": "HDRI environment map for natural image-based lighting", "priority": "medium", "status": "needed"})
        return requirements

    def _request_json(self, url):
        parsed = urlparse(url)
        if parsed.scheme != "https" or parsed.hostname not in {"api.polyhaven.com", "polyhaven.com"}:
            raise ValueError(f"Refusing untrusted URL: {url}")
        req = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
        with urlopen(req, timeout=float(self.config["timeout_seconds"])) as response:
            raw = response.read(20 * 1024 * 1024 + 1)
        if len(raw) > 20 * 1024 * 1024:
            raise ValueError("API response exceeded 20 MB safety limit")
        return json.loads(raw.decode("utf-8"))

    def _polyhaven_search(self, category):
        # Public API list endpoints. Provider filters can vary; unsupported categories are skipped.
        type_map = {"models": "models", "textures": "textures", "hdris": "hdris"}
        url = f"{API}/assets?t={type_map[category]}"
        data = self._request_json(url)
        if not isinstance(data, dict):
            raise ValueError("Unexpected Poly Haven asset-list response")
        return data

    def discover(self, query_terms=None):
        terms = query_terms or self.config.get("search_terms", [])
        terms = [str(t).strip().lower() for t in terms if str(t).strip()]
        if not terms:
            terms = ["realistic environment"]
        candidates = self.manifest["candidates"]
        discovered = []
        for category in self.config.get("asset_categories", ["models", "textures", "hdris"]):
            try:
                assets = self._polyhaven_search(category)
            except Exception as exc:
                discovered.append({"category": category, "error": str(exc)})
                continue
            scored = []
            for asset_id, meta in assets.items():
                if not isinstance(meta, dict):
                    meta = {}
                name = str(meta.get("name", asset_id))
                haystack = f"{asset_id} {name} {meta.get('categories', '')}".lower()
                score = sum(1 for term in terms if term in haystack)
                # A broad candidate pool is retained even when no literal terms match.
                scored.append((score, asset_id, name, meta))
            scored.sort(key=lambda x: (-x[0], x[2].lower(), x[1]))
            count = int(self.config.get("candidate_count", 5))
            for score, asset_id, name, meta in scored[:count]:
                cid = f"polyhaven-{category}-{safe_id(asset_id)}"
                if cid in candidates:
                    candidate = candidates[cid]
                    candidate["score"] = score
                    candidate["last_discovered_at"] = self._now()
                else:
                    candidate = {
                        "id": cid, "provider": "polyhaven", "provider_id": asset_id, "category": category,
                        "name": name, "source_url": f"https://polyhaven.com/a/{asset_id}",
                        "license": "CC0", "license_url": "https://polyhaven.com/license",
                        "author": meta.get("作者") or meta.get("author"), "score": score,
                        "status": "discovered", "files": [], "created_at": self._now(),
                        "license_note": "Poly Haven assets are generally CC0; verify current provider terms and asset metadata."
                    }
                    candidates[cid] = candidate
                discovered.append({"id": cid, "name": name, "category": category, "score": score, "status": candidate["status"]})
        self._save()
        return {"discovered": [x for x in discovered if "error" not in x], "provider_errors": [x for x in discovered if "error" in x],
                "candidate_count": len(candidates), "manifest": "manifests/manifest.json"}

    def _file_tree(self, provider_id):
        return self._request_json(f"{API}/files/{provider_id}")

    def _flatten_file_tree(self, node, path=""):
        out = []
        if not isinstance(node, dict):
            return out
        for key, value in node.items():
            current = f"{path}/{key}".strip("/")
            if isinstance(value, dict) and isinstance(value.get("url"), str):
                out.append({"path": current, "url": value["url"], "bytes": value.get("size")})
            elif isinstance(value, dict):
                out.extend(self._flatten_file_tree(value, current))
        return out

    def _download_url(self, url, destination):
        parsed = urlparse(url)
        if parsed.scheme != "https" or parsed.hostname not in {"dl.polyhaven.org", "polyhaven.com", "api.polyhaven.com"}:
            raise ValueError(f"Refusing download from unapproved host: {parsed.hostname}")
        max_bytes = int(self.config["max_download_bytes"])
        req = Request(url, headers={"User-Agent": USER_AGENT})
        temp = destination.with_suffix(destination.suffix + ".part")
        try:
            with urlopen(req, timeout=float(self.config["timeout_seconds"])) as response, temp.open("wb") as out:
                length = response.headers.get("Content-Length")
                if length and int(length) > max_bytes:
                    raise ValueError(f"Download exceeds configured limit ({length} bytes)")
                total = 0
                while True:
                    chunk = response.read(1024 * 256)
                    if not chunk:
                        break
                    total += len(chunk)
                    if total > max_bytes:
                        raise ValueError("Download exceeded configured size limit")
                    out.write(chunk)
            if total == 0:
                raise ValueError("Downloaded file is empty")
            temp.replace(destination)
            return {"bytes": total, "sha256": sha256_file(destination)}
        finally:
            if temp.exists():
                temp.unlink()

    def download(self, dry_run=False, approved_only=False, limit=10):
        selected = [c for c in self.manifest["candidates"].values()
                    if c.get("status") not in {"rejected", "quarantined", "integrated", "failed"}]
        if approved_only:
            selected = [c for c in selected if c.get("status") == "approved"]
        selected = selected[:max(0, int(limit))]
        plan = []
        errors = []
        for candidate in selected:
            cid = candidate["id"]
            category = candidate.get("category", "models")
            if dry_run:
                plan.append({"id": cid, "name": candidate["name"], "category": category, "action": "would download"})
                continue
            try:
                tree = self._file_tree(candidate["provider_id"])
                flat = self._flatten_file_tree(tree)
                if not flat:
                    raise ValueError("Provider returned no downloadable files")
                # Prefer browser-friendly GLB, common texture formats, and a single practical resolution.
                filtered = self._select_files(flat, category)
                if not filtered:
                    raise ValueError("No suitable downloadable files in provider response")
                group_dir = self.review_dir / category / cid
                group_dir.mkdir(parents=True, exist_ok=True)
                saved = []
                for item in filtered:
                    filename = safe_id(Path(item["path"]).name)
                    dest = group_dir / filename
                    if dest.exists() and dest.stat().st_size > 0:
                        info = {"bytes": dest.stat().st_size, "sha256": sha256_file(dest), "skipped_existing": True}
                    else:
                        info = self._download_url(item["url"], dest)
                    saved.append({"path": dest.relative_to(self.review_dir).as_posix(), "source_path": item["path"], **info})
                candidate["files"] = saved
                candidate["status"] = "downloaded" if candidate.get("status") != "approved" else "approved"
                candidate["downloaded_at"] = self._now()
                candidate["validation"] = self._validate_group(group_dir, saved, category)
                if candidate["validation"]["valid"]:
                    candidate["status"] = "validated" if candidate["status"] != "approved" else "approved"
                else:
                    candidate["status"] = "review_required"
                plan.append({"id": cid, "files": len(saved), "status": candidate["status"], "validation": candidate["validation"]})
            except Exception as exc:
                candidate["last_error"] = str(exc)
                candidate["status"] = "failed"
                errors.append({"id": cid, "error": str(exc)})
        self._save()
        return {"dry_run": dry_run, "processed": plan, "errors": errors, "manifest": "manifests/manifest.json"}

    def _select_files(self, files, category):
        def score(item):
            path = item["path"].lower()
            ext = Path(path).suffix
            if category == "models":
                if ext == ".glb": return 100
                if ext == ".gltf": return 80
                return -100
            if category == "textures":
                # Keep the material's texture maps together at one sensible resolution.
                if any(x in path for x in ("/4k/", "_4k", "/2k/", "_2k")): return 100
                if ext in {".jpg", ".jpeg", ".png", ".webp", ".exr"}: return 30
                return -100
            if category == "hdris":
                if ext in {".exr", ".hdr"}: return 100
                return -100
            return -100
        ranked = sorted(files, key=lambda x: (-score(x), len(x["path"]), x["path"]))
        ranked = [f for f in ranked if score(f) >= 0]
        if category == "models":
            return ranked[:1]
        if category == "hdris":
            return ranked[:1]
        # Up to 8 maps, prefer a consistent 2K/4K set, avoid preview thumbnails.
        result = []
        seen = set()
        for f in ranked:
            name = Path(f["path"]).name.lower()
            if any(x in name for x in ("preview", "thumbnail", "sphere")):
                continue
            if name in seen:
                continue
            seen.add(name)
            result.append(f)
            if len(result) >= 8:
                break
        return result

    def _validate_group(self, directory, saved, category):
        issues = []
        if not saved:
            issues.append("No files downloaded")
        for item in saved:
            p = self.review_dir / item["path"]
            if not p.exists() or p.stat().st_size <= 0:
                issues.append(f"Missing or empty file: {item['path']}")
            elif p.suffix.lower() == ".gltf":
                try:
                    data = json.loads(p.read_text(encoding="utf-8"))
                    for buffer in data.get("buffers", []):
                        uri = buffer.get("uri", "")
                        if uri and not uri.startswith("data:") and not (p.parent / uri).exists():
                            issues.append(f"Missing glTF dependency: {uri}")
                except Exception:
                    issues.append(f"Invalid glTF JSON: {item['path']}")
            elif p.suffix.lower() == ".glb":
                with p.open("rb") as f:
                    header = f.read(12)
                if len(header) < 12 or header[:4] != b"glTF":
                    issues.append(f"Invalid GLB header: {item['path']}")
        return {"valid": not issues, "issues": issues, "category": category}

    def review(self, interactive=False):
        results = []
        for c in self.manifest["candidates"].values():
            row = {"id": c["id"], "name": c.get("name"), "category": c.get("category"),
                   "status": c.get("status"), "license": c.get("license"), "source_url": c.get("source_url"),
                   "files": len(c.get("files", []))}
            if interactive:
                print(f"\n{row['id']} | {row['name']} | {row['category']} | {row['status']}")
                print(f"Source: {row['source_url']} | License: {row['license']} | Files: {row['files']}")
                choice = input("[a]pprove, [r]eject, [s]kip? ").strip().lower()
                if choice == "a":
                    c["status"] = "approved"
                elif choice == "r":
                    c["status"] = "rejected"
                    row["status"] = "rejected"
                row["decision"] = choice or "skip"
            results.append(row)
        self._save()
        return {"candidates": results, "count": len(results)}

    def _candidate(self, candidate_id):
        if candidate_id not in self.manifest["candidates"]:
            raise KeyError(f"Unknown candidate id: {candidate_id}")
        return self.manifest["candidates"][candidate_id]

    def quarantine(self, candidate_id):
        c = self._candidate(candidate_id)
        moved = []
        for item in c.get("files", []):
            src = (self.review_dir / item["path"]).resolve()
            if not src.exists():
                continue
            if self.review_dir not in src.parents:
                raise ValueError("Refusing to move a file outside review root")
            dest = self.review_dir / "quarantine" / candidate_id / src.name
            dest.parent.mkdir(parents=True, exist_ok=True)
            if dest.exists():
                raise FileExistsError(f"Quarantine destination exists: {dest}")
            shutil.move(str(src), str(dest))
            item["quarantined_path"] = dest.relative_to(self.review_dir).as_posix()
            moved.append(item["quarantined_path"])
        c["status"] = "quarantined"
        c["quarantined_at"] = self._now()
        self._save()
        return {"id": candidate_id, "moved": moved, "status": c["status"]}

    def restore(self, candidate_id):
        c = self._candidate(candidate_id)
        restored = []
        for item in c.get("files", []):
            qpath = item.get("quarantined_path")
            if not qpath:
                continue
            src = (self.review_dir / qpath).resolve()
            original = (self.review_dir / item["path"]).resolve()
            if self.review_dir not in src.parents or self.review_dir not in original.parents:
                raise ValueError("Refusing path outside review root")
            if not src.exists():
                continue
            original.parent.mkdir(parents=True, exist_ok=True)
            if original.exists():
                raise FileExistsError(f"Restore would overwrite existing file: {original}")
            shutil.move(str(src), str(original))
            item.pop("quarantined_path", None)
            restored.append(item["path"])
        c["status"] = "review_required" if c.get("validation", {}).get("valid") is False else "downloaded"
        self._save()
        return {"id": candidate_id, "restored": restored, "status": c["status"]}

    def delete(self, candidate_id, confirmed=False):
        if not confirmed:
            raise ValueError("Permanent deletion requires --yes. Quarantine is safer.")
        c = self._candidate(candidate_id)
        if c.get("status") != "quarantined":
            raise ValueError("Only quarantined candidates can be permanently deleted")
        removed = []
        base = (self.review_dir / "quarantine" / candidate_id).resolve()
        if self.review_dir not in base.parents:
            raise ValueError("Refusing path outside review root")
        if base.exists():
            shutil.rmtree(base)
            removed.append(str(base.relative_to(self.review_dir)))
        for item in c.get("files", []):
            item.pop("quarantined_path", None)
        c["files"] = []
        c["status"] = "rejected"
        c["deleted_at"] = self._now()
        self._save()
        return {"id": candidate_id, "removed": removed, "status": c["status"]}

    def report(self):
        candidates = list(self.manifest["candidates"].values())
        statuses = {}
        for c in candidates:
            s = c.get("status", "unknown")
            statuses[s] = statuses.get(s, 0) + 1
        latest = self.manifest["audit_runs"][-1] if self.manifest["audit_runs"] else None
        return {"project_root": str(self.project), "review_dir": str(self.review_dir), "latest_audit": latest,
                "candidate_count": len(candidates), "candidate_statuses": statuses,
                "requirements": self.manifest.get("requirements", []), "manifest": str(self.manifest_path)}
