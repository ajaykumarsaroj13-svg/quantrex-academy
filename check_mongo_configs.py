import pymongo
import certifi
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

URI = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0"

try:
    print("Connecting to MongoDB Atlas...")
    client = pymongo.MongoClient(URI, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=5000)
    db = client['quantrex']
    
    appconfigs = db['appconfigs'].find()
    
    print("--- App Configs ---")
    for cfg in appconfigs:
        print(f"Key: {cfg.get('key')}")
        val = cfg.get('value')
        if val:
            print(f"Value summary: {str(val)[:200]}...")
            
        print("-" * 20)
        
except Exception as e:
    print(f"Failed to connect: {e}")
