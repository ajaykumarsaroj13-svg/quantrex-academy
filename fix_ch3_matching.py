import json

file_path = r"C:\Users\Admin\.gemini\antigravity\scratch\quantrexacadmy\src\utils\blackBookDataFull.json"

with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Find Continuity chapter
chapter = next((c for c in data if c["id"] == "jee-mathematics-continuity"), None)

if chapter:
    for q in chapter["questions"]:
        if q.get("questionType") == "MATCH THE COLUMN":
            num = q.get("questionNumber")
            if num == 1:
                q["text"] = (
                    "Match the following:\n\n"
                    "$$\n"
                    "\\begin{array}{|l|l|}\n"
                    "\\hline\n"
                    "\\text{\\textbf{Column-I}} & \\text{\\textbf{Column-II}} \\\\\n"
                    "\\hline\n"
                    "\\text{\\textbf{(A)}} If $\\displaystyle \\int_{0}^{\\pi} \\frac{\\log \\sin x}{\\cos^2 x} dx = -K$ then the value of $\\displaystyle \\frac{3k}{\\pi}$ is greater than & \\text{\\textbf{(P)}} $0$ \\\\\n"
                    "\\text{\\textbf{(B)}} If $e^{x+y} + e^{y-x} = 1$ and $y'' - (y')^2 + K = 0$, then $K$ is equal to & \\text{\\textbf{(Q)}} $1$ \\\\\n"
                    "\\text{\\textbf{(C)}} If $f(x) = x \\ln x$ then $2(f^{-1})'(\\ln 4)$ is more than & \\text{\\textbf{(R)}} $2$ \\\\\n"
                    "\\text{\\textbf{(D)}} $\\displaystyle \\lim_{x \\to \\infty} (x \\ln x)^{\\frac{1}{x^2+1}}$ is less than & \\text{\\textbf{(S)}} $4$ \\\\\n"
                    " & \\text{\\textbf{(T)}} $5$ \\\\\n"
                    "\\hline\n"
                    "\\end{array}\n"
                    "$$"
                )
                q["options"] = []
                print("Fixed Q1")
            elif num == 2:
                q["text"] = (
                    "Let $\\displaystyle f(x) = \\begin{cases} [x] & , -2 \\le x < 0 \\\\ |x| & , 0 \\le x \\le 2 \\end{cases}$\n"
                    "(where $[\\cdot]$ denotes the greatest integer function) $\\displaystyle g(x) = \\sec x, x \\in R - (2n+1)\\frac{\\pi}{2}, n \\in I$\n\n"
                    "Match the following statements in column I with their values in column II in the interval $\\displaystyle \\left(-\\frac{3\\pi}{2}, \\frac{3\\pi}{2}\\right)$.\n\n"
                    "$$\n"
                    "\\begin{array}{|l|l|}\n"
                    "\\hline\n"
                    "\\text{\\textbf{Column-I}} & \\text{\\textbf{Column-II}} \\\\\n"
                    "\\hline\n"
                    "\\text{\\textbf{(A)}} Abscissa of points where limit of $fog(x)$ exist is/are & \\text{\\textbf{(P)}} $-1$ \\\\\n"
                    "\\text{\\textbf{(B)}} Abscissa of points in domain of $gof(x)$, where limit of $gof(x)$ does not exist is/are & \\text{\\textbf{(Q)}} $\\pi$ \\\\\n"
                    "\\text{\\textbf{(C)}} Abscissa of points of discontinuity of $fog(x)$ is/are & \\text{\\textbf{(R)}} $\\displaystyle \\frac{5\\pi}{6}$ \\\\\n"
                    "\\text{\\textbf{(D)}} Abscissa of points of differentiability of $fog(x)$ is/are & \\text{\\textbf{(S)}} $-\\pi$ \\\\\n"
                    " & \\text{\\textbf{(T)}} $0$ \\\\\n"
                    "\\hline\n"
                    "\\end{array}\n"
                    "$$"
                )
                q["options"] = []
                print("Fixed Q2")
            elif num == 3:
                q["text"] = (
                    "Let a function $f(x) = [x]\\{x\\} - |x|$ where $[\\cdot]$, $\\{\\cdot\\}$ are greatest integer and fractional part respectively then match the following List-I with List-II.\n\n"
                    "$$\n"
                    "\\begin{array}{|l|l|}\n"
                    "\\hline\n"
                    "\\text{\\textbf{Column-I}} & \\text{\\textbf{Column-II}} \\\\\n"
                    "\\hline\n"
                    "\\text{\\textbf{(A)}} $f(x)$ is continuous at $x$ equal to & \\text{\\textbf{(P)}} $3$ \\\\\n"
                    "\\text{\\textbf{(B)}} $\\displaystyle \\frac{4}{3} \\int_{2}^{3} f(x)dx$ is equal to & \\text{\\textbf{(Q)}} $1$ \\\\\n"
                    "\\hline\n"
                    "\\end{array}\n"
                    "$$"
                )
                q["options"] = []
                print("Fixed Q3")

with open(file_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print("Updated file successfully!")
