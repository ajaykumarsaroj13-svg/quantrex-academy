import requests
import json
import os
from pymongo import MongoClient
import re

print("Loading cookies...")
with open(r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\test_cookies.json", "r") as f:
    cookies = json.load(f)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "eg-app-id": "room-examgoal-com",
    "eg-platform": "desktop",
    "Referer": "https://room.examgoal.com/",
    "accept": "application/json",
    "content-type": "application/json"
}

s = requests.Session()
for c in cookies:
    s.cookies.set(c["name"], c["value"])

BASE = "https://room.examgoal.com/api/v1"

# 1. Fetch subjects for JEE Main
print("Fetching subjects...")
r = s.get(f"{BASE}/metadata/subjects", params={"country": "in", "examGroup": "jee", "exam": "jee-main", "from": "pq"})
subjects = r.json().get("results", [])
math_subject = next((sub for sub in subjects if sub.get("name") == "Mathematics"), None)
if not math_subject:
    print("Could not find Mathematics subject.")
    exit(1)

# 2. Fetch chapters for Mathematics
print("Fetching chapters for Mathematics...")
r = s.get(f"{BASE}/metadata/chapters", params={
    "country": "in",
    "examGroup": "jee",
    "exam": "jee-main",
    "subject": math_subject["key"],
    "from": "pq"
})
chapters = r.json().get("results", [])

# Find Sequences and Series
target_chap = next((ch for ch in chapters if "Sequence" in ch.get("title", ch.get("name", "")) and "Series" in ch.get("title", ch.get("name", ""))), None)
if not target_chap:
    print("Could not find Sequences and Series chapter.")
    for ch in chapters:
        print(ch.get("title", ch.get("name", "")))
    exit(1)

chapter_id = target_chap["metaId"]
print(f"Found Target Chapter: {target_chap.get('title', target_chap.get('name', ''))} ({chapter_id})")

# 3. Fetch all questions for this chapter
print("Fetching questions...")
r = s.get(f"{BASE}/past-question/tests/by-chapter/{chapter_id}", params={
    "country": "in",
    "examGroup": "jee",
    "exam": "jee-main",
})

if r.status_code != 200:
    print(f"Error fetching questions: {r.status_code}")
    print(r.text)
    exit(1)

questions_data = r.json()
all_questions = []
if isinstance(questions_data, dict):
    for key in ("results", "questions", "data", "items"):
        if key in questions_data:
            all_questions = questions_data[key]
            break
elif isinstance(questions_data, list):
    all_questions = questions_data

print(f"Total downloaded questions: {len(all_questions)}")

# 4. Format and Insert to MongoDB
print("Formatting and connecting to MongoDB...")
client = MongoClient('mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0')
db = client['quantrex']
col = db['pyqs']

formatted_docs = []

# Using correct target schema (ch_mathematics_algebra_3)
target_chapter_id = "ch_mathematics_algebra_3"

for idx, q in enumerate(all_questions):
    q_id = q.get("questionId", q.get("id", q.get("_id", f"seq_{idx}")))
    
    # Process exam title to extract year and test name
    title = ""
    year = q.get("year", "")
    if "tests" in q and q["tests"]:
        test_info = q["tests"][0]
        title = test_info.get("name", f"JEE Main {year}")
        if not year:
            year_match = re.search(r'20\d\d', title)
            if year_match:
                year = year_match.group(0)
    
    if not year:
        year = "2024" # Fallback
        
    topic = q.get("topic", "General")
    if not topic:
        topic = "General"
        
    difficulty = q.get("difficultyLevel", "Medium")
    if difficulty.lower() == "e": difficulty = "Easy"
    if difficulty.lower() == "m": difficulty = "Medium"
    if difficulty.lower() == "h": difficulty = "Hard"
    
    options = q.get("options", [])
    correct_option = q.get("correctOption", "")
    
    # Determine correct option index
    correct_idx = 0
    if correct_option == "A": correct_idx = 0
    elif correct_option == "B": correct_idx = 1
    elif correct_option == "C": correct_idx = 2
    elif correct_option == "D": correct_idx = 3
    elif correct_option and correct_option.isdigit():
        correct_idx = int(correct_option) - 1
        
    doc = {
        "question_id": str(q_id),
        "chapterId": target_chapter_id,
        "title": title,
        "year": str(year),
        "difficulty": difficulty.capitalize(),
        "type": "SCQ" if len(options) > 0 else "NUM",
        "question": q.get("questionText", ""),
        "options": options,
        "correctOptionIndex": correct_idx,
        "solution": q.get("explanation", ""),
        "marks": 4,
        "negativeMarks": -1,
        "topic": topic
    }
    
    # Format options if they are dicts
    if options and isinstance(options[0], dict):
        doc["options"] = [opt.get("text", "") for opt in options]
        
    formatted_docs.append(doc)

# 5. Insert to DB
if formatted_docs:
    col.insert_many(formatted_docs)
    print(f"Successfully inserted {len(formatted_docs)} REAL questions to MongoDB!")
else:
    print("No questions to insert.")
