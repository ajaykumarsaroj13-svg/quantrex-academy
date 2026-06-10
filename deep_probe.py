"""
FINAL DATA EXTRACTION
- Fetch a real personalized test to see question structure
- Fetch chapters for each subject and get their tests
- Find the chapter question list API
"""
import requests
import json

BASE = "https://room.examgoal.com/api/v1"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "eg-app-id": "room-examgoal-com",
    "eg-platform": "desktop",
    "Referer": "https://room.examgoal.com/",
    "accept": "application/json",
    "content-type": "application/json",
}

s = requests.Session()
for k, v in {
    "SSID": "s%3ApQTLMAf9YwWyo3HoC1f9pQ3m63nQ0QtuyJDoqWZUi08Vsr7W5wcbGSKMPrRKSyhs7tJFWWf0fKc2mrA8WbDMhlmNS0C9GXj69gkRG34Eg3egLISANrDdWBJCqqWrNBMv.djrR2rKRg5mJePlLoxupF%2Bd4HQX%2Bu%2Ba0JdK6pUMoEmg",
    "eg-device-id": "s%3A3bb49b90-5e51-11f1-aca8-e9d769b4726d19g61mpwakjwp.Tl%2FuOwrutq86FBQboBKPIH5ZjFTIzbKb2PtIWynfzy4",
    "IR_UID": "iruid-40599u1mpwb0yia",
    "IR_SSID": "irsid-40599u1mpwb0yi9",
    "AWSALB": "Fjg7nBhjagt9LI/J6Txcl2nFSIIeHm3nQ+Qyw018MpQ3CUHIZjYT83KWzYNBmgzj34w4x9rmaJtrcCO4lpcFn4w9k5K+sRWLFrgTfLommyFM07dpkE7E06WFqve+",
    "AWSALBCORS": "Fjg7nBhjagt9LI/J6Txcl2nFSIIeHm3nQ+Qyw018MpQ3CUHIZjYT83KWzYNBmgzj34w4x9rmaJtrcCO4lpcFn4w9k5K+sRWLFrgTfLommyFM07dpkE7E06WFqve+",
}.items():
    s.cookies.set(k, v)

print("=" * 60)

# 1. Fetch a known personalized test - get its full structure
test_id = "mpttbpj4u67109rbgym"  # "NDA Sequence and Series"
print(f"\n[1] Fetching personalized test: {test_id}")
r = s.get(f"{BASE}/past-question/tests/personalized/test/{test_id}", headers=HEADERS)
print(f"Status: {r.status_code}")
print(f"Response: {r.text[:800]}")

# 2. Try other test fetch patterns
print(f"\n[2] Test questions by test ID...")
r2 = s.get(f"{BASE}/past-question/tests/{test_id}", headers=HEADERS)
print(f"Status: {r2.status_code}")
print(f"Response: {r2.text[:800]}")

# 3. Try starting the test to get questions
print(f"\n[3] Start test (get questions)...")
r3 = s.get(f"{BASE}/past-question/tests/{test_id}/questions", headers=HEADERS)
print(f"Status: {r3.status_code}")
print(f"Response: {r3.text[:800]}")

# 4. Get chapter test list for units-and-measurements
chapter_id = "564d8d85-c7ad-52a8-8a62-2b498822051f"  # Units & Measurements
print(f"\n[4] Chapter tests for Units & Measurements...")
r4 = s.get(f"{BASE}/past-question/tests", headers=HEADERS, params={
    "chapterId": chapter_id,
    "examGroup": "jee",
    "exam": "jee-main"
})
print(f"Status: {r4.status_code}")
print(f"Response: {r4.text[:800]}")

# 5. Try the test-id-series endpoint variations
print(f"\n[5] Test ID series variations...")
for series_key in ["pyq-in-jee-jee-main", "jee-main-physics-units-and-measurements", f"pyq-chapter-{chapter_id}"]:
    r5 = s.get(f"{BASE}/test/test-id-series/{series_key}", headers=HEADERS)
    print(f"  {series_key}: {r5.status_code} - {r5.text[:100]}")

# 6. Try chapter-level test endpoint
print(f"\n[6] Chapter test creation...")
r6 = s.post(f"{BASE}/past-question/tests", headers=HEADERS, json={
    "chapterId": chapter_id,
    "examGroup": "jee",
    "exam": "jee-main",
    "type": "chapter",
    "limit": 10
})
print(f"Status: {r6.status_code}")
print(f"Response: {r6.text[:400]}")

# 7. Try the correct test endpoint used in the JEE chapter (the stats shows test IDs as chapter keys)
# From stats: {"1e0f32e4-342a-52ad-9e7a-ee26e94eaac8": {"totalQuestions": 155}} <- this is a chapter!
real_chapter_id = "1e0f32e4-342a-52ad-9e7a-ee26e94eaac8"  # From stats response
print(f"\n[7] Testing real chapter ID from statistics: {real_chapter_id}")
r7a = s.get(f"{BASE}/past-question/tests/{real_chapter_id}/questions", headers=HEADERS)
print(f"  /tests/{real_chapter_id}/questions: {r7a.status_code} - {r7a.text[:200]}")

r7b = s.get(f"{BASE}/past-question/chapter/{real_chapter_id}", headers=HEADERS)
print(f"  /chapter/{real_chapter_id}: {r7b.status_code} - {r7b.text[:200]}")

r7c = s.get(f"{BASE}/past-question/items", headers=HEADERS, params={"chapter": real_chapter_id, "limit": 3})
print(f"  /items?chapter={real_chapter_id}: {r7c.status_code} - {r7c.text[:200]}")

# 8. Try fetching a chapter's questions by posting the chapter ID
print(f"\n[8] POST to get chapter questions...")
r8 = s.post(f"{BASE}/past-question/questions/list", headers=HEADERS, json={
    "chapterId": chapter_id,
    "examGroup": "jee",
    "exam": "jee-main"
})
print(f"Status: {r8.status_code} - {r8.text[:300]}")

# 9. Try the metadata/multi/by-id endpoint to batch-fetch chapters
print(f"\n[9] Batch fetch chapters by ID...")
r9 = s.post(f"{BASE}/metadata/multi/by-id", headers=HEADERS, json={
    "ids": [chapter_id, real_chapter_id]
})
print(f"Status: {r9.status_code} - {r9.text[:500]}")

# 10. Now try fetching question directly by known question IDs
q_id = "ldoa27ax"  # From bookmark list
print(f"\n[10] Fetch individual question {q_id}...")
r10a = s.get(f"{BASE}/past-question/question/{q_id}", headers=HEADERS)
print(f"  /question/{q_id}: {r10a.status_code} - {r10a.text[:400]}")

r10b = s.get(f"{BASE}/past-question/{q_id}", headers=HEADERS)
print(f"  /past-question/{q_id}: {r10b.status_code} - {r10b.text[:400]}")

# 11. Try the test-id-series to get chapter test IDs
print(f"\n[11] Test ID series for chapter...")
r11 = s.get(f"{BASE}/test/test-id-series/pyq-chapter-{chapter_id}", headers=HEADERS)
print(f"Status: {r11.status_code} - {r11.text[:300]}")

print("\n\nSaving all responses...")
