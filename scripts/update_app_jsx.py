import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

if 'framer-motion' not in code:
    code = code.replace(
        "import React, { useState, useEffect, Suspense } from 'react';",
        "import React, { useState, useEffect, Suspense } from 'react';\nimport { AnimatePresence, motion } from 'framer-motion';"
    )

render_func = """  const renderPage = () => {
    switch (activePage) {
      case 'books': return <BooksLibrary setActivePage={setActivePage} setReadingBook={setReadingBook} user={user} theme="dark" />;
      case 'book-reader': return <BookReader book={readingBook} setActivePage={setActivePage} theme="dark" />;
      case 'book-chapters': return <BookChapterList book={readingBook} setActivePage={setActivePage} setPracticeChapter={setPracticeChapter} theme="dark" />;
      case 'book-practice': return <BookPractice chapter={practiceChapter} setActivePage={setActivePage} theme="dark" />;
      case 'home': return <Home setActivePage={setActivePage} user={user} courses={courses} setCourses={setCourses} onEnrollSuccess={handleEnrollSuccess} onStartLearning={handleStartLearning} toppers={toppers} />;
      case 'login': return <Auth onLoginSuccess={handleLoginSuccess} setActivePage={setActivePage} />;
      case 'student-dashboard': return <StudentDashboard user={user} courses={courses} setActivePage={setActivePage} setExamTest={setExamTest} syllabus={syllabus} initialClass={initialClass} initialTab={initialTab} initialChapterTab={initialChapterTab} isLight={isLight} onToggleTheme={() => setIsLight(!isLight)} />;
      case 'admin-dashboard': return <AdminDashboard user={user} courses={courses} setCourses={setCourses} setCustomLogo={setCustomLogo} syllabus={syllabus} setSyllabus={setSyllabus} toppers={toppers} setToppers={setToppers} />;
      case 'test-series': return <TestSeriesPage user={user} onStartTest={handleStartTestSeries} onBack={() => setActivePage(user ? 'student-dashboard' : 'home')} />;
      case 'test-series-exam': return <TestSeriesExam testId={activeTestId} mode={activeTestMode} user={user} onSubmit={handleTestSubmit} onExit={() => setActivePage(localStorage.getItem('quantrex_test_source') || 'test-series')} isLight={isLight} onToggleTheme={() => setIsLight(!isLight)} />;
      case 'test-series-result': return <TestSeriesResult result={testResult} user={user} onBack={() => setActivePage(localStorage.getItem('quantrex_test_source') || 'test-series')} onRetake={() => { if (activeTestId) handleStartTestSeries(activeTestId, activeTestMode, localStorage.getItem('quantrex_test_source')); }} />;
      case 'exam-mode': return <TestSystem test={examTest} user={user} onBackToDashboard={() => setActivePage('student-dashboard')} />;
      default: return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-obsidian flex flex-col justify-between">"""

code = code.replace('  return (\n    <div className="relative min-h-screen bg-obsidian flex flex-col justify-between">', render_func)

suspense_start = code.find('<Suspense fallback={<div className="flex-grow flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div></div>}>')
suspense_end = code.find('</Suspense>', suspense_start) + len('</Suspense>')

new_suspense = """<Suspense fallback={<div className="flex-grow flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div></div>}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="w-full flex-grow flex flex-col"
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </Suspense>"""

if suspense_start != -1 and 'renderPage()' not in code[suspense_start:suspense_end]:
    code = code[:suspense_start] + new_suspense + code[suspense_end:]

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated App.jsx successfully.")
