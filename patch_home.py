import re

with open('src/pages/Home.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Update signature
old_sig = "export default function Home({ user, setActivePage, courses, setCourses, toppers, onStartLearning }) {"
new_sig = "export default function Home({ user, setActivePage, courses, setCourses, toppers, onStartLearning, homeData }) {"
content = content.replace(old_sig, new_sig)

# Replace Hero texts
content = content.replace("Dominate JEE Math with", "{homeData?.heroTitle || 'Dominate JEE Math with'}")
content = content.replace("Quantrex Academy", "{homeData?.heroSubtitle || 'Quantrex Academy'}")
content = content.replace("Master JEE Main and Advanced Mathematics with A.K. Sir. Access premium video lectures, complete syllabus coverage, structured mock tests, and smart PYQ analytics.", "{homeData?.heroDescription || 'Master JEE Main and Advanced Mathematics with A.K. Sir. Access premium video lectures, complete syllabus coverage, structured mock tests, and smart PYQ analytics.'}")

# For features, if homeData?.features exist, we can render them or just keep the hardcoded ones if not.
# We can just keep it simple. The user asked for "Home Page text" changes. I'll just leave features as they are for now, or just map them if they exist. Let's just do the main texts.

with open('src/pages/Home.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
