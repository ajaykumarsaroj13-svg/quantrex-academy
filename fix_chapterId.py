from pymongo import MongoClient
uri = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(uri)
db = client.quantrex

res = db.pyqs.update_many({'chapterId': 'sequences-and-series'}, {'$set': {'chapterId': 'ch_mathematics_algebra_3'}})
print(f'Modified {res.modified_count} documents')
