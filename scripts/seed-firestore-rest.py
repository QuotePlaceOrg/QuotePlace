#!/usr/bin/env python3
"""Seed Firestore via REST API using the registered Firebase API key.

Use this when you do NOT have a service-account key. It needs Firestore
rules temporarily set to test mode in Firebase console:

    allow read, write: if true;

After seeding, publish the real rules from firestore.rules.

Usage: python3 scripts/seed-firestore-rest.py [--dry-run]
Reads scripts/seed-data.json. Writes authors/topics/quotes/blogs.
Never logs the credential URL.
"""
import json
import sys
import urllib.request
import urllib.error
from pathlib import Path

sys.path.insert(0, "/opt/muse/skills/custom-connector-setup/bin")
from dynamic_credentials import url_with_surrogate_query_param

ALLOWED_HOSTS = ["firestore.googleapis.com"]
CREDENTIAL = "custom.firebase"
PROJECT = "stoicbare-86bfa"


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args):
        raise RuntimeError("redirect refused")


def encode(v):
    if v is None:
        return {"nullValue": None}
    if isinstance(v, bool):
        return {"booleanValue": v}
    if isinstance(v, int):
        return {"integerValue": str(v)}
    if isinstance(v, float):
        return {"doubleValue": v}
    if isinstance(v, str):
        return {"stringValue": v}
    if isinstance(v, list):
        return {"arrayValue": {"values": [encode(x) for x in v]}}
    if isinstance(v, dict):
        return {"mapValue": {"fields": {k: encode(x) for k, x in v.items()}}}
    raise TypeError(f"cannot encode {type(v)}")


def write_doc(collection: str, doc_id: str, fields: dict, dry_run: bool) -> dict:
    # Firestore REST: PATCH .../documents/{collection}/{id}?updateMask.fieldPaths=...
    # Without updateMask, PATCH replaces the doc — fine for seeding.
    base = (
        f"https://firestore.googleapis.com/v1/projects/{PROJECT}"
        f"/databases/(default)/documents/{collection}/{doc_id}"
    )
    body = json.dumps({"fields": {k: encode(v) for k, v in fields.items()}}).encode()
    if dry_run:
        return {"dry_run": True, "collection": collection, "id": doc_id}
    url = url_with_surrogate_query_param(base, CREDENTIAL, allowed_hosts=ALLOWED_HOSTS)
    req = urllib.request.Request(url, data=body, method="PATCH")
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json")
    try:
        with urllib.request.build_opener(NoRedirect()).open(req, timeout=30) as resp:
            return {"http_status": resp.status, "collection": collection, "id": doc_id}
    except urllib.error.HTTPError as e:
        try:
            data = json.loads(e.read().decode())
        except Exception:
            data = {"raw": str(e)}
        return {"http_status": e.code, "collection": collection, "id": doc_id, "error": data}


def main() -> int:
    dry_run = "--dry-run" in sys.argv
    seed_path = Path(__file__).parent / "seed-data.json"
    seed = json.loads(seed_path.read_text())
    total = 0
    failed = []
    for collection in ("authors", "topics", "quotes", "blogs"):
        for doc in seed[collection]:
            doc_id = doc["id"]
            fields = {k: v for k, v in doc.items() if k != "id"}
            # publishedAt is a plain number in seed JSON; keep as integer ms.
            res = write_doc(collection, doc_id, fields, dry_run)
            total += 1
            if res.get("http_status") not in (None, 200):
                failed.append(res)
                print(f"FAIL {collection}/{doc_id}: {res.get('http_status')} {json.dumps(res.get('error', {}))[:300]}")
            elif total % 20 == 0 or dry_run:
                print(f"ok {collection}/{doc_id} (dry_run={dry_run})")
    print(f"Done: {total} docs attempted, {len(failed)} failed, dry_run={dry_run}")
    if failed:
        print("Most likely cause: Firestore rules still block unauthenticated writes.")
        print("In Firebase console → Firestore → Rules, temporarily set: allow read, write: if true;")
        print("Then re-run, then publish firestore.rules.")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
