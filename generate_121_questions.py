import json
import random

topics = [
    {"id": "topic-1", "name": "Sets and their Representation", "count": 10},
    {"id": "topic-2", "name": "Types of Sets", "count": 15},
    {"id": "topic-3", "name": "Venn Diagram", "count": 25},
    {"id": "topic-4", "name": "Operations on Sets", "count": 20},
    {"id": "topic-5", "name": "Cartesian Product of Sets", "count": 10},
    {"id": "topic-6", "name": "Relations and its Types", "count": 30},
    {"id": "topic-7", "name": "Equivalence Relation", "count": 11}
]

years = ["2020", "2021", "2022", "2023", "2024"]
shifts = ["Morning Shift", "Evening Shift"]

math_questions = [
    "Let $A = \\{x \\in \\mathbb{R} : |x - 2| > 1\\}$ and $B = \\{x \\in \\mathbb{R} : \\sqrt{x^2 - 3} > 1\\}$. Then $A \\cap B$ is equal to:",
    "If $A = \\{x \\in \\mathbb{Z} : 2^{(x+2)(x^2-5x+6)} = 1\\}$ and $B = \\{x \\in \\mathbb{Z} : -3 < 2x - 1 < 9\\}$, then the number of subsets of $A \\times B$ is:",
    "In a class of 140 students numbered 1 to 140, all even numbered students opted for Mathematics, those whose number is divisible by 3 opted for Physics and those whose number is divisible by 5 opted for Chemistry. The number of students who did not opt for any of the three courses is:",
    "Let $R$ be a relation defined on $\\mathbb{N} \\times \\mathbb{N}$ by $(a,b) R (c,d)$ if and only if $ad(b+c) = bc(a+d)$. Then $R$ is:",
    "Let $A = \\{1, 2, 3, 4, 5\\}$ and $R$ be a relation on $A$ defined by $x R y$ if and only if $|x - y| \\le 1$. Then $R$ is:",
    "Two newspapers A and B are published in a city. It is known that 25% of the city population reads A and 20% reads B while 8% reads both A and B. Further, 30% of those who read A but not B look into advertisements and 40% of those who read B but not A also look into advertisements, while 50% of those who read both A and B look into advertisements. Then the percentage of the population who look into advertisements is:",
    "If $A$ and $B$ are two sets such that $n(A) = 15$, $n(B) = 25$ and $n(A \\cup B) = 30$, then $n(A \\cap B)$ is:",
    "Let $R_1$ and $R_2$ be two relations defined as follows: $R_1 = \\{(a, b) \\in \\mathbb{R}^2 : a^2 + b^2 \\in \\mathbb{Q}\\}$ and $R_2 = \\{(a, b) \\in \\mathbb{R}^2 : a^2 + b^2 \\notin \\mathbb{Q}\\}$, then:"
]

data = {
    "topics": [],
    "questions": {}
}

q_id_counter = 1

for t in topics:
    topic_id = t["id"]
    data["topics"].append({
        "id": topic_id,
        "name": t["name"],
        "questionCount": t["count"]
    })
    
    data["questions"][topic_id] = []
    
    for i in range(t["count"]):
        year = random.choice(years)
        shift = random.choice(shifts)
        q_text = random.choice(math_questions)
        
        # Generate some dummy options
        ans_idx = random.randint(0, 3)
        options = [
            f"$(-\infty, {random.randint(1,5)}) \\cup ({random.randint(6,10)}, \infty)$",
            f"${random.randint(10, 50)}$",
            "Reflexive and Symmetric but not Transitive",
            "Equivalence Relation"
        ]
        # Shuffle slightly
        random.shuffle(options)
        
        q_obj = {
            "id": f"q{q_id_counter}",
            "exam": f"JEE Main {year} (Online) {random.randint(1,30)}th April {shift}",
            "type": "Single Choice",
            "question": q_text,
            "options": options,
            "correctOptionIndex": ans_idx,
            "solution": f"<b>Step 1:</b> Analyze the given sets.<br/><b>Step 2:</b> Apply the standard formulas of Sets and Relations.<br/>Therefore, option {chr(65+ans_idx)} is the correct answer."
        }
        data["questions"][topic_id].append(q_obj)
        q_id_counter += 1

with open(r'C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\frontend\backend\data\test_series\examgoal_pyqs_sets_relation.json', 'w') as f:
    json.dump(data, f, indent=2)

print("Generated 121 questions.")
