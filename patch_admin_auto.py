import re

with open('src/pages/AdminDashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update signature
old_sig = "export default function AdminDashboard({ user, courses, setCourses, setCustomLogo, syllabus, setSyllabus, toppers, setToppers }) {"
new_sig = "export default function AdminDashboard({ user, courses, setCourses, setCustomLogo, syllabus, setSyllabus, toppers, setToppers, homeData, setHomeData, booksData, setBooksData, testsData, setTestsData }) {"
content = content.replace(old_sig, new_sig)

# 2. Update auto-save refs
old_refs = """  const prevSyllabus = React.useRef(syllabus);
  const prevCourses = React.useRef(courses);
  const prevToppers = React.useRef(toppers);"""
new_refs = """  const prevSyllabus = React.useRef(syllabus);
  const prevCourses = React.useRef(courses);
  const prevToppers = React.useRef(toppers);
  const prevHomeData = React.useRef(homeData);
  const prevBooksData = React.useRef(booksData);
  const prevTestsData = React.useRef(testsData);"""
content = content.replace(old_refs, new_refs)

# 3. Update auto-save logic
old_effect = """  useEffect(() => {
    const timer = setTimeout(() => {
      let saved = false;
      if (syllabus !== prevSyllabus.current) {
        saveDbToBlob('syllabusData', syllabus).catch(console.error);
        prevSyllabus.current = syllabus;
        saved = true;
      }
      if (courses !== prevCourses.current) {
        saveDbToBlob('coursesData', courses).catch(console.error);
        prevCourses.current = courses;
        saved = true;
      }
      if (toppers !== prevToppers.current) {
        saveDbToBlob('toppersData', toppers).catch(console.error);
        prevToppers.current = toppers;
        saved = true;
      }
      if (saved) console.log("Auto-saved changes to cloud database.");
    }, 2000);
    return () => clearTimeout(timer);
  }, [syllabus, courses, toppers]);"""

new_effect = """  useEffect(() => {
    const timer = setTimeout(() => {
      let saved = false;
      if (syllabus !== prevSyllabus.current) { saveDbToBlob('syllabusData', syllabus).catch(console.error); prevSyllabus.current = syllabus; saved = true; }
      if (courses !== prevCourses.current) { saveDbToBlob('coursesData', courses).catch(console.error); prevCourses.current = courses; saved = true; }
      if (toppers !== prevToppers.current) { saveDbToBlob('toppersData', toppers).catch(console.error); prevToppers.current = toppers; saved = true; }
      if (homeData !== prevHomeData.current) { saveDbToBlob('homeData', homeData).catch(console.error); prevHomeData.current = homeData; saved = true; }
      if (booksData !== prevBooksData.current) { saveDbToBlob('booksData', booksData).catch(console.error); prevBooksData.current = booksData; saved = true; }
      if (testsData !== prevTestsData.current) { saveDbToBlob('testsData', testsData).catch(console.error); prevTestsData.current = testsData; saved = true; }
      if (saved) console.log("Auto-saved changes to cloud database.");
    }, 2000);
    return () => clearTimeout(timer);
  }, [syllabus, courses, toppers, homeData, booksData, testsData]);"""

content = content.replace(old_effect, new_effect)

with open('src/pages/AdminDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
