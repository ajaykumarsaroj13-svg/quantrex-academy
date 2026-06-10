from pymongo import MongoClient

client = MongoClient('mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0')
db = client['quantrex']
col = db['pyqs']

result = col.update_many(
    {'chapterId': 'jee_main_math_progression_series'},
    {'$set': {'chapterId': 'ch_mathematics_algebra_3'}}
)

print(f"Updated {result.modified_count} questions.")
