import os
import json
import glob
import re

SCRAPED_DIR = r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\backend\data\scraped_questions"
PUBLIC_DATA_DIR = r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\frontend\public\data"
QUESTIONS_DIR = os.path.join(PUBLIC_DATA_DIR, "questions")

os.makedirs(QUESTIONS_DIR, exist_ok=True)

all_questions = []
chapters_map = {}

def get_correct_option_index(correct_options, options_list):
    if not correct_options or not options_list:
        return 0
    ans = correct_options[0]
    for i, opt in enumerate(options_list):
        if opt.get("identifier") == ans:
            return i
    # Fallback to mapping A->0, B->1 etc if possible
    if ans == 'A': return 0
    if ans == 'B': return 1
    if ans == 'C': return 2
    if ans == 'D': return 3
    return 0

for file_path in glob.glob(os.path.join(SCRAPED_DIR, "**", "*.json"), recursive=True):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        continue
    
    if not isinstance(data, list):
        data = [data]
        
    for item in data:
        results = item.get("results", [])
        if not isinstance(results, list): results = [results]
        
        q_list = []
        for r in results:
            if isinstance(r, dict) and "questions" in r:
                q_list.extend(r["questions"])
            elif isinstance(r, dict) and "question_id" in r:
                q_list.append(r)
        
        # also handle if 'questions' is directly in item
        if "questions" in item and isinstance(item["questions"], list):
            q_list.extend(item["questions"])
        elif "question_id" in item:
            q_list.append(item)
            
        for q in q_list:
            if not isinstance(q, dict) or "question" not in q:
                continue
                
            q_en = q.get("question", {}).get("en", {})
            if not q_en:
                continue
                
            # Parse basic fields
            subject = q.get("subject", "unknown").lower()
            if "math" in subject: subject = "mathematics"
            elif "phys" in subject: subject = "physics"
            elif "chem" in subject: subject = "chemistry"
                
            chapter = q.get("chapter", "general")
            if not chapter: chapter = "general"
            
            exam = q.get("exam", "JEE Main").upper()
            if "ADV" in exam:
                exam = "JEE Advanced"
            elif "JEE-MAIN" in exam or "JEEMAIN" in exam or "JEE" in exam:
                exam = "JEE Main"
            elif "NDA" in exam:
                exam = "NDA"
            elif "BITSAT" in exam:
                exam = "BITSAT"
            
            q_type = "SCQ"
            if q.get("type") == "numerical":
                q_type = "NUMERICAL"
                
            options = []
            if "options" in q_en:
                options = [opt.get("content", "") for opt in q_en["options"]]
                
            correct_idx = get_correct_option_index(q_en.get("correct_options", []), q_en.get("options", []))
            
            marks = q.get("marks", 4)
            neg_marks = q.get("negMarks", 1)
            # Ensure neg_marks is negative for frontend expectation
            if neg_marks > 0:
                neg_marks = -neg_marks
            
            formatted_q = {
                "id": q.get("question_id", ""),
                "chapterId": chapter,
                "exam": exam,
                "title": q.get("paperTitle", ""),
                "year": str(q.get("year", "")),
                "difficulty": q.get("difficulty", "Medium") or "Medium",
                "type": q_type,
                "question": q_en.get("content", ""),
                "options": options,
                "correctOptionIndex": correct_idx,
                "solution": q_en.get("explanation", ""),
                "marks": marks,
                "negativeMarks": neg_marks,
                "topic": q.get("topic", "General") or "General"
            }
            
            # Map chapter
            if chapter not in chapters_map:
                # generate a nice name
                nice_name = chapter.replace("-", " ").title()
                chapters_map[chapter] = {
                    "id": chapter,
                    "name": nice_name,
                    "subject": subject,
                    "exams": set(),
                    "count": 0,
                    "weightage": "5%"
                }
            
            chapters_map[chapter]["count"] += 1
            chapters_map[chapter]["exams"].add(exam)
            
            # Save to global array for later file grouping
            all_questions.append((chapter, formatted_q))

# Group questions by chapter
questions_by_chapter = {}
for ch, q in all_questions:
    if ch not in questions_by_chapter:
        questions_by_chapter[ch] = []
    questions_by_chapter[ch].append(q)

# Write chapter files
print(f"Writing {len(questions_by_chapter)} chapter files...")
for ch, qs in questions_by_chapter.items():
    file_path = os.path.join(QUESTIONS_DIR, f"{ch}.json")
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(qs, f, ensure_ascii=False)

# Write chapters.json
# Group chapters by subject as expected by frontend
chapters_grouped = { "mathematics": [], "physics": [], "chemistry": [], "other": [] }
for ch_obj in chapters_map.values():
    subj = ch_obj["subject"]
    ch_obj["exams"] = list(ch_obj["exams"]) # Convert set to list for JSON serialization
    if subj in chapters_grouped:
        chapters_grouped[subj].append(ch_obj)
    else:
        chapters_grouped["other"].append(ch_obj)

with open(os.path.join(PUBLIC_DATA_DIR, "chapters.json"), "w", encoding="utf-8") as f:
    json.dump(chapters_grouped, f, ensure_ascii=False)

print(f"Successfully processed {len(all_questions)} questions into {len(questions_by_chapter)} chapters.")
