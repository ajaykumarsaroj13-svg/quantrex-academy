#!/usr/bin/env python
"""
Load extracted ExamGoal question JSON files into MongoDB.
Assumes a local MongoDB instance (mongodb://localhost:27017) and a database named 'examgoal'.
Each series key becomes a collection name (e.g., 'pyq-in-jee-jee-main').
"""
import os
import json
from pymongo import MongoClient

# Configuration (default values)
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "examgoal")
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

if not os.path.isdir(DATA_DIR):
    print(f"Data directory not found: {DATA_DIR}")
    exit(1)

for filename in os.listdir(DATA_DIR):
    if not filename.endswith("_questions.json"):
        continue
    series_name = filename.replace("_questions.json", "")
    collection = db[series_name]
    file_path = os.path.join(DATA_DIR, filename)
    with open(file_path, "r", encoding="utf-8") as f:
        questions = json.load(f)
    if not isinstance(questions, list):
        print(f"Skipping unexpected format in {filename}")
        continue
    # Optional: drop existing collection to avoid duplicates
    collection.drop()
    if questions:
        collection.insert_many(questions)
        print(f"Inserted {len(questions)} documents into collection '{series_name}'")
    else:
        print(f"No questions found in {filename}")
print("All done.")
