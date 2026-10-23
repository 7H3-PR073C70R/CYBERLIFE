import json
import tempfile
import unittest
from pathlib import Path
from core.manager import AssetManager, safe_id

class ManagerTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name) / "game"
        self.root.mkdir()
        (self.root / "src").mkdir()
        (self.root / "src" / "main.js").write_text("const model = '/assets/missing.glb';", encoding="utf-8")
        self.manager = AssetManager(self.root)

    def tearDown(self):
        self.tmp.cleanup()

    def test_safe_id(self):
        self.assertEqual(safe_id("../a b"), "a_b")

    def test_audit_detects_possible_missing_reference(self):
        result = self.manager.audit()
        self.assertEqual(result["files_scanned"] >= 1, True)
        self.assertEqual(result["possible_missing_references"], 1)

    def test_manifest_persists(self):
        self.manager.audit()
        loaded = json.loads(self.manager.manifest_path.read_text(encoding="utf-8"))
        self.assertIn("audit_runs", loaded)
        self.assertIn("requirements", loaded)

    def test_delete_requires_confirmation_and_quarantine(self):
        c_id = "polyhaven-models-example"
        folder = self.manager.review / "models" / c_id
        folder.mkdir(parents=True)
        asset = folder / "example.glb"
        asset.write_bytes(b"glTF" + b"\0" * 8)
        self.manager.manifest["candidates"][c_id] = {
            "id": c_id, "name": "example", "category": "models", "status": "downloaded",
            "files": [{"path": asset.relative_to(self.manager.review).as_posix()}]
        }
        self.manager._save()
        self.manager.quarantine(c_id)
        with self.assertRaises(ValueError):
            self.manager.delete(c_id, confirmed=False)
        result = self.manager.delete(c_id, confirmed=True)
        self.assertEqual(result["status"], "rejected")

if __name__ == "__main__":
    unittest.main()
