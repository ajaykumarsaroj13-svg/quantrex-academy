import os
import time
import json
import uuid
from playwright.sync_api import sync_playwright

TESTS_DIR = os.path.join("public", "data", "tests")
CATALOG_FILE = os.path.join("public", "data", "jee_main_ultimate_series_2027.json")

def clean_html_latex(text):
    if not text:
        return ""
    text = text.replace("ExamGoal", "Quantrex Academy")
    text = text.replace("examgoal", "quantrex academy")
    text = text.replace("Examgoal", "Quantrex Academy")
    return text

def map_question(q, idx):
    q_type = q.get('type')
    subject = q.get('subject', 'Physics').capitalize()
    
    en = q.get('question', {}).get('en', {})
    question_text = clean_html_latex(en.get('content', ''))
    solution = clean_html_latex(en.get('explanation', ''))
    
    raw_options = en.get('options', [])
    options = []
    option_letters = ['A', 'B', 'C', 'D']
    for i, opt in enumerate(raw_options):
        letter = option_letters[i] if i < len(option_letters) else '?'
        content = clean_html_latex(opt.get('content', ''))
        options.append(f"({letter}) {content}")
        
    correct_option = None
    correct_answer = None
    
    if q_type in ['mcq', 'multiple-choice']:
        correct_opts = en.get('correct_options', [])
        if correct_opts:
            letter = correct_opts[0]
            if letter in option_letters:
                correct_option = option_letters.index(letter)
                correct_answer = letter
    else:
        q_type = 'NUMERICAL'
        ans = en.get('answer')
        if ans is not None:
            correct_answer = str(ans)
            
    return {
        "id": q.get('questionId', str(uuid.uuid4())),
        "questionNumber": idx + 1,
        "questionText": question_text,
        "options": options,
        "correctOption": correct_option,
        "correctAnswer": correct_answer,
        "questionType": "MCQ" if q_type in ['mcq', 'multiple-choice'] else "NUMERICAL",
        "marks": q.get('marks', 4),
        "negativeMarks": q.get('negMarks', -1),
        "subject": subject,
        "topic": q.get('topic', ''),
        "difficulty": q.get('difficulty', 'Medium').capitalize(),
        "solution": solution,
        "section": q.get('section', 'Sec 1') or 'Sec 1',
        "instruction": ""
    }

def scrape_test(page, test_id):
    url = f"https://room.examgoal.com/tests/{test_id}/prepare"
    print(f"Navigating to {url} ...")
    page.goto(url, wait_until="networkidle")
    time.sleep(2.5)
    
    page.keyboard.press("Escape")
    time.sleep(0.5)
    
    if "Choose your exam" in page.content():
        try:
            page.click('text=JEE Main', timeout=3000)
            time.sleep(0.5)
            page.keyboard.press("Escape")
            time.sleep(0.5)
        except:
            pass
            
    start_btn = page.query_selector('button:has-text("Start Test")')
    if not start_btn:
        if "analysis" in page.url or "View Solutions" in page.content():
            print("  Test already attempted.")
        else:
            raise Exception("Start Test button not found")
            
    if start_btn:
        start_btn.click()
        for i in range(10):
            time.sleep(1)
            if "layouts/nta" in page.url:
                break
                
    js_code = """
    async (testId) => {
        const testDetailsRes = await fetch(`/api/v1/test/user/test/${testId}?out_of_syllabus=false`);
        const testDetails = await testDetailsRes.json();
        const qIds = [];
        const sections = testDetails.data.sections || [];
        for (const s of sections) {
            for (const q of (s.questions || [])) {
                qIds.push(q.questionId);
            }
        }
        if (qIds.length === 0) return { error: "No question IDs found" };
        
        const sessionConfigRes = await fetch(`/api/v1/test/user/session/${testId}`);
        const sessionConfig = await sessionConfigRes.json();
        let sessionId = sessionConfig.data?.sessionId;
        if (!sessionId) {
            sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
        
        const nowIso = new Date().toISOString();
        const savePayload = {
            testId: testId, sessionId: sessionId, timeSpent: 5000, language: "en",
            lastQuestionId: qIds[0],
            state: { [qIds[0]]: { ir: false, si: [], ip: null, st: "seen", ts: 5000, ma: 0, nma: 0 } },
            layout: 1, lastAttempted: nowIso, metadata: { options: { outOfSyllabus: false } }
        };
        
        await fetch('/api/v1/test/user/session', {
            method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(savePayload)
        });
        
        await fetch('/api/v1/test/user/test', {
            method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ testId: testId })
        });
        
        const solutionsRes = await fetch(`/api/v1/test/user/analysis/${sessionId}/questions`, {
            method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ questionIds: qIds })
        });
        const solutionsData = await solutionsRes.json();
        
        return { sessionId: sessionId, solutionsData: solutionsData };
    }
    """
    
    result = page.evaluate(js_code, test_id)
    sol_data = result.get('solutionsData', {})
    results = sol_data.get('results', [])
    
    questions = []
    q_idx = 0
    for section in results:
        for q in section.get('questions', []):
            mapped_q = map_question(q, q_idx)
            questions.append(mapped_q)
            q_idx += 1
            
    return questions

