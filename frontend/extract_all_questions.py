#!/usr/bin/env python
"""
Extract all questions from ExamGoal for the requested exams.
- Discovers series keys via metadata endpoints.
- Uses fresh login cookies and Authorization token.
- Saves each series' questions to <project>/data/<series>.json.
"""
import json, os, time, sys
import requests

BASE = "https://room.examgoal.com/api/v1"
# Load cookies
COOKIE_PATH = os.path.join(os.path.dirname(__file__), "..", "test_cookies.json")
if not os.path.exists(COOKIE_PATH):
    print(f"Cookie file not found: {COOKIE_PATH}")
    sys.exit(1)
with open(COOKIE_PATH, "r") as f:
    cookies = json.load(f)
# Load token if present
TOKEN_PATH = os.path.join(os.path.dirname(__file__), "..", "token.txt")
auth_header = {}
if os.path.exists(TOKEN_PATH):
    with open(TOKEN_PATH, "r") as f:
        token = f.read().strip()
    if token:
        auth_header = {"Authorization": token}

session = requests.Session()
# basic headers
HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "eg-app-id": "room-examgoal-com",
    "eg-platform": "desktop",
    "Referer": "https://room.examgoal.com/",
    "accept": "application/json, text/plain, */*",
}
session.headers.update({**HEADERS, **auth_header})
for ck in cookies:
    session.cookies.set(ck.get('name'), ck.get('value'), domain=ck.get('domain'), path=ck.get('path'))

# Helper to get series keys via metadata
def list_series(exam_group):
    url = f"{BASE}/metadata/exams?country=in&examGroup={exam_group}"
    r = session.get(url, timeout=15)
    if r.status_code != 200:
        return []
    try:
        data = r.json()
    except Exception:
        return []
    # Expect list of exam objects with a 'code' or 'id'
    keys = []
    if isinstance(data, list):
        for item in data:
            # Some responses use 'code', fallback to 'id'
            key = item.get('code') or item.get('id')
            if key:
                keys.append(key)
    return keys

# Define groups we care about
GROUPS = {
    "jee": ["jee-main", "jee-advanced"],
    "nda": ["nda"],
    "class-11": ["class-11"],
    "class-12": ["class-12"],
}

# Collect all series keys to try
KNOWN_SERIES = []
for group, subkeys in GROUPS.items():
    meta_keys = list_series(group)
    for mk in meta_keys:
        # keep only those that contain any of the subkeys (case‑insensitive)
        if any(sk in mk.lower() for sk in subkeys):
            KNOWN_SERIES.append(mk)

# Fallback: add some manual guesses
KNOWN_SERIES.extend([
    "pyq-in-jee-jee-main",
    "pyq-in-jee-jee-advanced",
    "pyq-in-nda",
    "class-11-ncert",
    "class-12-ncert",
])

output_dir = os.path.join(os.path.dirname(__file__), "..", "data")
os.makedirs(output_dir, exist_ok=True)

all_results = {}
for series in KNOWN_SERIES:
    print(f"Processing series: {series}")
    # fetch test ids for the series
    test_ids = []
    url = f"{BASE}/test/test-id-series/{series}"
    r = session.get(url, timeout=15)
    if r.status_code == 200:
        data = r.json()
        if isinstance(data, dict) and data.get("testIds"):
            test_ids = data["testIds"]
        elif isinstance(data, list):
            test_ids = data
    if not test_ids:
        print(f"  No tests found for {series}")
        continue
    series_questions = []
    for tid in test_ids:
        # fetch question ids
        qids = []
        for ep in [f"/test/{tid}", f"/past-question/tests/personalized/test/{tid}"]:
            r = session.get(f"{BASE}{ep}", timeout=15)
            if r.status_code != 200:
                continue
            try:
                data = r.json()
            except Exception:
                continue
            for field in ["questionIds", "questionIds_v1", "questionIds_v2", "questionIdsNew", "questionIdsNew_v2"]:
                if isinstance(data, dict) and field in data:
                    qids.extend(data[field])
                elif isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict) and field in item:
                            qids.extend(item[field])
        qids = list(set(qids))
        for qid in qids:
            r = session.get(f"{BASE}/past-question/question/{qid}", timeout=15)
            if r.status_code == 200:
                try:
                    qdata = r.json()
                    if qdata:
                        series_questions.append(qdata)
                except Exception:
                    pass
        time.sleep(0.2)
    if series_questions:
        out_path = os.path.join(output_dir, f"{series}_questions.json")
        with open(out_path, "w", encoding="utf-8") as fout:
            json.dump(series_questions, fout, ensure_ascii=False, indent=2)
        all_results[series] = out_path
        print(f"  Saved {len(series_questions)} questions to {out_path}")
    else:
        print(f"  No questions extracted for {series}")

print("Extraction complete. Files written:")
for s, p in all_results.items():
    print(f"  {s}: {p}")
