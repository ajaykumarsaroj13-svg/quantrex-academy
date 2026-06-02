import json
import fitz
from PIL import Image
import io
import os

def process_extracted_data(pdf_path, json_path, output_dir):
    # Ensure output dir for images
    os.makedirs(output_dir, exist_ok=True)
    
    with open(json_path, 'r', encoding='utf-8') as f:
        pages_data = json.load(f)
        
    doc = fitz.open(pdf_path)
    
    questions = []
    global_answers = {}
    
    # Pass 1: Collect all questions and answers globally
    for p_data in pages_data:
        if not p_data:
            continue
            
        if p_data.get("is_answer_key_page"):
            for ans in p_data.get("answer_keys", []):
                q_num = str(ans.get("questionNumber"))
                global_answers[q_num] = ans.get("correctOptionStr")
        else:
            page_num = p_data.get("page_num")
            page_img = None
            
            for q in p_data.get("questions", []):
                q["correctOption"] = -1
                
                # Handle graph
                if q.get("has_graph") and q.get("graph_bbox"):
                    bbox = q["graph_bbox"]
                    if len(bbox) == 4 and not all(b == 0 for b in bbox):
                        if page_img is None:
                            page = doc.load_page(page_num)
                            pix = page.get_pixmap(dpi=150)
                            page_img = Image.open(io.BytesIO(pix.tobytes("png")))
                        
                        ymin, xmin, ymax, xmax = bbox
                        width, height = page_img.size
                        
                        left = (xmin / 1000.0) * width
                        top = (ymin / 1000.0) * height
                        right = (xmax / 1000.0) * width
                        bottom = (ymax / 1000.0) * height
                        
                        if left < right and top < bottom:
                            cropped = page_img.crop((left, top, right, bottom))
                            img_filename = f"ch1_q{q['questionNumber']}.png"
                            img_path = os.path.join(output_dir, img_filename)
                            cropped.save(img_path)
                            q["imageUrl"] = f"/assets/graphs/{img_filename}"
                
                questions.append(q)

    # Pass 2: Map global answer keys to questions
    for q in questions:
        q_num = str(q.get("questionNumber"))
        ans_str = global_answers.get(q_num)
        if ans_str:
            q["answerKeyStr"] = ans_str
            ans_str = ans_str.lower().strip()
            if ans_str == "a": q["correctOption"] = 0
            elif ans_str == "b": q["correctOption"] = 1
            elif ans_str == "c": q["correctOption"] = 2
            elif ans_str == "d": q["correctOption"] = 3
                
    # Sort questions by questionNumber
    questions.sort(key=lambda x: x.get("questionNumber", 0))

    final_data = [{
        "id": "black_book_ch1_partial",
        "title": "Functions (Partial)",
        "questions": questions
    }]

    # Save final structured data
    final_json_path = json_path.replace(".json", "_processed.json")
    with open(final_json_path, 'w', encoding='utf-8') as f:
        json.dump(final_data, f, indent=2, ensure_ascii=False)
        
    print(f"Processing complete! Saved to {final_json_path}")

if __name__ == "__main__":
    import sys
    pdf = sys.argv[1]
    jsn = sys.argv[2]
    out_dir = sys.argv[3]
    process_extracted_data(pdf, jsn, out_dir)
