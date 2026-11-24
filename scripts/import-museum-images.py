#!/usr/bin/env python3
"""Localize reviewed Met Open Access images; --check works without Pillow/network."""
import argparse
import hashlib
import io
import json
import re
import sys
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
CACHE_PATH = ROOT / "app/data/museum-local.json"
RECORDS = json.loads((ROOT / "app/data/museum-images.json").read_text(encoding="utf-8"))
CACHE = json.loads(CACHE_PATH.read_text(encoding="utf-8"))
ID_PATTERN = re.compile(r"met-[a-z0-9-]+\Z")

def digest(data):
    return hashlib.sha256(data).hexdigest()

def relative_image(record):
    rid = record["id"]
    if not ID_PATTERN.fullmatch(rid) or record["localFile"] != f"/images/museum/{rid}.webp":
        raise ValueError(f"Unsafe image path for {rid}")
    return ROOT / "public" / record["localFile"].lstrip("/")

def cache_status(record):
    dest = relative_image(record)
    entry = CACHE.get(record["id"])
    if entry is None:
        return "unregistered-file" if dest.exists() else "missing"
    if not isinstance(entry, dict) or entry.get("src") != record["localFile"] or not isinstance(entry.get("width"), int) or not isinstance(entry.get("height"), int) or entry["width"] <= 0 or entry["height"] <= 0:
        return "invalid-record"
    if not dest.is_file():
        return "missing-file"
    return "valid" if digest(dest.read_bytes()) == entry.get("sha256") else "checksum-mismatch"

def write_cache():
    tmp = CACHE_PATH.with_suffix(".tmp")
    tmp.write_text(json.dumps(CACHE, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(CACHE_PATH)

def allowed_url(url):
    parsed = urlparse(url)
    host = parsed.hostname or ""
    return parsed.scheme == "https" and host.endswith(".metmuseum.org") and parsed.username is None and parsed.password is None

def fetch(url, limit):
    if not allowed_url(url):
        raise ValueError("Unexpected museum URL")
    for attempt in range(3):
        try:
            req = Request(url, headers={"User-Agent": "cross-sea-history educational asset import/1.0"})
            with urlopen(req, timeout=25) as response:
                if not allowed_url(response.geturl()):
                    raise ValueError("Unexpected redirect")
                data = response.read(limit + 1)
                if len(data) > limit:
                    raise ValueError("Download exceeds limit")
                return data
        except (HTTPError, URLError, TimeoutError) as exc:
            if isinstance(exc, HTTPError) and exc.code not in (408, 429, 500, 502, 503, 504):
                raise
            if attempt == 2:
                raise
            time.sleep(2 ** (attempt + 1))

def verify_metadata(record, meta):
    # Met API Object endpoint: https://metmuseum.github.io/#object
    # The artwork page calls it "Object Number"; the JSON field is accessionNumber.
    if meta.get("isPublicDomain") is not True or meta.get("objectID") != record["objectId"] or meta.get("accessionNumber") != record["accession"]:
        raise ValueError(
            "Public-domain or accession check failed: "
            f"API objectID={meta.get('objectID')!r} (expected {record['objectId']!r}), "
            f"accessionNumber={meta.get('accessionNumber')!r} (expected {record['accession']!r}), "
            f"isPublicDomain={meta.get('isPublicDomain')!r}; no image downloaded"
        )

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--refresh", action="store_true", help="Explicitly allow replacement of existing files")
    parser.add_argument("--id", action="append", help="Only selected registered IDs (repeatable)")
    parser.add_argument("--check", action="store_true", help="Offline report; nonzero exit for any missing or invalid image")
    args = parser.parse_args()
    known = {record["id"] for record in RECORDS}
    if len(known) != len(RECORDS):
        parser.error("Duplicate registered asset ID")
    if set(CACHE) - known:
        parser.error("Unknown cached image IDs: " + ", ".join(sorted(set(CACHE) - known)))
    if args.id and set(args.id) - known:
        parser.error("Unknown image IDs: " + ", ".join(sorted(set(args.id) - known)))
    selected = [record for record in RECORDS if not args.id or record["id"] in args.id]
    if args.check:
        statuses = [(record["id"], cache_status(record)) for record in selected]
        for rid, status in statuses:
            print(f"{rid}: {status}")
        valid = sum(status == "valid" for _, status in statuses)
        print(f"{valid}/{len(statuses)} local museum images verified")
        return 0 if valid == len(statuses) else 1
    # Pillow is optional for offline checking.
    try:
        from PIL import Image, ImageOps
    except ImportError:
        parser.error("Install Pillow with python -m pip install Pillow before importing")
    Image.MAX_IMAGE_PIXELS = 50_000_000
    errors = []
    for record in selected:
        rid = record["id"]
        try:
            dest = relative_image(record)
            status = cache_status(record)
            if status == "valid" and not args.refresh:
                print("Verified existing", rid)
                continue
            if dest.exists() and not args.refresh:
                raise ValueError(f"{status}; existing file preserved (use --refresh to replace)")
            if urlparse(record["originalFileURL"]).hostname != "collectionapi.metmuseum.org":
                raise ValueError("Unexpected source image host")
            meta_url = f'https://collectionapi.metmuseum.org/public/collection/v1/objects/{record["objectId"]}'
            meta = json.loads(fetch(meta_url, 2_000_000))
            verify_metadata(record, meta)
            # Preserve the exact reviewed view, never replace with a different primary image.
            with Image.open(io.BytesIO(fetch(record["originalFileURL"], 30_000_000))) as source:
                if source.width * source.height > Image.MAX_IMAGE_PIXELS:
                    raise ValueError("Image pixel count exceeds limit")
                image = ImageOps.exif_transpose(source).convert("RGB")
            image.thumbnail((1800, 1800), Image.Resampling.LANCZOS)
            out = io.BytesIO()
            image.save(out, "WEBP", quality=85, method=6)
            data = out.getvalue()
            dest.parent.mkdir(parents=True, exist_ok=True)
            tmp = dest.with_suffix(".tmp")
            tmp.write_bytes(data)
            tmp.replace(dest)
            CACHE[rid] = {"src": record["localFile"], "width": image.width, "height": image.height, "sha256": digest(data)}
            # Persist each success, so interruption does not lose earlier imports.
            write_cache()
            print("Imported", rid)
            time.sleep(0.3)
        except Exception as exc:
            errors.append(rid)
            print("Skipped", rid, exc, file=sys.stderr)
    if errors:
        print("Some images could not be imported: " + ", ".join(errors), file=sys.stderr)
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(main())
