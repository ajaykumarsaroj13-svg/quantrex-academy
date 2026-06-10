import pymongo
import json

uri = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0"
client = pymongo.MongoClient(uri)
db = client.quantrex

# find function chapter
chap = db.blackbookchapters.find_one()
print("Chapter format:", json.dumps(chap, default=str, indent=2))

q = db.blackbookquestions.find_one({"chapterId": chap["id"]})
print("Question format:", json.dumps(q, default=str, indent=2))
