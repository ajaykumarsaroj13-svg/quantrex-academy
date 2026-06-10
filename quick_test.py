import requests, json

s = requests.Session()
for k,v in {
    "SSID": "s%3ApQTLMAf9YwWyo3HoC1f9pQ3m63nQ0QtuyJDoqWZUi08Vsr7W5wcbGSKMPrRKSyhs7tJFWWf0fKc2mrA8WbDMhlmNS0C9GXj69gkRG34Eg3egLISANrDdWBJCqqWrNBMv.djrR2rKRg5mJePlLoxupF%2Bd4HQX%2Bu%2Ba0JdK6pUMoEmg",
    "AWSALB": "Fjg7nBhjagt9LI/J6Txcl2nFSIIeHm3nQ+Qyw018MpQ3CUHIZjYT83KWzYNBmgzj34w4x9rmaJtrcCO4lpcFn4w9k5K+sRWLFrgTfLommyFM07dpkE7E06WFqve+",
    "AWSALBCORS": "Fjg7nBhjagt9LI/J6Txcl2nFSIIeHm3nQ+Qyw018MpQ3CUHIZjYT83KWzYNBmgzj34w4x9rmaJtrcCO4lpcFn4w9k5K+sRWLFrgTfLommyFM07dpkE7E06WFqve+",
    "IR_UID": "iruid-40599u1mpwb0yia",
}.items():
    s.cookies.set(k, v)
H = {"User-Agent": "Mozilla/5.0", "eg-app-id": "room-examgoal-com", "eg-platform": "desktop", "Referer": "https://room.examgoal.com/", "accept": "application/json"}

BASE = "https://room.examgoal.com/api/v1"

# Get full series data
r = s.get(f"{BASE}/test/test-id-series/pyq-in-jee-jee-main", headers=H)
d = r.json()
results = d.get("results", [])
print(f"Groups: {len(results)}")
for g in results[:3]:
    gtitle = g.get("title", "?")
    tests = g.get("tests", [])
    print(f"\n  Group: {gtitle} ({len(tests)} tests)")
    for t in tests[:2]:
        print(f"    Test: {json.dumps(t)}")

# Fetch the first test
if results:
    first_test = results[0]["tests"][0]
    test_id = first_test.get("testId", first_test.get("id", ""))
    print(f"\n\nFetching test: {test_id}")
    
    # Try multiple endpoints
    for ep in [f"/past-question/tests/{test_id}", f"/test/{test_id}", f"/past-question/test/{test_id}"]:
        r2 = s.get(f"{BASE}{ep}", headers=H)
        print(f"  {ep}: {r2.status_code} - {r2.text[:300]}")
    
    # Try fetching the full test with question IDs
    r3 = s.get(f"{BASE}/past-question/tests/personalized/test/{test_id}", headers=H)
    print(f"\n  /personalized/test/{test_id}: {r3.status_code} - {r3.text[:300]}")
