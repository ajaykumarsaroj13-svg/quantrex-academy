from pymongo import MongoClient

uri = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(uri)
db = client.quantrex

print("Collections:", db.list_collection_names())
for coll_name in db.list_collection_names():
    if coll_name == 'pyqs': continue
    print(f"\nCollection {coll_name} sample:")
    for doc in db[coll_name].find().limit(2):
        print(doc)
