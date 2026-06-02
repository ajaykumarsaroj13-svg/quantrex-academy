import React from 'react';
import { Book, ChevronRight, Download } from 'lucide-react';

export default function BooksLibrary({ setActivePage, theme, setReadingBook }) {
  const isLight = theme === 'light';

  const books = [
    {
      id: 'allen-maths-handbook',
      title: 'Allen Maths Handbook',
      description: 'Complete mathematics formulas and quick revision handbook for JEE Main and Advanced.',
      coverColor: 'from-orange-500 to-red-600',
      tag: 'Mathematics',
      pages: '200+',
      file: '/books/Allen-Maths-Handbook.pdf'
    },
    {
      id: 'black-book-maths',
      title: 'Advanced Problems in Mathematics',
      description: 'Vikas Gupta & Pankaj Joshi (Black Book) - Chapter-wise Interactive Practice.',
      coverColor: 'from-gray-800 to-black',
      tag: 'Practice Book',
      pages: 'Interactive',
      type: 'interactive'
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-gold mb-2">
            <Book className="h-5 w-5" />
            <span className="text-xs font-bold tracking-widest uppercase">Digital Library</span>
          </div>
          <h1 className={`text-3xl md:text-4xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
            Premium Books
          </h1>
          <p className={`mt-2 text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'} max-w-2xl`}>
            Access high-quality study materials, handbooks, and modules. 
            All math symbols and formatting are perfectly preserved.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {books.map(book => (
          <div 
            key={book.id}
            onClick={() => {
              setReadingBook(book);
              setActivePage(book.type === 'interactive' ? 'book-chapters' : 'book-reader');
            }}
            className={`group relative rounded-2xl p-1 overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
              isLight ? 'bg-white shadow-lg border border-gray-100 hover:shadow-xl' : 'bg-obsidian border border-white/10 hover:border-gold/50 hover:shadow-[0_0_30px_rgba(255,215,0,0.15)]'
            }`}
          >
            <div className={`aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br ${book.coverColor} p-6 flex flex-col justify-between relative`}>
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/20 rounded-full blur-xl -ml-10 -mb-10"></div>
              
              <div className="relative z-10">
                <span className="inline-block px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-bold text-white uppercase tracking-wider mb-3">
                  {book.tag}
                </span>
                <h3 className="text-2xl font-black text-white leading-tight drop-shadow-md">
                  {book.title}
                </h3>
              </div>
              
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-white/80 text-xs font-medium bg-black/20 px-2 py-1 rounded">
                  {book.pages} Pages
                </span>
                <div className="h-8 w-8 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <h4 className={`font-bold text-sm ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {book.title}
              </h4>
              <p className={`text-xs mt-1 line-clamp-2 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                {book.description}
              </p>
            </div>
          </div>
        ))}

        {/* Coming Soon Placeholder */}
        <div className={`rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-8 text-center h-full min-h-[300px] ${
          isLight ? 'border-gray-200 bg-gray-50/50' : 'border-white/10 bg-obsidian/30'
        }`}>
          <Book className={`h-8 w-8 mb-3 opacity-20 ${isLight ? 'text-gray-900' : 'text-white'}`} />
          <h4 className={`font-bold text-sm ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>More Books Coming Soon</h4>
          <p className={`text-xs mt-1 ${isLight ? 'text-gray-400' : 'text-gray-600'}`}>Physics and Chemistry handbooks are being processed.</p>
        </div>
      </div>
    </div>
  );
}
