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
      const staticChapters = [
        {
          id: 'black-book-ch1-functions',
          title: 'Functions',
          totalQuestions: 183
        },
        {
          id: 'black-book-ch2-limits',
          title: 'Limits',
          totalQuestions: 89
        },
        {
          id: 'black-book-ch3-continuity',
          title: 'Continuity and Differentiability',
          totalQuestions: 187
        },
        {
          id: 'black-book-ch4-aod',
          title: 'Application of Derivatives',
          totalQuestions: 145
        },
        {
          id: 'black-book-ch5-integration',
          title: 'Indefinite and Definite Integration',
          totalQuestions: 183
        },
        {
          id: 'quadratic-equations',
          title: 'Quadratic Equations',
          totalQuestions: 269
        },
        {
          id: 'sequence-and-series',
          title: 'Sequence and Series',
          totalQuestions: 10
        },
        {
          id: 'determinants',
          title: 'Determinants',
          totalQuestions: 49
        },
        {
          id: 'adv-area-under-curves',
          title: 'Area Under Curves',
          totalQuestions: 37
        },
        {
          id: 'adv-differential-equations',
          title: 'Differential Equations',
          totalQuestions: 49
        }
      ];
      setBookData(prev => ({ ...prev, chapters: staticChapters }));
      setLoading(false);
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
              
              {chapter.totalQuestions > 0 && (
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
