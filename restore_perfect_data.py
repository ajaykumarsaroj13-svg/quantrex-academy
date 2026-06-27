import json
import os
import re

syllabus_content = open("src/utils/syllabusData.js", "r", encoding="utf-8").read()
mappings = {}
pattern = r'"id"\s*:\s*"([^"]+)",\s*"title"\s*:\s*"[^"]+",\s*"url"\s*:\s*"https://questions.examside.com/past-years/jee/[^/]+/mathematics/([^"]+)"'
for match in re.finditer(pattern, syllabus_content):
    chapter_id = match.group(1)
    chapter_slug = match.group(2)
    mappings[chapter_slug] = chapter_slug # Use slug as key

print(f"Extracted {len(mappings)} mappings from syllabusData.")

def format_question(q, target_chapter_id):
    q_id = q.get("question_id", "")
    
    q_data = q.get("question", {}).get("en", {})
    if not q_data:
        return None
        
    options = q_data.get("options", [])
    str_options = [opt.get("content", "") for opt in options]
    
    correct_options = q_data.get("correct_options", [])
    correct_idx = 0
    if correct_options:
        ans = correct_options[0]
        if ans == "A": correct_idx = 0
        elif ans == "B": correct_idx = 1
        elif ans == "C": correct_idx = 2
        elif ans == "D": correct_idx = 3
    elif q_data.get("answer"):
        ans = q_data.get("answer")
        if str(ans).isdigit():
            correct_idx = int(ans) - 1
            
    year = q.get("year", "")
    title = q.get("paperTitle", f"JEE Main {year}")
    if q.get("bookmark", {}).get("en", {}).get("title"):
        title = q.get("bookmark").get("en").get("title")
        
    # Append exam type to title to distinguish Mains vs Adv if we combine them
    exam_type = q.get("exam", "")
    if exam_type == "jee-advanced" and "Advanced" not in title:
        title = f"JEE Advanced {year} - {title}"
    
    difficulty = str(q.get("difficulty") or "medium").capitalize()
    topic = q.get("topic") or "General"
    topic = topic.replace("-", " ").title()
    
    is_numerical = len(str_options) == 0
    correct_answer = q_data.get("answer", "") if is_numerical else ""
    
    doc = {
        "question_id": str(q_id),
        "chapterId": target_chapter_id, # slug
        "title": title,
        "year": year,
        "difficulty": difficulty,
        "type": "NUMERICAL" if is_numerical else "SCQ",
        "question": q_data.get("content", ""),
        "options": str_options,
        "correctOptionIndex": correct_idx,
        "correctAnswer": correct_answer,
        "solution": q_data.get("explanation", ""),
        "marks": int(q.get("marks", 4)),
        "negativeMarks": -int(abs(q.get("negMarks", 1))),
        "topic": topic,
        "exam": exam_type
    }
    return doc

data_out = {} 

for raw_dir in ["public/data/questions/raw_math", "public/data/questions/raw_adv_math"]:
    if not os.path.exists(raw_dir): continue
    for filename in os.listdir(raw_dir):
        if not filename.endswith(".json"): continue
        path = os.path.join(raw_dir, filename)
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
                
            results = data.get("results", [])
            for res in results:
                questions = res.get("questions", [])
                for q in questions:
                    slug = q.get("chapter", "")
                    # We group purely by slug!
                    if not slug:
                        continue
                        
                    doc = format_question(q, slug)
                    if doc:
                        if slug not in data_out:
                            data_out[slug] = []
                            
                        if not any(existing["question_id"] == doc["question_id"] for existing in data_out[slug]):
                            data_out[slug].append(doc)
        except Exception as e:
            print(f"Error processing {filename}: {e}")

out_dir = "public/data/questions"
os.makedirs(out_dir, exist_ok=True)
for slug, qs in data_out.items():
    qs.sort(key=lambda x: str(x.get("year", "")), reverse=True)
    with open(os.path.join(out_dir, f"{slug}.json"), "w", encoding="utf-8") as f:
        json.dump(qs, f, indent=2)

print(f"Saved {len(data_out)} chapters into {out_dir}!")
