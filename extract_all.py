import os
import sys
import fitz
import json
import time
import google.generativeai as genai
from pydantic import BaseModel
from PIL import Image
import io

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

class Question(BaseModel):
    id: str
    text: str
    options: list[str]
    correctOption: int
    solution: str
    questionType: str

class ExtractionResult(BaseModel):
    is_new_chapter: bool
    chapter_title: str
    questions: list[Question]

def extract_page(doc, page_num):
    page = doc.load_page(page_num)
    pix = page.get_pixmap(dpi=150)
    img = Image.open(io.BytesIO(pix.tobytes("png")))

    prompt = """
    Extract all math questions from this page.
    Format the output as JSON.
    Important instructions:
    1. Use LaTeX for ALL math formulas and symbols. Wrap inline math in $...$.
    2. For options, put the full text. If no correct option is marked, use -1. Leave solution empty string if none is provided.
    3. questionType: Identify if the question is "Single Correct", "More than One Correct", "Comprehension", "Matrix Match" etc based on the section header. You MUST include this information in the questionType field for EVERY question exactly as it's categorized in the book.
    4. Detect if this page contains the START of a new chapter. The chapter title should be exact like "Chapter 1: Functions" or "Chapter 2: Limits".
       If it does, set is_new_chapter to true and provide the chapter_title.
    """
    
    max_retries = 10
    base_wait = 15
    for attempt in range(max_retries):
        try:
            resp = model.generate_content(
                [prompt, img], 
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json", 
                    response_schema=ExtractionResult
                )
            )
            return json.loads(resp.text)
        except Exception as e:
            err_msg = str(e)
            print(f"Error on page {page_num} (attempt {attempt+1}): {err_msg}")
            if "429" in err_msg or "Quota exceeded" in err_msg:
                wait_time = base_wait * (attempt + 1)
                print(f"Rate limited. Waiting for {wait_time} seconds...")
                time.sleep(wait_time)
            else:
                raise e
    return None

if __name__ == "__main__":
    if len(sys.argv) < 5:
        print("Usage: python extract_all.py <pdf_path> <start_page> <end_page> <output_json>")
        sys.exit(1)

    pdf_path = sys.argv[1]
    start_page = int(sys.argv[2])
    end_page = int(sys.argv[3])
    output_json = sys.argv[4]

    doc = fitz.open(pdf_path)
    
    # Load existing if available so we don't start from scratch and can resume
    if os.path.exists(output_json):
        try:
            with open(output_json, "r", encoding="utf-8") as f:
                all_chapters = json.load(f)
        except:
            all_chapters = []
    else:
        all_chapters = []

    current_chapter = all_chapters[-1] if all_chapters else None
    
    for p_num in range(start_page, end_page + 1):
        print(f"Processing page {p_num}...")
        result = extract_page(doc, p_num)
        
        if result:
            if result.get("is_new_chapter") or not current_chapter:
                title = result.get("chapter_title") or f"Chapter {len(all_chapters) + 1}"
                if current_chapter and current_chapter["title"].lower() == title.lower():
                    # Same chapter name, ignore new chapter signal
                    pass
                else:
                    current_chapter = {
                        "id": f"ch_{len(all_chapters) + 1}",
                        "title": title,
                        "questions": []
                    }
                    all_chapters.append(current_chapter)
                    print(f"Found new chapter: {title}")
            
            qs = result.get("questions", [])
            added = 0
            for q in qs:
                # Check for duplicates based on the first 30 chars of the text
                is_duplicate = False
                prefix = q["text"][:30]
                for existing_q in current_chapter["questions"]:
                    if existing_q["text"][:30] == prefix:
                        is_duplicate = True
                        break
                
                if not is_duplicate:
                    q['id'] = f"q{len(current_chapter['questions']) + 1}"
                    current_chapter["questions"].append(q)
                    added += 1
            print(f"Extracted {len(qs)} questions, {added} were new (no repeats).")
                
            # Save progress after every page
            with open(output_json, "w", encoding="utf-8") as f:
                json.dump(all_chapters, f, indent=2, ensure_ascii=False)
