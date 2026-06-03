import pymongo, certifi, json

uri = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0"
client = pymongo.MongoClient(uri, tlsCAFile=certifi.where())
db = client["quantrex"]

# Check exam distribution in questions
pipeline = [{"$group": {"_id": "$exam", "count": {"$sum": 1}}}]
result = list(db.pyqs.aggregate(pipeline))
print("Question distribution by exam:")
for r in result:
    print("  " + str(r["_id"]) + ": " + str(r["count"]))

# Check chapter distribution
pipeline2 = [{"$group": {"_id": "$exams", "count": {"$sum": 1}}}]
result2 = list(db.pyqchapters.aggregate(pipeline2))
print("\nChapter distribution by exams field:")
for r in result2:
    print("  " + str(r["_id"]) + ": " + str(r["count"]))

# Sample question
sample = db.pyqs.find_one()
if sample:
    sample.pop("_id", None)
    print("\nSample question:")
    print(json.dumps(sample, indent=2, default=str)[:500])
