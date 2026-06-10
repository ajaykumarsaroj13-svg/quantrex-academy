import json
import re

file_path = 'C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\quantrexacadmy\\limits_extracted_manual.json'

with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Answers mapping
ex1_answers = {
    1: 'b', 2: 'd', 3: 'd', 4: 'd', 5: 'b', 6: 'b', 7: 'd', 8: 'a', 9: 'c', 10: 'b',
    11: 'a', 12: 'a', 13: 'b', 14: 'd', 15: 'b', 16: 'a', 17: 'c', 18: 'a', 19: 'a', 20: 'c',
    21: 'c', 22: 'c', 23: 'a', 24: 'd', 25: 'c', 26: 'a', 27: 'd', 28: 'c', 29: 'd', 30: 'd',
    31: 'c', 32: 'a', 33: 'c', 34: 'd', 35: 'b', 36: 'c', 37: 'a', 38: 'b', 39: 'b', 40: 'b',
    41: 'a', 42: 'd', 43: 'd', 44: 'c', 45: 'b', 46: 'd', 47: 'a', 48: 'c', 49: 'a', 50: 'c',
    51: 'a', 52: 'b', 53: 'c', 54: 'c'
}

ex2_answers = {
    1: ['b', 'c'], 2: ['a', 'c', 'd'], 3: ['a', 'b', 'c'], 4: ['a', 'c'], 5: ['b', 'c'], 6: ['a', 'c'],
    7: ['a', 'd'], 8: ['a', 'c', 'd'], 9: ['b', 'c'], 10: ['a', 'd'], 11: ['b', 'd'], 12: ['a', 'c'],
    13: ['c', 'd'], 14: ['c'], 15: ['a', 'b'], 16: ['b']
}

ex3_answers = {
    1: 'a', 2: 'b', 3: 'b', 4: 'c', 5: 'd', 6: 'c', 7: 'd', 8: 'c', 9: 'd', 10: 'c', 11: 'c'
}

ex4_answers = {
    1: "A->P; B->Q; C->R; D->S",
    2: "A->Q; B->P; C->S; D->Q"
}

ex5_answers = {
    1: "2", 2: "8", 3: "1", 4: "5", 5: "2", 6: "1", 7: "0"
}

def letter_to_index(l):
    return ord(l) - ord('a')

for d in data:
    ex = d.get('exerciseName')
    qn = d.get('questionNumber')
    
    if ex == 'Exercise-1 : Single Choice Problems':
        ans = ex1_answers.get(qn)
        if ans: d['correctOption'] = letter_to_index(ans)
    elif ex == 'Exercise-2 : Multiple Choice Problems':
        ans = ex2_answers.get(qn)
        if ans: d['correctOptionsArray'] = [letter_to_index(x) for x in ans]
    elif ex == 'Exercise-3 : Comprehension Type Problems':
        ans = ex3_answers.get(qn)
        if ans: d['correctOption'] = letter_to_index(ans)
    elif ex == 'Exercise-4 : Matching Type Problems':
        ans = ex4_answers.get(qn)
        if ans: d['answerKeyStr'] = ans
    elif ex == 'Exercise-5 : Subjective Type Problems':
        ans = ex5_answers.get(qn)
        if ans: d['answerKeyStr'] = ans

    text = d.get('text', '')
    if '**' in text:
        # replace **Paragraph for...** with KaTeX text
        # e.g., **Paragraph for Question Nos. 1 to 2** -> $$\text{\textbf{Paragraph for Question Nos. 1 to 2}}$$
        text = re.sub(r'\*\*(.*?)\*\*', r'$$\\text{\\textbf{\1}}$$ ', text)
        d['text'] = text

    if ex == 'Exercise-4 : Matching Type Problems':
        if qn == 1:
            table_latex = r"""$$
\begin{array}{|l|l|}
\hline
\text{\textbf{Column-I}} & \text{\textbf{Column-II}} \\
\hline
\text{\textbf{(A)} } \lim_{n \to \infty} \left( \frac{1 + \sqrt[n]{4}}{2} \right)^n = & \text{\textbf{(P)} } 2 \\
\text{\textbf{(B)} } \text{Let } f(x) = \lim_{n \to \infty} \frac{2x}{\pi} \tan^{-1} (nx), \text{then } \lim_{x \to 0^+} f(x) = & \text{\textbf{(Q)} } 0 \\
\text{\textbf{(C)} } \lim_{x \to \frac{\pi}{2}^-} \frac{\cos(\tan^{-1}(\tan x))}{x - \frac{\pi}{2}} = & \text{\textbf{(R)} } 1 \\
\text{\textbf{(D)} } \text{If } \lim_{x \to 0^+} (x)^{\frac{1}{\ln \sin x}} = e^L, \text{then } L + 2 = & \text{\textbf{(S)} } 3 \\
& \text{\textbf{(T)} } \text{Non-existent} \\
\hline
\end{array}
$$"""
            d['text'] = "Match the columns:\n\n" + table_latex

        elif qn == 2:
            table_latex = r"""$$
\begin{array}{|l|l|}
\hline
\text{\textbf{Column-I}} & \text{\textbf{Column-II}} \\
\hline
\text{\textbf{(A)} } \text{If } f(x) = \sin^{-1} x \text{ and } \lim_{x \to \frac{1}{2}^+} f(3x - 4x^3) = a - 3 \lim_{x \to \frac{1}{2}^-} f(x), \text{then } [a] = & \text{\textbf{(P)} } 2 \\
\text{\textbf{(B)} } \text{If } f(x) = \tan^{-1} g(x) \text{ where } g(x) = \frac{3x - x^3}{1 - 3x^2} \text{ and then find } \left[ \lim_{h \to 0} \frac{f\left(\frac{1}{2} + 6h\right) - f\left(\frac{1}{2}\right)}{6h} \right] = & \text{\textbf{(Q)} } 3 \\
\text{\textbf{(C)} } \text{If } \cos^{-1} (4x^3 - 3x) = a + b \cos^{-1} x \text{ for } -1 < x < \frac{-1}{2}, \text{then } [a + b + 2] = & \text{\textbf{(R)} } 4 \\
\text{\textbf{(D)} } \text{If } f(x) = \cos^{-1} (4x^3 - 3x) \text{ and } \lim_{x \to \frac{1}{2}^+} f'(x) = a \text{ and } \lim_{x \to \frac{1}{2}^-} f'(x) = b, \text{then } a + b + 3 = & \text{\textbf{(S)} } -2 \\
& \text{\textbf{(T)} } \text{Non-existent} \\
\hline
\end{array}
$$"""
            d['text'] = "$[\\cdot]$ represents greatest integer function :\n\n" + table_latex

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Finished updating JSON.")
