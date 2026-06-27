const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// Add import
if (!code.includes('framer-motion')) {
  code = code.replace("import React, { useState, useEffect, Suspense } from 'react';", "import React, { useState, useEffect, Suspense } from 'react';\nimport { AnimatePresence, motion } from 'framer-motion';");
}

// Add PageTransition component
if (!code.includes('PageTransition =')) {
  const transitionComp = `
const PageTransition = ({ children, pageKey }) => (
  <motion.div
    key={pageKey}
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
    className="w-full flex-grow flex flex-col"
  >
    {children}
  </motion.div>
);
`;
  code = code.replace("export default function App() {", transitionComp + "\nexport default function App() {");
}

// Wrap contents with AnimatePresence
if (!code.includes('<AnimatePresence mode="wait">')) {
  code = code.replace('<Suspense fallback={<div className="flex-grow flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div></div>}>', '<Suspense fallback={<div className="flex-grow flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div></div>}>\n            <AnimatePresence mode="wait">');
  
  const pages = [
    { cond: "activePage === 'books'", key: "books" },
    { cond: "activePage === 'book-reader'", key: "book-reader" },
    { cond: "activePage === 'book-chapters'", key: "book-chapters" },
    { cond: "activePage === 'book-practice'", key: "book-practice" },
    { cond: "activePage === 'home'", key: "home" },
    { cond: "activePage === 'login'", key: "login" },
    { cond: "activePage === 'student-dashboard'", key: "student-dashboard" },
    { cond: "activePage === 'admin-dashboard'", key: "admin-dashboard" },
    { cond: "activePage === 'test-series'", key: "test-series" },
    { cond: "activePage === 'test-series-exam'", key: "test-series-exam" },
    { cond: "activePage === 'test-series-result'", key: "test-series-result" },
    { cond: "activePage === 'exam-mode'", key: "exam-mode" }
  ];

  for (const page of pages) {
    const regex = new RegExp(`{${page.cond} && \\(([\\s\\S]*?)\\)}`, 'g');
    code = code.replace(regex, `{${page.cond} && (\n            <PageTransition pageKey="${page.key}">\n              $1\n            </PageTransition>\n          )}`);
  }

  code = code.replace('</Suspense>', '</AnimatePresence>\n          </Suspense>');
}

fs.writeFileSync('src/App.jsx', code, 'utf8');
console.log('App.jsx updated successfully.');
