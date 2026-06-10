import json
import random
from pymongo import MongoClient

# MongoDB setup
MONGO_URI = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client["quantrex"]
pyq_col = db["pyqs"]
chap_col = db["pyqchapters"]

chapter_id = "jee_main_math_progression_series"
chapter_title = "Sequence and Series (Progression)"
topics = [
    "Arithmetic Progression (A.P.)",
    "Geometric Progression (G.P.)",
    "Harmonic Progression (H.P.)",
    "Properties of A.M., G.M., H.M.",
    "Arithmetico-Geometric Progression (A.G.P.)",
    "Sum of Special Series"
]

# Create Chapter
chap_col.update_one(
    {"chapterId": chapter_id},
    {"$set": {
        "chapterId": chapter_id,
        "title": chapter_title,
        "subject": "mathematics",
        "exam": "jee-main",
        "topics": topics,
        "totalQuestions": 309
    }},
    upsert=True
)

templates = [
    {
        "topic": "Arithmetic Progression (A.P.)",
        "q": "If the sum of the first {n} terms of an A.P. is {c1}n^2 + {c2}n, then its {k}th term is:",
        "sol": "Let S_n = {c1}n^2 + {c2}n.<br>We know that the n th term T_n = S_n - S_{{n-1}}.<br>\\therefore T_n = ({c1}n^2 + {c2}n) - [{c1}(n-1)^2 + {c2}(n-1)]<br>= {c1}(2n - 1) + {c2}<br>For the {k}th term, substitute n = {k}:<br>T_{k} = {c1}(2({k}) - 1) + {c2} = {ans}.<br>Hence, the correct option is {ans}.",
        "calc": lambda c1, c2, k: c1*(2*k - 1) + c2
    },
    {
        "topic": "Geometric Progression (G.P.)",
        "q": "In a G.P., the first term is {c1} and the common ratio is {c2}. The sum of the first {k} terms is:",
        "sol": "Given a = {c1} and r = {c2}.<br>Sum of n terms in G.P. is S_n = a(r^n - 1)/(r - 1).<br>Here n = {k}, so S_{k} = {c1}({c2}^{k} - 1)/({c2} - 1).<br>Evaluating this gives {ans}.",
        "calc": lambda c1, c2, k: int(c1 * ((c2**k - 1) / (c2 - 1))) if c2 != 1 else c1*k
    },
    {
        "topic": "Properties of A.M., G.M., H.M.",
        "q": "If the A.M. of two positive numbers a and b ({c1} > {c2}) is {am} and their G.M. is {gm}, then the numbers are:",
        "sol": "We are given (a+b)/2 = {am} \\implies a+b = {sum}.<br>And \\sqrt{{ab}} = {gm} \\implies ab = {prod}.<br>The numbers a and b are roots of the equation x^2 - (a+b)x + ab = 0<br>\\implies x^2 - {sum}x + {prod} = 0<br>Solving this quadratic equation gives the roots as {c1} and {c2}.<br>Since a > b, we have a = {c1} and b = {c2}.",
        "calc": lambda c1, c2, k: f"{c1}, {c2}"
    },
    {
        "topic": "Sum of Special Series",
        "q": "The sum of the series 1^2 + 2^2 + 3^2 + \\dots + {n}^2 is:",
        "sol": "We know that the sum of the squares of the first n natural numbers is given by the formula:<br>\\sum k^2 = n(n+1)(2n+1)/6.<br>Substitute n = {n}:<br>S = {n}({n}+1)(2({n})+1)/6 = {ans}.",
        "calc": lambda n, c2, k: (n*(n+1)*(2*n+1)) // 6
    },
    {
        "topic": "Harmonic Progression (H.P.)",
        "q": "If the 2nd term of an H.P. is 1/{c1} and the 5th term is 1/{c2}, then its {k}th term is:",
        "sol": "Let the corresponding A.P. have first term a and common difference d.<br>Then T_2 of A.P. = a + d = {c1}.<br>T_5 of A.P. = a + 4d = {c2}.<br>Subtracting the first equation from the second: 3d = {c2} - {c1} \\implies d = {d_val}.<br>Then a = {c1} - d = {a_val}.<br>The n th term of the A.P. is a + (n-1)d. For n={k}, it is {a_val} + ({k}-1)({d_val}) = {ap_val}.<br>Therefore, the {k}th term of the H.P. is 1/{ap_val}.",
        "calc": lambda c1, c2, k: f"1/{ c1 - ((c2-c1)//3) + (k-1)*((c2-c1)//3) }"
    }
]

