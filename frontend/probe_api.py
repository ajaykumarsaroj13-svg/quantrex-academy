"""
COMPREHENSIVE API PROBE
1. Check subscription status
2. Fetch a real question (from bookmark endpoint)
3. Try all chapter-question list endpoints
4. Try creating a test via API and getting questions that way
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
# Use the freshest cookies from very_fresh_cookies.json
FRESH_COOKIES = {
    "SSID": "s%3ApQTLMAf9YwWyo3HoC1f9pQ3m63nQ0QtuyJDoqWZUi08Vsr7W5wcbGSKMPrRKSyhs7tJFWWf0fKc2mrA8WbDMhlmNS0C9GXj69gkRG34Eg3egLISANrDdWBJCqqWrNBMv.djrR2rKRg5mJePlLoxupF%2Bd4HQX%2Bu%2Ba0JdK6pUMoEmg",
    "eg-device-id": "s%3A3bb49b90-5e51-11f1-aca8-e9d769b4726d19g61mpwakjwp.Tl%2FuOwrutq86FBQboBKPIH5ZjFTIzbKb2PtIWynfzy4",
    "IR_UID": "iruid-40599u1mpwb0yia",
    "IR_SSID": "irsid-40599u1mpwb0yi9",
    "AWSALB": "Fjg7nBhjagt9LI/J6Txcl2nFSIIeHm3nQ+Qyw018MpQ3CUHIZjYT83KWzYNBmgzj34w4x9rmaJtrcCO4lpcFn4w9k5K+sRWLFrgTfLommyFM07dpkE7E06WFqve+",
    "AWSALBCORS": "Fjg7nBhjagt9LI/J6Txcl2nFSIIeHm3nQ+Qyw018MpQ3CUHIZjYT83KWzYNBmgzj34w4x9rmaJtrcCO4lpcFn4w9k5K+sRWLFrgTfLommyFM07dpkE7E06WFqve+",
}
for k, v in FRESH_COOKIES.items():
    s.cookies.set(k, v)

def test(name, method, url, body=None, params=None):
    print(f"\n[{name}]")
    print(f"  {method} {url}")
    try:
        if method == "GET":
            r = s.get(url, headers=HEADERS, params=params, timeout=15)
        else:
            r = s.post(url, headers=HEADERS, json=body, timeout=15)
        print(f"  Status: {r.status_code}")
        text = r.text
        if len(text) > 600:
            print(f"  Response: {text[:600]}...")
        else:
            print(f"  Response: {text}")
        return r
    except Exception as e:
        print(f"  Error: {e}")
        return None

# ── 1. Check subscription
test("Subscription Status", "GET", "https://room.examgoal.com/api/v2/subscription/subscription")

# ── 2. Fetch known bookmarked question - get its structure!
test("Bookmark Question", "GET", f"{BASE}/past-question/user/bookmark/question/af885e8a-f342-47c2-85e4-26fe4b7a7272")

# ── 3. Get all bookmarks
test("Bookmark Group", "GET", f"{BASE}/past-question/user/bookmark/group")

# ── 4. Try personalized test endpoint (appears on every page)
test("Personalized Test", "GET", f"{BASE}/past-question/tests/personalized/test")

# ── 5. Try to create a chapter test via API to get question IDs
chapter_id = "564d8d85-c7ad-52a8-8a62-2b498822051f"  # Units & Measurements
test("Create Chapter Test POST", "POST", f"{BASE}/past-question/tests/create", body={
    "chapterIds": [chapter_id],
    "examGroup": "jee",
    "exam": "jee-main",
    "subject": "physics",
    "limit": 20,
    "mode": "practice"
})

# ── 6. Try test-id-series endpoint (was visible in original network capture)
test("Test ID Series", "GET", f"{BASE}/test/test-id-series/pyq-in-jee-jee-main?exists=true")

# ── 7. Try past-question list endpoints with different patterns
test("PQ by chapter key", "GET", f"{BASE}/past-question", params={
    "chapterKey": "units-and-measurements",
    "examGroup": "jee",
    "exam": "jee-main",
    "limit": 5
})

test("PQ v2 chapters", "GET", "https://room.examgoal.com/api/v2/past-question/chapters", params={
    "examGroup": "jee", "exam": "jee-main", "subject": "physics"
})

test("PQ v2 questions", "GET", "https://room.examgoal.com/api/v2/past-question/questions", params={
    "chapterId": chapter_id, "limit": 5
})

# ── 8. Try the test-series endpoint that was in original capture
test("Test series by chapter", "GET", f"{BASE}/test/series/{chapter_id}", params={
    "examGroup": "jee", "exam": "jee-main"
})

# ── 9. Try chapter stats with fetch=papers param (from earlier capture)
physics_id = "99673506-f2c4-59c3-b166-d9543244d505"
test("Subject stats with papers", "GET", f"{BASE}/past-question/user/statistics/{physics_id}",
     params={"fetch": "papers"})

# ── 10. See if there's a chapter-specific list endpoint
test("Chapter questions list", "GET", f"{BASE}/past-question/chapter-questions/{chapter_id}",
     params={"examGroup": "jee", "exam": "jee-main", "page": 1, "limit": 5})

print("\n\nDone!")
