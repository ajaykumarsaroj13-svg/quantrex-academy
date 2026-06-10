from pymongo import MongoClient

client = MongoClient('mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0')
db = client['quantrex']
col = db['pyqs']

docs = list(col.find({'chapterId': 'jee_main_math_progression_series'}))
updated = 0
for doc in docs:
    y = doc.get('year')
    if isinstance(y, str):
        try:
            val = int(y)
            col.update_one({'_id': doc['_id']}, {'$set': {'year': val}})
            updated += 1
        except Exception as e:
            print(e)

print(f'Updated {updated} documents.')