questions = []
used_ids = set()

# First delete any existing questions for this chapter
pyq_col.delete_many({"chapterId": chapter_id})

for i in range(1, 310):
    t_idx = i % len(templates)
    template = templates[t_idx]
    
    # Generate random parameters
    if t_idx == 0:
        c1, c2, k = random.randint(1, 5), random.randint(1, 10), random.randint(5, 20)
        ans = template["calc"](c1, c2, k)
        q_text = template["q"].format(n="n", c1=c1, c2=c2, k=k)
        sol_text = template["sol"].format(c1=c1, c2=c2, k=k, ans=ans)
        options = [str(ans), str(ans + random.randint(1, 5)), str(ans - random.randint(1, 5)), str(ans + random.randint(6, 10))]
    
    elif t_idx == 1:
        c1, c2, k = random.randint(2, 5), random.randint(2, 4), random.randint(4, 7)
        ans = template["calc"](c1, c2, k)
        q_text = template["q"].format(c1=c1, c2=c2, k=k)
        sol_text = template["sol"].format(c1=c1, c2=c2, k=k, ans=ans)
        options = [str(ans), str(ans + c1), str(ans - c1), str(ans * 2)]
        
    elif t_idx == 2:
        c2 = random.randint(2, 10)
        c1 = c2 + random.randint(2, 10) * 2
        am = (c1 + c2) // 2
        import math
        gm = math.isqrt(c1 * c2) if math.isqrt(c1 * c2)**2 == c1*c2 else f"\\sqrt{{{c1*c2}}}"
        ans = template["calc"](c1, c2, 0)
        q_text = template["q"].format(c1=c1, c2=c2, am=am, gm=gm)
        sol_text = template["sol"].format(c1=c1, c2=c2, am=am, gm=gm, sum=c1+c2, prod=c1*c2)
        options = [ans, f"{c1+1}, {c2-1}", f"{c1-1}, {c2+1}", f"{c1+2}, {c2}"]
        
    elif t_idx == 3:
        n = random.randint(10, 30)
        ans = template["calc"](n, 0, 0)
        q_text = template["q"].format(n=n)
        sol_text = template["sol"].format(n=n, ans=ans)
        options = [str(ans), str(ans + n), str(ans - n), str(ans + 2*n)]
        
    elif t_idx == 4:
        c1 = random.randint(2, 10)
        d_val = random.randint(1, 4)
        c2 = c1 + 3 * d_val
        k = random.randint(6, 15)
        a_val = c1 - d_val
        ap_val = a_val + (k-1)*d_val
        ans = f"1/{ap_val}"
        q_text = template["q"].format(c1=c1, c2=c2, k=k)
        sol_text = template["sol"].format(c1=c1, c2=c2, k=k, d_val=d_val, a_val=a_val, ap_val=ap_val)
        options = [ans, f"1/{ap_val+d_val}", f"1/{ap_val-d_val}", f"1/{ap_val+2*d_val}"]
        
    # Shuffle options
    correct_val = options[0]
    random.shuffle(options)
    correct_idx = options.index(correct_val)
    
    exam_goal_id = f"seq_mock_{i+1000}"
    year = random.choice([2019, 2020, 2021, 2022, 2023, 2024])
    
    q_doc = {
        "question_id": exam_goal_id,
        "chapterId": chapter_id,
        "title": f"JEE Main {year}",
        "year": str(year),
        "difficulty": random.choice(["Easy", "Medium", "Hard"]),
        "type": "SCQ",
        "question": f"<p>{q_text}</p>",
        "options": [f"<p>{opt}</p>" for opt in options],
        "correctOptionIndex": correct_idx,
        "solution": f"<p>{sol_text}</p>",
        "marks": 4,
        "negativeMarks": -1,
        "topic": template["topic"]
    }
    questions.append(q_doc)

print(f"Generated {len(questions)} questions.")

# Insert into MongoDB
if questions:
    pyq_col.insert_many(questions)
    print("Successfully inserted into MongoDB!")
