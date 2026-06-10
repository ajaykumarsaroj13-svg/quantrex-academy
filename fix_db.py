import json

# Read the flat array of new Limits questions
with open('limits_extracted_manual.json', 'r', encoding='utf-8') as f:
    new_limits = json.load(f)

# Normalize the flat questions
for q in new_limits:
    if "exerciseName" not in q or q["exerciseName"].strip() == "" or q["exerciseName"] == "Unknown":
        q["exerciseName"] = "Exercise-1 : Single Choice Problems"
    elif "Exercise-2" in q["exerciseName"]:
        q["exerciseName"] = "Exercise-2 : Multiple Choice Problems"
    elif "Exercise-3" in q["exerciseName"]:
        q["exerciseName"] = "Exercise-3 : Comprehension Type Problems"
    elif "Exercise-4" in q["exerciseName"]:
        q["exerciseName"] = "Exercise-4 : Matching Type Problems"
    elif "Exercise-5" in q["exerciseName"]:
        q["exerciseName"] = "Exercise-5 : Subjective Type Problems"
    
    # ensure options is present
    if "options" not in q:
        q["options"] = []

# Read the original blackBookDataFull.json
with open('src/utils/blackBookDataFull.json', 'r', encoding='utf-8') as f:
    full_data = json.load(f)

# We know full_data currently is corrupted because we appended flat questions to it.
# Let's filter out all the flat questions and keep only the objects that have "questions" array.
cleaned_data = [ch for ch in full_data if "questions" in ch]

# Now, find the Limits chapter and replace its questions
for ch in cleaned_data:
    if ch.get("id") == "limits" or ch.get("title") == "Limits":
        ch["questions"] = new_limits
        break
else:
    # If not found, append a new chapter object
    cleaned_data.append({
        "id": "limits",
        "title": "Limits",
        "book": "Black Book",
        "subject": "Mathematics",
        "questions": new_limits
    })

# Save back to blackBookDataFull.json
with open('src/utils/blackBookDataFull.json', 'w', encoding='utf-8') as f:
    json.dump(cleaned_data, f, indent=2, ensure_ascii=False)

print(f"Successfully updated Limits chapter with {len(new_limits)} questions. Total chapters: {len(cleaned_data)}")
