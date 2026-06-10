from pymongo import MongoClient
uri = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0"
db = MongoClient(uri).quantrex
for c in db.blackbookchapters.find():
    print(c.get('id'), c.get('title'))
