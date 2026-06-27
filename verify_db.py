import pymongo
from collections import Counter

uri = 'mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0'
client = pymongo.MongoClient(uri)
db = client.quantrex

qs = list(db.pyqs.find({'exam': 'jee-advanced'}, {'year': 1, 'type': 1, 'correctAnswer': 1, '_id': 0}))
print(f'Total: {len(qs)}')
years = Counter(q.get('year') for q in qs)
print(f'Year range: {min(years.keys())} - {max(years.keys())}')
print(f'Types: {Counter(q.get("type") for q in qs)}')
subj_with_ans = sum(1 for q in qs if q.get('type') == 'SUBJECTIVE' and q.get('correctAnswer'))
print(f'Subjective with answers: {subj_with_ans}')
