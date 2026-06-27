import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
imports = """import { DEFAULT_SYLLABUS, DEFAULT_TOPPERS } from './utils/syllabusData';
import { DEFAULT_TESTS, DEFAULT_BOOKS, DEFAULT_HOME_CONTENT } from './utils/defaultData';"""
content = content.replace("import { DEFAULT_SYLLABUS, DEFAULT_TOPPERS } from './utils/syllabusData';", imports)

# 2. Add states after toppers state
toppers_state_end = content.find("}, []);", content.find("loadDbFromBlob('toppersData')")) + 7
new_states = """
  const [homeData, setHomeData] = useState(() => {
    const saved = localStorage.getItem('quantrex_home_data');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return DEFAULT_HOME_CONTENT;
  });
  useEffect(() => {
    loadDbFromBlob('homeData').then(data => {
      if (data) { setHomeData(data); localStorage.setItem('quantrex_home_data', JSON.stringify(data)); }
    });
  }, []);

  const [booksData, setBooksData] = useState(() => {
    const saved = localStorage.getItem('quantrex_books_data');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return DEFAULT_BOOKS;
  });
  useEffect(() => {
    loadDbFromBlob('booksData').then(data => {
      if (data && data.length > 0) { setBooksData(data); localStorage.setItem('quantrex_books_data', JSON.stringify(data)); }
    });
  }, []);

  const [testsData, setTestsData] = useState(() => {
    const saved = localStorage.getItem('quantrex_tests_data');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return DEFAULT_TESTS;
  });
  useEffect(() => {
    loadDbFromBlob('testsData').then(data => {
      if (data && data.mains && data.advanced) { setTestsData(data); localStorage.setItem('quantrex_tests_data', JSON.stringify(data)); }
    });
  }, []);
"""
content = content[:toppers_state_end] + new_states + content[toppers_state_end:]

# 3. Update components passing in renderPage
def replace_page(old, new):
    global content
    content = content.replace(old, new)

replace_page(
  "case 'home': return <Home setActivePage={setActivePage} user={user} courses={courses} setCourses={setCourses} onEnrollSuccess={handleEnrollSuccess} onStartLearning={handleStartLearning} toppers={toppers} />;",
  "case 'home': return <Home setActivePage={setActivePage} user={user} courses={courses} setCourses={setCourses} onEnrollSuccess={handleEnrollSuccess} onStartLearning={handleStartLearning} toppers={toppers} homeData={homeData} />;"
)

replace_page(
  "case 'admin-dashboard': return <AdminDashboard user={user} courses={courses} setCourses={setCourses} setCustomLogo={setCustomLogo} syllabus={syllabus} setSyllabus={setSyllabus} toppers={toppers} setToppers={setToppers} />;",
  "case 'admin-dashboard': return <AdminDashboard user={user} courses={courses} setCourses={setCourses} setCustomLogo={setCustomLogo} syllabus={syllabus} setSyllabus={setSyllabus} toppers={toppers} setToppers={setToppers} homeData={homeData} setHomeData={setHomeData} booksData={booksData} setBooksData={setBooksData} testsData={testsData} setTestsData={setTestsData} />;"
)

replace_page(
  "case 'books': return <BooksLibrary setActivePage={setActivePage} setReadingBook={setReadingBook} user={user} theme=\"dark\" />;",
  "case 'books': return <BooksLibrary setActivePage={setActivePage} setReadingBook={setReadingBook} user={user} theme=\"dark\" booksData={booksData} />;"
)

replace_page(
  "case 'test-series': return <TestSeriesPage user={user} onStartTest={handleStartTestSeries} onBack={() => setActivePage(user ? 'student-dashboard' : 'home')} />;",
  "case 'test-series': return <TestSeriesPage user={user} onStartTest={handleStartTestSeries} onBack={() => setActivePage(user ? 'student-dashboard' : 'home')} testsData={testsData} />;"
)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
