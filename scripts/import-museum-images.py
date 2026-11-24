#!/usr/bin/env python3
"""Import the reviewed Met Open Access collection records as local WebP files.
Requires Python 3 and Pillow; no network access is needed during site builds.
Existing cached files are never overwritten unless --refresh is passed.
"""
import argparse
import hashlib
import io
import json
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urlparse
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
records = json.loads((root / "app/data/museum-images.json").read_text())
cache_path = root / "app/data/museum-local.json"
cache = json.loads(cache_path.read_text())
parser = argparse.ArgumentParser()
parser.add_argument("--refresh", action="store_true")
parser.add_argument("--id", action="append", help="Import only selected registered asset IDs; repeat as needed.")
args = parser.parse_args()
errors = []
known = {r['id'] for r in records}
if args.id and set(args.id) - known:
    parser.error('Unknown image IDs: ' + ', '.join(set(args.id) - known))
def fetch(url, limit):
    req = Request(url, headers={"User-Agent": "cross-sea-history educational asset import/1.0"})
    with urlopen(req, timeout=30) as response:
        if urlparse(response.geturl()).scheme != "https" or not urlparse(response.geturl()).hostname.endswith(".metmuseum.org"):
            raise ValueError("unexpected redirect")
        data = response.read(limit + 1)
        if len(data) > limit:
            raise ValueError("download exceeds limit")
        return data

for record in records:
    rid = record["id"]
    if args.id and rid not in args.id:
        continue
    dest = root / "public" / record["localFile"].lstrip("/")
    try:
        if not args.refresh and rid in cache and dest.is_file():
            if hashlib.sha256(dest.read_bytes()).hexdigest() == cache[rid]["sha256"]:
                continue
        if urlparse(record["originalFileURL"]).hostname != "collectionapi.metmuseum.org":
            raise ValueError("unexpected image host")
        meta = json.loads(fetch(f'https://collectionapi.metmuseum.org/public/collection/v1/objects/{record["objectId"]}', 2_000_000))
        if meta.get("isPublicDomain") is not True or meta.get("objectID") != record["objectId"] or meta.get("objectNumber") != record["accession"]:
            raise ValueError("public-domain or accession check failed")
        # Use the exact inspected view; do not silently substitute the object API primary image.
        with Image.open(io.BytesIO(fetch(record["originalFileURL"], 30_000_000))) as source:
            image = ImageOps.exif_transpose(source).convert("RGB")
        image.thumbnail((1800, 1800), Image.Resampling.LANCZOS)
        out = io.BytesIO()
        image.save(out, "WEBP", quality=85, method=6)
        data = out.getvalue()
        dest.parent.mkdir(parents=True, exist_ok=True)
        tmp = dest.with_suffix(".tmp")
        tmp.write_bytes(data)
        tmp.replace(dest)
        cache[rid] = {"src": record["localFile"], "width": image.width, "height": image.height, "sha256": hashlib.sha256(data).hexdigest()}
        print("Imported", rid)
    except Exception as exc:
        errors.append(rid)
        print("Skipped", rid, exc)
tmp = cache_path.with_suffix(".tmp")
tmp.write_text(json.dumps(cache, ensure_ascii=False, indent=2) + "\n")
tmp.replace(cache_path)
if errors:
    raise SystemExit("Some images could not be imported: " + ", ".join(errors))