def login_and_run():
    print("Starting daily sync...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        page = context.new_page()
        
        print("Logging in to ExamGoal...")
        page.goto("https://accounts.examgoal.com/login", wait_until="networkidle")
        time.sleep(2)
        page.click("text=Phone")
        time.sleep(1)
        page.fill('input[placeholder="Enter Phone Number"]', '7750858874')
        page.fill('input[placeholder="Password"]', '12345678')
        page.click('button:has-text("Login")')
        
        for step in range(8):
            time.sleep(1.5)
            if "dashboard" in page.url or "room.examgoal.com" in page.url:
                print("Successfully logged in!")
                break
        
        print("Fetching Ultimate Series Catalog...")
        page.goto("https://room.examgoal.com/api/v1/test/user/series/658b45ab10bd1e779c1356f9?type=ultimate")
        time.sleep(2)
        catalog_text = page.inner_text("body")
        try:
            catalog = json.loads(catalog_text)
        except:
            print("Failed to load catalog.")
            browser.close()
            return
            
        all_tests = []
        for cat in catalog.get('data', {}).get('category', []):
            category_name = cat.get('title', cat.get('id'))
            for grp in cat.get('groups', []):
                group_name = grp.get('title', grp.get('id'))
                for sec in grp.get('sections', []):
                    section_name = sec.get('title', '')
                    for t in sec.get('tests', []):
                        all_tests.append({
                            "testId": t['testId'],
                            "title": t['title'].replace("ExamGoal", "Quantrex Academy"),
                            "category": category_name,
                            "groupName": group_name,
                            "sectionName": section_name,
                            "isUpcoming": t.get('isUpcoming', False),
                            "durationMinutes": int(t.get('timeAllotted', 10800000) / 60000),
                            "maxMarks": t.get('maxMarks', 300),
                        })
                        
        live_tests = [t for t in all_tests if not t['isUpcoming']]
        print(f"Total live tests in catalog: {len(live_tests)}")
        
        updated_count = 0
        os.makedirs(TESTS_DIR, exist_ok=True)
        
        for idx, test in enumerate(live_tests):
            test_id = test['testId']
            title = test['title']
            
            test_file_path = os.path.join(TESTS_DIR, f"{test_id}.json")
            if os.path.exists(test_file_path):
                try:
                    with open(test_file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        if data.get('questions') and len(data['questions']) > 0:
                            # If solution is present in first question, it's already fully synced
                            q0 = data['questions'][0]
                            if q0.get('solution') and q0['solution'].strip() != "":
                                continue 
                except:
                    pass
                
            print(f"Syncing new test or fixing missing solutions: {title} ({test_id})")
            try:
                questions = scrape_test(page, test_id)
                test_doc = {
                    "id": test_id,
                    "title": title,
                    "examType": "JEE Main",
                    "year": "2027",
                    "duration": test['durationMinutes'],
                    "totalMarks": test['maxMarks'],
                    "totalQuestions": len(questions),
                    "questions": questions,
                    "category": test['category'],
                    "groupName": test['groupName'],
                    "sectionName": test['sectionName'],
                }
                
                with open(test_file_path, 'w', encoding='utf-8') as f:
                    json.dump(test_doc, f, indent=2)
                    
                print("  => Saved to JSON.")
                updated_count += 1
                time.sleep(1)
            except Exception as e:
                print(f"  Failed: {e}")
                
        # Also save the catalog itself
        with open(CATALOG_FILE, 'w', encoding='utf-8') as f:
            json.dump(live_tests, f, indent=2)
            
        browser.close()
        print(f"Daily automation run complete! Updated {updated_count} tests.")

if __name__ == "__main__":
    login_and_run()
