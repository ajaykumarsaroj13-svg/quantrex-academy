import re

with open('src/pages/TestSeriesPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove static imports
content = content.replace("import testsData2 from '../utils/testsData2.json';", "")
content = content.replace("import advancedTestsData from '../utils/advancedTestsData.json';", "")

# Update signature
old_sig = "export default function TestSeriesPage({ user, onStartTest, onBack }) {"
new_sig = "export default function TestSeriesPage({ user, onStartTest, onBack, testsData }) {"
content = content.replace(old_sig, new_sig)

# Replace local activeTests computation
old_active = """  const activeTests = selectedCategory === 'jee-main' 
    ? testsData2 
    : advancedTestsData;"""

new_active = """  const activeTests = selectedCategory === 'jee-main' 
    ? (testsData?.mains || []) 
    : (testsData?.advanced || []);"""
content = content.replace(old_active, new_active)

with open('src/pages/TestSeriesPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
