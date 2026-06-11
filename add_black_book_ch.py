import json
import os

# Load the chunks
chunks = []
for i in range(1, 7):
    chunk_file = f"C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\quantrexacadmy\\public\\data\\questions\\extracted_chunk_{i}.json"
    with open(chunk_file, "r", encoding="utf-8") as f:
        chunks.append(json.load(f))

formatted_questions = []

import re

# Ex 1: 1-70 (Chunks 1 & 2)
for idx, q in enumerate(chunks[0] + chunks[1], start=1):
    q_num = idx
    formatted_questions.append({
        "questionNumber": q_num,
        "questionType": "SINGLE CORRECT",
        "text": q["question"],
        "options": q.get("options", []),
        "exerciseName": "Exercise-1 : Single Choice Problems",
        "has_graph": False,
        "chapter": "Application of Derivatives",
        "correctOption": q.get("correctOptionIndex", -1),
        "typeLabel": "[SINGLE CORRECT]"
    })

# Ex 2: 1-29 (Chunk 3)
for idx, q in enumerate(chunks[2], start=1):
    q_num = idx
    ans = q.get("correctAnswer", "")
    if isinstance(ans, list):
        ans = ", ".join(ans)
    formatted_questions.append({
        "questionNumber": q_num,
        "questionType": "ONE OR MORE THAN ONE CORRECT",
        "text": q["question"],
        "options": q.get("options", []),
        "exerciseName": "Exercise-2 : One or More than One Correct",
        "has_graph": False,
        "chapter": "Application of Derivatives",
        "correctOption": q.get("correctOptionIndex", -1),
        "answerKeyStr": ans,
        "typeLabel": "[ONE OR MORE THAN ONE CORRECT]"
    })

# Ex 3: 1-16 (Chunk 4)
for idx, q in enumerate(chunks[3], start=1):
    q_num = idx
    formatted_questions.append({
        "questionNumber": q_num,
        "questionType": "COMPREHENSION TYPE",
        "text": q["question"],
        "options": q.get("options", []),
        "exerciseName": "Exercise-3 : Comprehension Type Problems",
        "has_graph": False,
        "chapter": "Application of Derivatives",
        "correctOption": q.get("correctOptionIndex", -1),
        "typeLabel": "[COMPREHENSION TYPE]"
    })

# Ex 4: 1-8 (Chunk 5)
for idx, q in enumerate(chunks[4], start=1):
    q_num = idx
    ans = q.get("correctAnswer", "")
    if isinstance(ans, list):
        ans = ", ".join(ans)
    elif isinstance(ans, dict):
        ans = json.dumps(ans)
    formatted_questions.append({
        "questionNumber": q_num,
        "questionType": "MATCHING TYPE",
        "text": q["question"],
        "options": q.get("options", []),
        "exerciseName": "Exercise-4 : Matching Type Problems",
        "has_graph": False,
        "chapter": "Application of Derivatives",
        "answerKeyStr": str(ans),
        "typeLabel": "[MATCHING TYPE]"
    })

# Ex 5: 1-21 (Chunk 6)
for idx, q in enumerate(chunks[5], start=1):
    q_num = idx
    ans = q.get("correctAnswer", "")
    formatted_questions.append({
        "questionNumber": q_num,
        "questionType": "SUBJECTIVE TYPE",
        "text": q["question"],
        "options": [],
        "exerciseName": "Exercise-5 : Subjective Type Problems",
        "has_graph": False,
        "chapter": "Application of Derivatives",
        "answerKeyStr": str(ans),
        "typeLabel": "[SUBJECTIVE TYPE]"
    })

black_book_path = "C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\quantrexacadmy\\src\\utils\\blackBookDataFull.json"
with open(black_book_path, "r", encoding="utf-8") as f:
    bb_data = json.load(f)

# Find if "Application of Derivatives" already exists
ch_idx = -1
for i, ch in enumerate(bb_data):
    if ch.get("title", "").lower() == "application of derivatives":
        ch_idx = i
        break

new_chapter = {
    "id": "black_book_ch_aod",
    "chapterNumber": len(bb_data) + 1 if ch_idx == -1 else bb_data[ch_idx]["chapterNumber"],
    "title": "Application of Derivatives",
    "questions": formatted_questions
}

if ch_idx == -1:
    bb_data.append(new_chapter)
else:
    bb_data[ch_idx] = new_chapter

with open(black_book_path, "w", encoding="utf-8") as f:
    json.dump(bb_data, f, indent=2)

print(f"Successfully added Application of Derivatives to Black Book with {len(formatted_questions)} questions!")
