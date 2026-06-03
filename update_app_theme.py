import re

filepath = r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\frontend\src\App.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add isLight state
if 'const [isLight, setIsLight] = useState(' not in content:
    content = content.replace(
        "const [testResult, setTestResult] = useState(null);",
        "const [testResult, setTestResult] = useState(null);\n  const [isLight, setIsLight] = useState(() => localStorage.getItem('quantrex_theme') === 'light');"
    )

# 2. Add useEffect to toggle document html class
if 'document.documentElement.classList.toggle(' not in content:
    content = content.replace(
        "useEffect(() => {\n    localStorage.setItem('quantrex_syllabus_v2', JSON.stringify(syllabus));\n  }, [syllabus]);",
        "useEffect(() => {\n    localStorage.setItem('quantrex_syllabus_v2', JSON.stringify(syllabus));\n  }, [syllabus]);\n\n  useEffect(() => {\n    localStorage.setItem('quantrex_theme', isLight ? 'light' : 'dark');\n    document.documentElement.classList.toggle('light', isLight);\n  }, [isLight]);"
    )

# 3. Pass isLight and onToggleTheme to components
# Navbar
content = content.replace(
    "customLogo={customLogo}\n        />",
    "customLogo={customLogo}\n          isLight={isLight}\n          onToggleTheme={() => setIsLight(!isLight)}\n        />"
)

# StudentDashboard
content = content.replace(
    "setExamTest={setExamTest}\n            syllabus={syllabus}\n          />",
    "setExamTest={setExamTest}\n            syllabus={syllabus}\n            isLight={isLight}\n            onToggleTheme={() => setIsLight(!isLight)}\n          />"
)

# TestSeriesPage
content = content.replace(
    "onBack={() => setActivePage(user ? 'student-dashboard' : 'home')}\n          />",
    "onBack={() => setActivePage(user ? 'student-dashboard' : 'home')}\n            isLight={isLight}\n            onToggleTheme={() => setIsLight(!isLight)}\n          />"
)

# TestSeriesExam
content = content.replace(
    "onExit={() => setActivePage('test-series')}\n          />",
    "onExit={() => setActivePage('test-series')}\n            isLight={isLight}\n          />"
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated App.jsx successfully.")
