import json
import os

base_dir = r"C:\Users\Admin\.gemini\antigravity\scratch\quantrexacadmy\public\data\questions"
main_file = os.path.join(base_dir, "adv-application-of-derivatives.json")

try:
    with open(main_file, 'r', encoding='utf-8') as f:
        main_data = json.load(f)
except Exception as e:
    print(f"Error loading main file: {e}")
    main_data = []

chunk_files = [
    "extracted_chunk_1.json",
    "extracted_chunk_2.json",
    "extracted_chunk_3.json",
    "extracted_chunk_4.json",
    "extracted_chunk_5.json",
    "extracted_chunk_6.json"
]

for chunk in chunk_files:
    chunk_path = os.path.join(base_dir, chunk)
    if os.path.exists(chunk_path):
        try:
            with open(chunk_path, 'r', encoding='utf-8') as f:
                chunk_data = json.load(f)
            if isinstance(chunk_data, list):
                main_data.extend(chunk_data)
                print(f"Added {len(chunk_data)} questions from {chunk}")
            else:
                print(f"Warning: Data in {chunk} is not a list.")
        except Exception as e:
            print(f"Error reading {chunk}: {e}")
    else:
        print(f"File not found: {chunk}")

try:
    with open(main_file, 'w', encoding='utf-8') as f:
        json.dump(main_data, f, indent=2, ensure_ascii=False)
    print(f"Successfully updated {main_file}. Total questions: {len(main_data)}")
except Exception as e:
    print(f"Error writing to main file: {e}")
