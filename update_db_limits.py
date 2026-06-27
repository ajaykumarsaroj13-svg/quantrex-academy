import json
import re

with open('limits_extracted_manual.json', 'r', encoding='utf-8') as f:
    new_limits = json.load(f)

# Sort them properly by Exercise
# But first, some exercises might be missing the "Exercise-" prefix in their exerciseName, let's fix them
for q in new_limits:
    if "exerciseName" not in q or q["exerciseName"].strip() == "" or q["exerciseName"] == "Unknown":
        q["exerciseName"] = "Exercise-1 : Single Choice Problems" # fallback if missing
    elif "Exercise-2" in q["exerciseName"]:
        q["exerciseName"] = "Exercise-2 : Multiple Choice Problems"
    elif "Exercise-3" in q["exerciseName"]:
        q["exerciseName"] = "Exercise-3 : Comprehension Type Problems"
    elif "Exercise-4" in q["exerciseName"]:
        q["exerciseName"] = "Exercise-4 : Matching Type Problems"
    elif "Exercise-5" in q["exerciseName"]:
        q["exerciseName"] = "Exercise-5 : Subjective Type Problems"
    
    q["chapter"] = "Limits"
    q["subject"] = "Advanced Mathematics"
    if "options" not in q:
        q["options"] = []

# Now read the full data
with open('src/utils/blackBookDataFull.json', 'r', encoding='utf-8') as f:
    full_data = json.load(f)

# Keep everything EXCEPT Limits
filtered_data = [q for q in full_data if q.get('chapter', '').lower() != 'limits']

# Add new limits
filtered_data.extend(new_limits)

# Save
with open('src/utils/blackBookDataFull.json', 'w', encoding='utf-8') as f:
    json.dump(filtered_data, f, indent=2, ensure_ascii=False)

print(f"Replaced Limits. Old total: {len(full_data)}. New total: {len(filtered_data)}. Inserted {len(new_limits)} Limits questions.")
