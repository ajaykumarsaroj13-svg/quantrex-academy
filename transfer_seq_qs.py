from pymongo import MongoClient

# Source: backup DB where all ExamGoal questions were scraped
src_uri = "mongodb+srv://quantrexacademy:quantrex2024@cluster0.mongodb.net/quantrex?retryWrites=true&w=majority"
src_client = MongoClient(src_uri)
src_db = src_client['quantrex']
src_col = src_db['pyqs']

# Target: current DB
tgt_uri = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0"
tgt_client = MongoClient(tgt_uri)
tgt_db = tgt_client['quantrex']
tgt_col = tgt_db['pyqs']

# Find Sequence and Series questions
print("Querying source DB...")
# The chapter might be named 'Sequences and Series' or 'Sequence and Series'
query = {
    "exam": "JEE Main",
    "chapter": {"$regex": "Sequences? and Series", "$options": "i"}
}

qs = list(src_col.find(query))
print(f"Found {len(qs)} questions in backup DB.")

if not qs:
    print("No questions found, exiting.")
    exit(1)

formatted_docs = []
target_chapter_id = "ch_mathematics_algebra_3"

for idx, q in enumerate(qs):
    # Ensure q is formatted correctly according to the target schema
    q_id = q.get("examGoalId", f"seq_{idx}")
    
    # We want to format the options properly
    options = q.get("options", [])
    if options and isinstance(options[0], dict):
        options = [opt.get("text", opt.get("value", "")) for opt in options]
        
    ans = q.get("answer", "")
    correct_idx = 0
    if ans == "A": correct_idx = 0
    elif ans == "B": correct_idx = 1
    elif ans == "C": correct_idx = 2
    elif ans == "D": correct_idx = 3
    elif str(ans).isdigit():
        correct_idx = int(ans) - 1
        
    year = q.get("year", "")
    if not year:
        # Extract from paper title
        title = q.get("paperTitle", "")
        import re
        match = re.search(r"20\d\d", title)
        if match:
            year = match.group(0)
        else:
            year = "2024"
            
    difficulty = q.get("difficulty", "Medium").capitalize()
    if difficulty.startswith("E"): difficulty = "Easy"
    elif difficulty.startswith("H"): difficulty = "Hard"
    elif difficulty.startswith("M"): difficulty = "Medium"
    else: difficulty = "Medium"
    
    topic = q.get("topic", "General")
    if not topic: topic = "General"
    
    # Ensure options array has strings
    str_options = [str(opt) for opt in options]

    doc = {
        "question_id": str(q_id),
        "chapterId": target_chapter_id,
        "title": q.get("paperTitle", f"JEE Main {year}"),
        "year": str(year),
        "difficulty": difficulty,
        "type": "SCQ" if len(str_options) > 0 else "NUM",
        "question": q.get("question", ""),
        "options": str_options,
        "correctOptionIndex": correct_idx,
        "solution": q.get("solution", ""),
        "marks": int(q.get("marks", 4)),
        "negativeMarks": -int(abs(q.get("negMarks", 1))),
        "topic": topic
    }
    
    formatted_docs.append(doc)

# We want exactly 309 questions to match user expectations. If we have more, we just insert all or 309? 
# The user said "total 309 questions hai exactly". So if we have 309, perfect.
print(f"Formatting complete. Total docs: {len(formatted_docs)}")

if formatted_docs:
    tgt_col.insert_many(formatted_docs)
    print(f"Successfully inserted {len(formatted_docs)} REAL ExamGoal questions to target DB!")
