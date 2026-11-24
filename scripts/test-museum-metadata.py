"""Offline tests for the exact museum API identity and license gate."""
import importlib.util
import unittest
from pathlib import Path

path = Path(__file__).with_name("import-museum-images.py")
spec = importlib.util.spec_from_file_location("museum_importer", path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class MetadataTests(unittest.TestCase):
    def setUp(self):
        self.record = {"objectId": 40197, "accession": "1989.363.27"}
        self.meta = {"objectID": 40197, "accessionNumber": "1989.363.27", "isPublicDomain": True}

    def test_documented_met_fields(self):
        module.verify_metadata(self.record, self.meta)

    def test_reject_wrong_object(self):
        with self.assertRaises(ValueError):
            module.verify_metadata(self.record, dict(self.meta, objectID=1))

    def test_reject_wrong_accession(self):
        with self.assertRaises(ValueError):
            module.verify_metadata(self.record, dict(self.meta, accessionNumber="incorrect"))

    def test_reject_absent_accession(self):
        self.meta.pop("accessionNumber")
        with self.assertRaises(ValueError):
            module.verify_metadata(self.record, self.meta)

    def test_reject_non_public_domain(self):
        with self.assertRaises(ValueError):
            module.verify_metadata(self.record, dict(self.meta, isPublicDomain=False))

    def test_reject_missing_public_domain(self):
        self.meta.pop("isPublicDomain")
        with self.assertRaises(ValueError):
            module.verify_metadata(self.record, self.meta)

if __name__ == "__main__":
    unittest.main()
