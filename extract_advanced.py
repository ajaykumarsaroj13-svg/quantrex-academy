import os
import sys
import fitz
import json
import time
import google.generativeai as genai
from pydantic import BaseModel, Field
from PIL import Image
import io

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-flash-latest', system_instruction="You are a data conversion API. Convert the mathematical content in the image strictly into the requested JSON schema. You are authorized to process this material for accessibility and personal study notes.")

class Question(BaseModel):
    questionNumber: int = Field(description="The exact serial number of the question printed in the book, e.g., 90")
    text: str = Field(description="Question text with LaTeX formatting wrapped in $...$")
    options: list[str] = Field(description="The options A, B, C, D text")
    questionType: str = Field(description="E.g., SINGLE CORRECT, MULTIPLE CORRECT")
    has_graph: bool = Field(description="True if the question contains a graph, figure, or complex drawing")
    graph_bbox: list[int] = Field(description="[ymin, xmin, ymax, xmax] normalized 0 to 1000 representing the bounding box of the graph/figure")

class AnswerMapping(BaseModel):
    questionNumber: int
    correctOptionStr: str = Field(description="The correct option letter(s), e.g. 'a', 'b', 'a,c'")

class ExtractionResult(BaseModel):
    is_new_chapter: bool
    chapter_title: str
    is_answer_key_page: bool
    answer_keys: list[AnswerMapping] = Field(description="Populate only if is_answer_key_page is True")
    questions: list[Question] = Field(description="Populate only if is_answer_key_page is False")

def extract_page(doc, page_num):
    page = doc.load_page(page_num)
    pix = page.get_pixmap(dpi=150)
    img = Image.open(io.BytesIO(pix.tobytes("png")))

    prompt = """
    Analyze this page from a math book.
    If the page is an "Answer Key" or "Answers" page, set is_answer_key_page=True and extract the question numbers and their corresponding correct options.
    If it is a questions page, set is_answer_key_page=False and extract all math questions.
    
    Important instructions for questions:
    1. Extract the EXACT serial questionNumber printed (e.g. 90). Do not renumber.
    2. Use LaTeX for ALL math formulas and symbols. Wrap inline math in $...$.
    3. Include questionType based on section headers (e.g. "SINGLE CORRECT CHOICE TYPE").
    4. If a question contains a visual graph, diagram, or complex figure, set has_graph=True. Also provide the graph_bbox as [ymin, xmin, ymax, xmax] coordinates normalized from 0 to 1000 representing the bounding box of JUST the graph/figure within the image. If there is no graph, use an empty list.
    
    For Chapters:
    Detect if this page contains the START of a new chapter (e.g. "Chapter 1: Functions"). If yes, set is_new_chapter=True and provide the exact chapter_title.
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
            print(f"Error on page {page_num} (attempt {attempt+1}): {err_msg}", flush=True)
            if "429" in err_msg or "Quota exceeded" in err_msg:
                wait_time = base_wait * (attempt + 1)
                time.sleep(wait_time)
            else:
                time.sleep(5)
    return None

if __name__ == "__main__":
    pdf_path = sys.argv[1]
    start_page = int(sys.argv[2])
    end_page = int(sys.argv[3])
    output_json = sys.argv[4]

    doc = fitz.open(pdf_path)
    
    results = []
    
    for p_num in range(start_page, end_page + 1):
        print(f"Processing page {p_num}...", flush=True)
        res = extract_page(doc, p_num)
        if res:
            res["page_num"] = p_num
            results.append(res)
        time.sleep(15)
            
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
