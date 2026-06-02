import json
import os
import sys
from PIL import Image
import io
import fitz

def extract_graphs(doc, p_data, output_dir="frontend/public/assets/graphs"):
    os.makedirs(output_dir, exist_ok=True)
    page_num = p_data.get("page_num")
    page_img = None
    
    for q in p_data.get("questions", []):
        if q.get("has_graph") and q.get("graph_bbox"):
            bbox = q["graph_bbox"]
            if len(bbox) == 4 and not all(b == 0 for b in bbox):
                if page_img is None:
                    try:
                        page = doc.load_page(page_num)
                        pix = page.get_pixmap(dpi=150)
                        page_img = Image.open(io.BytesIO(pix.tobytes("png")))
                    except Exception as e:
                        print(f"Failed to load page image for graph extraction on page {page_num}: {e}")
                        continue
                
                ymin, xmin, ymax, xmax = bbox
                width, height = page_img.size
                
                left = (xmin / 1000.0) * width
                top = (ymin / 1000.0) * height
                right = (xmax / 1000.0) * width
                bottom = (ymax / 1000.0) * height
                
                if left < right and top < bottom:
                    try:
                        cropped = page_img.crop((left, top, right, bottom))
                        # Use a hash of the text or question number to avoid overwriting
                        q_num_safe = q.get('questionNumber', 'unknown')
                        text_hash = str(hash(q.get('text', '')))[:6]
                        img_filename = f"ch1_q{q_num_safe}_{text_hash}.png"
                        img_path = os.path.join(output_dir, img_filename)
                        cropped.save(img_path)
                        q["imageUrl"] = f"/assets/graphs/{img_filename}"
                    except Exception as e:
                        print(f"Error cropping graph for Q{q_num_safe}: {e}")

def refine_questions():
    files = [f"p{i}.json" for i in range(5, 14)] + ["test_ch1.json"]
    all_pages = []
    
    for fname in files:
        if os.path.exists(fname):
            with open(fname, "r", encoding="utf-8") as f:
                try:
                    data = json.load(f)
                    if isinstance(data, list):
                        all_pages.extend(data)
                    elif isinstance(data, dict):
                        all_pages.append(data)
                except Exception as e:
                    print(f"Error reading {fname}: {e}")
                    
    global_answers = {}
    
    # Pass 1: Collect answer keys
    for p_data in all_pages:
        if not p_data: continue
        if p_data.get("is_answer_key_page"):
            for ans in p_data.get("answer_keys", []):
                q_num = str(ans.get("questionNumber"))
                global_answers[q_num] = ans.get("correctOptionStr")
                
    questions = []
    seen = set()
    
    pdf_path = "C:\\Users\\Admin\\Downloads\\882838728-Black-Book (1).pdf"
    doc = None
    if os.path.exists(pdf_path):
        doc = fitz.open(pdf_path)
    
    # Pass 2: Collect questions IN ORDER of pages
    for p_data in all_pages:
        if not p_data: continue
        if not p_data.get("is_answer_key_page"):
            
            if doc:
                extract_graphs(doc, p_data)
                
            for q in p_data.get("questions", []):
                # Unique identifier based on text to prevent exact duplicates
                text_id = q.get("text", "").strip()[:50]
                if text_id in seen:
                    continue
                if text_id:
                    seen.add(text_id)
                
                q["chapter"] = "Functions"
                
                q_type = q.get("questionType", "").upper()
                if q_type:
                    q["typeLabel"] = f"[{q_type}]"
                else:
                    q["typeLabel"] = ""
                    
                # Map question types to Exercise 1, 2, 3, 4, 5
                if "SINGLE CORRECT" in q_type:
                    q["exerciseName"] = "Exercise 1"
                elif "MULTIPLE CORRECT" in q_type:
                    q["exerciseName"] = "Exercise 2"
                elif "COMPREHENSION" in q_type or "MATCH" in q_type:
                    q["exerciseName"] = "Exercise 3"
                elif "SUBJECTIVE" in q_type:
                    q["exerciseName"] = "Exercise 4"
                else:
                    q["exerciseName"] = "Exercise 5"
                    
                q["correctOption"] = -1
                
                q_num = str(q.get("questionNumber"))
                ans_str = global_answers.get(q_num)
                if ans_str:
                    ans_str = ans_str.lower().strip()
                    if ans_str == "a": q["correctOption"] = 0
                    elif ans_str == "b": q["correctOption"] = 1
                    elif ans_str == "c": q["correctOption"] = 2
                    elif ans_str == "d": q["correctOption"] = 3
                    elif "," in ans_str:
                        mapped = []
                        for opt in ans_str.split(","):
                            o = opt.strip()
                            if o == "a": mapped.append(0)
                            elif o == "b": mapped.append(1)
                            elif o == "c": mapped.append(2)
                            elif o == "d": mapped.append(3)
                        q["correctOptionsArray"] = mapped
                        
                questions.append(q)
                
    # Fix for Q90: ensure it is 3 if D
    for q in questions:
        if q.get("questionNumber") == 90 and q.get("questionType") == "SINGLE CORRECT":
            if q["correctOption"] != 3:
                q["correctOption"] = 3 # Hardcode fix for Q90 just in case the key was missing!
                
    final_data = [{
        "id": "black_book_ch1_functions",
        "chapterNumber": 1,
        "title": "Functions",
        "questions": questions
    }]
    
    with open("frontend/src/utils/blackBookDataFull.json", "w", encoding="utf-8") as f:
        json.dump(final_data, f, indent=2, ensure_ascii=False)
        
    print(f"Total questions properly arranged: {len(questions)}")
    if doc:
        doc.close()

if __name__ == "__main__":
    refine_questions()
