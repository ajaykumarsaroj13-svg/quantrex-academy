import re

# 1. Update App.jsx to pass testsData to StudentDashboard
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_student_render = "case 'student-dashboard': return <StudentDashboard user={user} courses={courses} setActivePage={setActivePage} setExamTest={setExamTest} syllabus={syllabus} initialClass={initialClass} initialTab={initialTab} initialChapterTab={initialChapterTab} isLight={isLight} onToggleTheme={() => setIsLight(!isLight)} />;"
new_student_render = "case 'student-dashboard': return <StudentDashboard user={user} courses={courses} setActivePage={setActivePage} setExamTest={setExamTest} syllabus={syllabus} initialClass={initialClass} initialTab={initialTab} initialChapterTab={initialChapterTab} isLight={isLight} onToggleTheme={() => setIsLight(!isLight)} testsData={testsData} />;"
content = content.replace(old_student_render, new_student_render)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Update StudentDashboard.jsx
with open('src/pages/StudentDashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import testsData from '../utils/testsData2.json';", "")
content = content.replace("import advancedTestsData from '../utils/advancedTestsData.json';", "")

old_sig = "export default function StudentDashboard({ user, courses, setActivePage, setExamTest, syllabus, initialClass = 'jee-mains', initialTab = 'courses', initialChapterTab = 'videos', isLight, onToggleTheme }) {"
new_sig = "export default function StudentDashboard({ user, courses, setActivePage, setExamTest, syllabus, initialClass = 'jee-mains', initialTab = 'courses', initialChapterTab = 'videos', isLight, onToggleTheme, testsData }) {"
content = content.replace(old_sig, new_sig)

old_active_data = "const activeData = testCategory === 'jee-advanced' ? advancedTestsData : testsData;"
new_active_data = "const activeData = testCategory === 'jee-advanced' ? (testsData?.advanced || []) : (testsData?.mains || []);"
content = content.replace(old_active_data, new_active_data)

with open('src/pages/StudentDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

