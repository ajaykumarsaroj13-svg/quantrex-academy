from pymongo import MongoClient

uri = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(uri)
db = client.quantrex

found = False
for coll_name in db.list_collection_names():
    try:
        docs = list(db[coll_name].find({"$or": [{"id": {"$regex": "jee mathematics-limit", "$options": "i"}}, {"chapterId": {"$regex": "jee mathematics-limit", "$options": "i"}}]}))
        if docs:
            print(f"Found in {coll_name}: {len(docs)} documents")
            found = True
    except Exception as e:
        pass
if not found:
    print("Not found anywhere in mongo.")
