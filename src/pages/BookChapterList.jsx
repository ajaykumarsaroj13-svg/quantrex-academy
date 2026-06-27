import React, { useState, useEffect } from 'react';
import Book from 'lucide-react/dist/esm/icons/book';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import PlayCircle from 'lucide-react/dist/esm/icons/play-circle';

export default function BookChapterList({ book, setActivePage, setPracticeChapter, theme }) {
  const isLight = theme === 'light';
  
  const [bookData, setBookData] = useState({
    title: book.title || 'Advanced Problems in Mathematics',
    author: book.author || 'Vikas Gupta & Pankaj Joshi (Black Book)',
    chapters: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (book.id === 'black-book-maths') {
      const allowedChapters = [
        'black_book_ch1_functions',
        'black_book_ch2_limits',
        'black_book_ch3_continuity',
        'black_book_ch4_aod',
        'black_book_ch5_integration'
      ];
      // Since it's a static site, we can fetch the data from the public folder or import it
      fetch(import.meta.env.BASE_URL + 'blackbook-data-v4.js')
        .then(res => res.text())
        .then(text => {
          // It's a JS file defining window.blackBookDemoData
          const script = document.createElement('script');
          script.text = text;
          document.head.appendChild(script);
          if (window.DEFAULT_BLACKBOOK) {
            const filteredData = window.DEFAULT_BLACKBOOK
              .filter(c => allowedChapters.includes(c.id))
              .map(c => ({
                ...c,
                totalQuestions: c.questions ? c.questions.length : 0
              }));
            setBookData(prev => ({ ...prev, chapters: filteredData }));
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to load blackbook chapters:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [book.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
        <p>Loading chapters...</p>
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen ${isLight ? 'bg-gray-50' : 'bg-obsidian'} pb-20`}>
      {/* Header */}
      <div className={`pt-24 pb-12 px-6 ${isLight ? 'bg-white border-b border-gray-200' : 'bg-cyberdark/50 border-b border-white/5'}`}>
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => setActivePage('books')}
            className={`flex items-center gap-2 text-sm font-semibold mb-6 hover:opacity-70 transition-opacity ${isLight ? 'text-gray-600' : 'text-gray-400'}`}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Library
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-block px-2.5 py-1 bg-gold/20 text-gold rounded-lg text-[10px] font-bold uppercase tracking-wider">
              Interactive Practice Book
            </span>
          </div>
          <h1 className={`text-3xl md:text-5xl font-black font-display ${isLight ? 'text-black' : 'text-white'}`}>
            {bookData.title}
          </h1>
          <p className={`mt-3 text-lg ${isLight ? 'text-gray-600' : 'text-gray-400'} font-mono`}>
            {bookData.author}
          </p>
        </div>
      </div>

      {/* Chapter List */}
      <div className="max-w-4xl mx-auto px-6 mt-12">
        <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isLight ? 'text-black' : 'text-white'}`}>
          <Book className="h-5 w-5 text-electric" /> Select a Chapter to Practice
        </h3>
        
        <div className="space-y-4">
          {bookData.chapters.map((chapter) => (
            <div 
              key={chapter.id}
              onClick={() => {
                if (chapter.totalQuestions > 0) {
                  setPracticeChapter(chapter);
                  setActivePage('book-practice');
                }
              }}
              className={`group flex items-center justify-between p-5 rounded-xl border transition-all duration-300 ${
                chapter.totalQuestions > 0
                  ? isLight 
                    ? 'bg-white border-gray-200 hover:border-electric hover:shadow-md cursor-pointer' 
                    : 'bg-cyberdark border-white/5 hover:border-electric/50 hover:bg-cyberdark/80 cursor-pointer'
                  : isLight
                    ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
                    : 'bg-obsidian border-white/5 opacity-50 cursor-not-allowed'
              }`}
            >
              <div>
                <h4 className={`text-lg font-bold ${isLight ? 'text-black' : 'text-white'} group-hover:text-electric transition-colors`}>
                  {chapter.title}
                </h4>
                <p className={`text-sm mt-1 font-mono ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                  {chapter.totalQuestions > 0 
                    ? `${chapter.totalQuestions} Practice Questions Available` 
                    : 'Questions being updated...'}
                </p>
              </div>
              
              {chapter.questions && chapter.questions.length > 0 && (
                <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                  isLight ? 'bg-blue-50 text-electric' : 'bg-electric/20 text-electric'
                }`}>
                  <PlayCircle className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
