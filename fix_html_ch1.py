import json
import re

with open(r'C:\Users\Admin\.gemini\antigravity\scratch\quantrexacadmy\src\utils\blackBookDataFull.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for chap in data:
    if chap.get('chapterNumber') == 1:
        for q in chap.get('questions', []):
            if q.get('questionType') == 'MATCH THE COLUMN':
                text = q.get('text', '')
                
                # Q1
                if q.get('questionNumber') == 1:
                    q['text'] = r"""Match the statements of Column I with values of Column II.

$$
\begin{array}{|l|l|}
\hline
\text{\textbf{Column-I}} & \text{\textbf{Column-II}} \\
\hline
\text{\textbf{(A)} } \text{If } f(x) = \frac{x}{1+x} \text{ and } g(x) = f(f(x)) \text{, then } g'(x) \text{ at } x=1 \text{ is} & \text{\textbf{(P)} } \text{is bounded} \\
\text{\textbf{(B)} } \text{The function } f(x) = \sin(x) + \cos(x) & \text{\textbf{(Q)} } \frac{1}{4} \\
\text{\textbf{(C)} } \text{The period of } f(x) = \sin^4(x) + \cos^4(x) \text{ is} & \text{\textbf{(R)} } \frac{\pi}{2} \\
\text{\textbf{(D)} } \text{If } f(x) = x^3 + x \text{, then } f^{-1}(2) \text{ is} & \text{\textbf{(S)} } 1 \\
\hline
\end{array}
$$"""
                # Q2
                elif q.get('questionNumber') == 2:
                    q['text'] = r"""Match the functions in Column I with their properties in Column II.

$$
\begin{array}{|l|l|}
\hline
\text{\textbf{Column-I}} & \text{\textbf{Column-II}} \\
\hline
\text{\textbf{(A)} } f(x) = \frac{x}{|x|} & \text{\textbf{(P)} } \text{Continuous everywhere} \\
\text{\textbf{(B)} } f(x) = x|x| & \text{\textbf{(Q)} } \text{Discontinuous at } x=0 \\
\text{\textbf{(C)} } f(x) = [x] & \text{\textbf{(R)} } \text{Non-differentiable at } x=0 \\
\text{\textbf{(D)} } f(x) = \sin(|x|) & \text{\textbf{(S)} } \text{Discontinuous at integer points} \\
\hline
\end{array}
$$"""
                # Q3
                elif q.get('questionNumber') == 3:
                    q['text'] = r"""Given the graph of $y = f(x)$ below:

Match the functions in Column-I with their correct graphs in Column-II:

$$
\begin{array}{|l|l|}
\hline
\text{\textbf{Column-I (Function)}} & \text{\textbf{Column-II (Graph)}} \\
\hline
\text{\textbf{(A)} } y = f(1-x) \text{ [Reflection about } x = \frac{1}{2} \text{]} & \text{\textbf{(P)} } \text{Graph shifted: passes through } (-1,-2), (0,0), (1,1), (2,0) \\
\text{\textbf{(B)} } y = f(2x) \text{ [Horizontal compression by 2]} & \text{\textbf{(Q)} } \text{Original } f(x) \text{ — peaks at } (0,1) \\
\text{\textbf{(C)} } y = -2f(x) \text{ [Vertical flip and scale } \times 2 \text{]} & \text{\textbf{(R)} } \text{Graph compressed: peaks at } (0,1) \text{, x-range } [-\frac{1}{2}, 1] \\
\text{\textbf{(D)} } y = 1 - f(x) \text{ [Vertical flip + shift up 1]} & \text{\textbf{(S)} } \text{Graph: passes through } (-1,0) \text{, minimum } (0,-2) \text{, passes through } (1,0) \text{, to } (2,4) \\
\hline
\end{array}
$$"""
                    q['imageUrl'] = '/images/ex4_q7_original.png'
                    q['imageUrl2'] = '/images/ex4_q7_options.png'
                    q['has_graph'] = True

with open(r'C:\Users\Admin\.gemini\antigravity\scratch\quantrexacadmy\src\utils\blackBookDataFull.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print('Updated Chapter 1 Match The Column questions.')
