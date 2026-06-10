import os
import json
import pymongo
import certifi

URI = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0"
client = pymongo.MongoClient(URI, tlsCAFile=certifi.where())
db = client['quantrex']

PUBLIC_DATA_DIR = r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\frontend\public\data"
QUESTIONS_DIR = os.path.join(PUBLIC_DATA_DIR, "questions")

def seed():
    # 1. Seed Chapters
    print("Loading chapters.json...")
    with open(os.path.join(PUBLIC_DATA_DIR, "chapters.json"), "r", encoding="utf-8") as f:
        chapters_data = json.load(f)
    
    chapter_docs = []
    for subj, ch_list in chapters_data.items():
        if subj == "other": continue
        for ch in ch_list:
            doc = {
                "id": ch["id"],
                "name": ch["name"],
                "subject": ch["subject"],
                "exams": ch.get("exams", []),
                "count": ch.get("count", 0),
                "weightage": ch.get("weightage", "5%")
            }
            chapter_docs.append(doc)
            
    print(f"Found {len(chapter_docs)} chapters. Seeding into PyqChapter...")
    db.pyqchapters.delete_many({})
    db.pyqchapters.insert_many(chapter_docs)
    print("Chapters seeded.")

    # 2. Seed Questions
    print("Loading question files...")
    question_docs = []
    for filename in os.listdir(QUESTIONS_DIR):
        if not filename.endswith(".json"): continue
        with open(os.path.join(QUESTIONS_DIR, filename), "r", encoding="utf-8") as f:
            qs = json.load(f)
            # Add them directly since the schema matches our static JSON perfectly!
            question_docs.extend(qs)
            
    print(f"Found {len(question_docs)} questions. Seeding into Pyq (this might take a minute)...")
    db.pyqs.delete_many({})
    
    # Bulk insert in chunks to avoid max BSON size limit
    chunk_size = 5000
    for i in range(0, len(question_docs), chunk_size):
        chunk = question_docs[i:i+chunk_size]
        db.pyqs.insert_many(chunk)
        print(f"Inserted {i + len(chunk)} / {len(question_docs)}")
        
    print("All questions seeded successfully into MongoDB Atlas!")

if __name__ == "__main__":
    seed()
