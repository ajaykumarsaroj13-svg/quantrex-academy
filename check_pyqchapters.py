from pymongo import MongoClient
uri = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0"
db = MongoClient(uri).quantrex
for c in db.pyqchapters.find():
    if 'limit' in str(c.get('id', '')).lower() or 'limit' in str(c.get('name', '')).lower() or 'jee' in str(c.get('id', '')).lower():
        print(c.get('id'), c.get('name'))
