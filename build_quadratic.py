import json
import re

txt_path = r'E:\black book maths\quadraticequation.txt'
out_path = r'E:\quantrexacademy\quadratic_temp.json'

with open(txt_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Transcribed answers
ans_ex1 = "1. d  2. c  3. a  4. b  5. a  6. a  7. b  8. c  9. a 10. d 11. c 12. c 13. a 14. a 15. d 16. d 17. b 18. b 19. c 20. a 21. b 22. d 23. c 24. a 25. d 26. a 27. d 28. c 29. d 30. c 31. d 32. d 33. c 34. d 35. a 36. c 37. b 38. b 39. c 40. c 41. b 42. b 43. c 44. d 45. b 46. c 47. a 48. a 49. c 50. c 51. b 52. b 53. a 54. a 55. c 56. b 57. c 58. a 59. c 60. a 61. c 62. a 63. a 64. c 65. a 66. c 67. a 68. d 69. b 70. d 71. c 72. c 73. c 74. a 75. c 76. c 77. b 78. a 79. b 80. c 81. b 82. a 83. a 84. a 85. b 86. b 87. d 88. b 89. d 90. b 91. b 92. c 93. c 94. b 95. d 96. b 97. b 98. d 99. a 100. b 101. d 102. b 103. c 104. b 105. c 106. d 107. d 108. d 109. c 110. a 111. a 112. b 113. c 114. c 115. b 116. c 117. d 118. d 119. b 120. d 121. d 122. b 123. c 124. b 125. d 126. d 127. c 128. b 129. b 130. b 131. c 132. b 133. b 134. b 135. c 136. d 137. b 138. c 139. a 140. b 141. b 142. d 143. a 144. c 145. a 146. b 147. b 148. b 149. c 150. c 151. b 152. c 153. a"
ans_ex2 = "1. a, c, d; 2. a, b, d; 3. a, c; 4. a, c, d; 5. a, b, c, d; 6. b, c; 7. a, b, c; 8. a, b, d; 9. a, c; 10. a, b, d; 11. a, b, c, d; 12. a, c; 13. b, d; 14. c, d; 15. a, b; 16. b; 17. b, c; 18. a, b, c; 19. a, b, d; 20. a, b, c, d; 21. a, c; 22. a, b, c, d; 23. a, b, d; 24. a, c, d; 25. a, c, d; 26. a, b; 27. b, c; 28. a, b; 29. a, b, d; 30. a, b, c, d; 31. d; 32. a, b; 33. a, c, d; 34. a, b, d; 35. a, b, d; 36. a, c; 37. b, c, d; 38. a, b, c, d; 39. a, d; 40. a, b; 41. b, c; 42. a, b; 43. a, c; 44. a, c, d"
ans_ex3 = "1. c, 2. a, 3. a, 4. c, 5. c, 6. d, 7. a, 8. d, 9. d, 10. b, 11. d, 12. a, 13. a, 14. c, 15. b, 16. d, 17. b, 18. c, 19. c, 20. b, 21. a, 22. c, 23. d"
ans_ex4 = "1. A-Q B-P C-R D-S; 2. A-Q B-S C-R D-P; 3. A-Q B-R C-P D-S; 4. A-Q B-P C-S D-R"
ans_ex5 = "1. 9, 2. 0, 3. 1, 4. 7, 5. 5, 6. 3, 7. 3, 8. 6, 9. 0, 10. 6, 11. 0, 12. 9, 13. 2, 14. 9, 15. 2, 16. 4, 17. 0, 18. 99, 19. 56, 20. 7, 21. 2, 22. 3, 23. 1, 24. 6, 25. 4, 26. 8, 27. 0, 28. 7, 29. 3, 30. 4, 31. 1, 32. 0, 33. 5, 34. 9, 35. 5, 36. 5, 37. 5, 38. 2, 39. 3, 40. 8, 41. 1, 42. 5, 43. 3, 44. 1, 45. 0"

def parse_ans(ans_str, is_multi=False):
    ans_str = ans_str.replace(';', ',')
    parts = re.findall(r'(\d+)\.\s*([a-zA-Z,\s\-]+)', ans_str)
    d = {}
    for num, val in parts:
        val = val.strip()
        if is_multi:
            val = val.replace(',', '').replace(' ', '')
        d[int(num)] = val
    return d

a1 = parse_ans(ans_ex1)
a2 = parse_ans(ans_ex2, True)
a3 = parse_ans(ans_ex3)
a4 = parse_ans(ans_ex4)
a5 = parse_ans(ans_ex5)

# Split exercises
ex_blocks = re.split(r'\*\*Exercise-\d+\s*:.*?\*\*', text)
# Find exercise names
ex_names = re.findall(r'\*\*(Exercise-\d+\s*:.*?)\*\*', text)

questions = []

opt_map = {'a':0, 'b':1, 'c':2, 'd':3}

for i, ex_name in enumerate(ex_names):
    block = ex_blocks[i+1]
    
    # We will match `**1.** something`
    q_matches = list(re.finditer(r'\*\*(\d+)\.\*\*(.*?)(?=\*\*\d+\.\*\*|\Z)', block, re.DOTALL))
    
    if 'Exercise-1' in ex_name:
        for m in q_matches:
            q_num = int(m.group(1))
            q_text = m.group(2).strip()
            
            # Find options (a) ... (b) ... (c) ... (d) ...
            opt_match = re.search(r'\(a\)(.*?)\(b\)(.*?)\(c\)(.*?)\(d\)(.*)', q_text, re.DOTALL)
            options = []
            if opt_match:
                q_title = q_text[:opt_match.start()].strip()
                options = [opt_match.group(1).strip(), opt_match.group(2).strip(), opt_match.group(3).strip(), opt_match.group(4).strip()]
            else:
                q_title = q_text
                options = []
            
            # Strip trailing dot from options
            options = [o.rstrip('.') for o in options]
                
            q_obj = {
                "questionNumber": q_num,
                "exerciseName": "Exercise 1",
                "title": f"<p>{q_title}</p>",
                "typeLabel": "SCQ",
                "options": [f"<p>{o}</p>" for o in options]
            }
            if q_num in a1:
                ans_char = a1[q_num]
                if ans_char in opt_map:
                    q_obj["correctOption"] = opt_map[ans_char]
                q_obj["answerKeyStr"] = ans_char
            questions.append(q_obj)
            
    elif 'Exercise-2' in ex_name:
        for m in q_matches:
            q_num = int(m.group(1))
            q_text = m.group(2).strip()
            
            opt_match = re.search(r'\(a\)(.*?)\(b\)(.*?)\(c\)(.*?)\(d\)(.*)', q_text, re.DOTALL)
            options = []
            if opt_match:
                q_title = q_text[:opt_match.start()].strip()
                options = [opt_match.group(1).strip(), opt_match.group(2).strip(), opt_match.group(3).strip(), opt_match.group(4).strip()]
            else:
                q_title = q_text
            
            options = [o.rstrip('.') for o in options]
                
            q_obj = {
                "questionNumber": q_num,
                "exerciseName": "Exercise 2",
                "title": f"<p>{q_title}</p>",
                "typeLabel": "MCQ",
                "options": [f"<p>{o}</p>" for o in options]
            }
            if q_num in a2:
                ans_str = a2[q_num]
                q_obj["correctOptionsArray"] = [opt_map[c] for c in ans_str if c in opt_map]
                q_obj["answerKeyStr"] = ans_str
            questions.append(q_obj)
            
    elif 'Exercise-3' in ex_name:
        # Comprehension type
        # Split by paragraph
        paras = re.split(r'Paragraph for Question Nos\..*', block)
        # Wait, the user text file didn't include the paragraph text perfectly, let's just parse the questions
        for m in q_matches:
            q_num = int(m.group(1))
            q_text = m.group(2).strip()
            
            opt_match = re.search(r'\(a\)(.*?)\(b\)(.*?)\(c\)(.*?)\(d\)(.*)', q_text, re.DOTALL)
            options = []
            if opt_match:
                q_title = q_text[:opt_match.start()].strip()
                options = [opt_match.group(1).strip(), opt_match.group(2).strip(), opt_match.group(3).strip(), opt_match.group(4).strip()]
            else:
                q_title = q_text
            options = [o.rstrip('.') for o in options]
                
            q_obj = {
                "questionNumber": q_num,
                "exerciseName": "Exercise 3",
                "title": f"<p>{q_title}</p>",
                "typeLabel": "COMPREHENSION",
                "options": [f"<p>{o}</p>" for o in options]
            }
            if q_num in a3:
                ans_char = a3[q_num]
                if ans_char in opt_map:
                    q_obj["correctOption"] = opt_map[ans_char]
                q_obj["answerKeyStr"] = ans_char
            questions.append(q_obj)
            
    elif 'Exercise-4' in ex_name:
        # Matching Type
        for m in q_matches:
            q_num = int(m.group(1))
            q_text = m.group(2).strip()
            q_title = q_text.replace('\n', '<br/>')
            
            q_obj = {
                "questionNumber": q_num,
                "exerciseName": "Exercise 4",
                "title": f"<p>{q_title}</p>",
                "typeLabel": "MATCHING",
                "options": []
            }
            if q_num in a4:
                q_obj["answerKeyStr"] = a4[q_num]
            questions.append(q_obj)

    elif 'Exercise-5' in ex_name:
        # Subjective
        for m in q_matches:
            q_num = int(m.group(1))
            q_title = m.group(2).strip().replace('\n', '<br/>')
            
            q_obj = {
                "questionNumber": q_num,
                "exerciseName": "Exercise 5",
                "title": f"<p>{q_title}</p>",
                "typeLabel": "SUBJECTIVE",
                "options": []
            }
            if q_num in a5:
                q_obj["answerKeyStr"] = str(a5[q_num])
            questions.append(q_obj)

chapter_data = {
    "id": "adv-quadratic-equations",
    "title": "Quadratic Equations",
    "description": "Advanced Problems in Mathematics for JEE - Quadratic Equations",
    "questions": questions
}

with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(chapter_data, f, ensure_ascii=False, indent=2)

print(f"Parsed {len(questions)} questions!")
