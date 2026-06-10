from pymongo import MongoClient

client = MongoClient('mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0')
db = client['quantrex']
col = db['pyqs']

doc = col.find_one({'chapterId': 'jee_main_math_progression_series'})
print(f"Year value: {repr(doc.get('year'))}, Type: {type(doc.get('year'))}")
