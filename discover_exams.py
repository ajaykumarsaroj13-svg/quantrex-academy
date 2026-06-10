"""
Discover all ExamGoal exam groups and exam slugs
"""
import json
import requests

session = requests.Session()
session.cookies.set("AWSALB", "QSUl1MbR7+mikXDy62xbmCeox/tW04rVW7VP5BcciQUU9iwSlv5qrOtkL/UbeioOFw5Kn6xC0K6jsBIWiVFBrXIT1Hul3uCNZ9Z3NPXpj5qKKrzD2LdeNSiJyg7n", domain="room.examgoal.com")
session.cookies.set("AWSALBCORS", "QSUl1MbR7+mikXDy62xbmCeox/tW04rVW7VP5BcciQUU9iwSlv5qrOtkL/UbeioOFw5Kn6xC0K6jsBIWiVFBrXIT1Hul3uCNZ9Z3NPXpj5qKKrzD2LdeNSiJyg7n", domain="room.examgoal.com")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "eg-app-id": "room-examgoal-com",
    "eg-platform": "desktop",
    "Referer": "https://room.examgoal.com/"
}

BASE = "https://room.examgoal.com/api/v1"

# All possible exam group + exam combos to try
EXAM_COMBOS = [
    # JEE
    ("jee", "jee-main"),
    ("jee", "jee-advanced"),
    # BITSAT
    ("engineering", "bitsat"),
    ("bitsat", "bitsat"),
    # NDA
    ("defence", "nda"),
    ("nda", "nda"),
    # NCERT
    ("ncert", "ncert-class-11"),
    ("ncert", "ncert-class-12"),
    ("school", "ncert-class-11"),
    ("school", "ncert-class-12"),
    ("class-11", "ncert-class-11"),
    ("class-12", "ncert-class-12"),
    # IAT/IISER
    ("iiser", "iat"),
    ("iat", "iat"),
]

print("Discovering exam slugs...")
working = []
for examGroup, exam in EXAM_COMBOS:
    url = f"{BASE}/metadata/subjects?country=in&examGroup={examGroup}&exam={exam}&from=pq"
    r = session.get(url, headers=HEADERS, timeout=10)
    try:
        data = r.json()
        results = data.get("results", [])
        count = len(results)
        if count > 0:
            names = [s.get("title", s.get("name", "?")) for s in results]
            print(f"  [OK] examGroup={examGroup}, exam={exam}: {count} subjects: {names}")
            working.append({"examGroup": examGroup, "exam": exam, "subjects": results})
        else:
            print(f"  [--] examGroup={examGroup}, exam={exam}: empty")
    except:
        print(f"  [ERR] examGroup={examGroup}, exam={exam}: error {r.status_code}")

print(f"\n{len(working)} working combinations found!")

# Save working combos
out = r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\examgoal_exams.json"
with open(out, "w") as f:
    json.dump(working, f, indent=2)
print(f"Saved to {out}")

# Now get chapters for each working subject
print("\n\nGetting chapters for each working subject...")
all_chapters = {}
for combo in working:
    for subject in combo["subjects"]:
        meta_id = subject["metaId"]
        exam = combo["exam"]
        subject_name = subject.get("title", "?")
        url = f"{BASE}/past-question/user/statistics/{meta_id}"
        r = session.get(url, headers=HEADERS, timeout=10)
        if r.status_code == 200:
            data = r.json()
            print(f"  {exam}/{subject_name}: {json.dumps(data)[:300]}")
            all_chapters[f"{exam}_{subject_name}"] = data
        else:
            print(f"  {exam}/{subject_name}: status {r.status_code}: {r.text[:100]}")

out2 = r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\examgoal_chapters.json"
with open(out2, "w") as f:
    json.dump(all_chapters, f, indent=2)
print(f"\nChapters saved to {out2}")
