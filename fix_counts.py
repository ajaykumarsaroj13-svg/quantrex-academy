import pymongo, certifi

uri = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0"
client = pymongo.MongoClient(uri, tlsCAFile=certifi.where())
db = client["quantrex"]

# For each chapter, count questions per exam and update the chapter document
chapters = list(db.pyqchapters.find({}))
print("Updating chapter counts per exam...")

for ch in chapters:
    ch_id = ch["id"]
    exams = ch.get("exams", [])
    
    # Count total questions for this chapter across all exams
    total = db.pyqs.count_documents({"chapterId": ch_id})
    
    # Count per exam
    exam_counts = {}
    for exam in exams:
        count = db.pyqs.count_documents({"chapterId": ch_id, "exam": exam})
        exam_counts[exam] = count
    
    # Update the chapter document with accurate count and exam_counts
    db.pyqchapters.update_one(
        {"_id": ch["_id"]},
        {"$set": {"count": total, "examCounts": exam_counts}}
    )
    
    print(f"  {ch_id}: total={total}, per_exam={exam_counts}")

print("\nDone! All chapter counts updated.")
