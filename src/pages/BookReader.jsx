import React, { useState, useEffect } from 'react';
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import ZoomIn from 'lucide-react/dist/esm/icons/zoom-in';
import ZoomOut from 'lucide-react/dist/esm/icons/zoom-out';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import Maximize from 'lucide-react/dist/esm/icons/maximize';
import Minimize from 'lucide-react/dist/esm/icons/minimize';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up the worker for react-pdf using unpkg (modern mjs worker)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function BookReader({ book, setActivePage, theme }) {
  const isLight = theme === 'light';
  
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Scroll to top when opening a book
    window.scrollTo(0, 0);
  }, []);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => {
      const newPage = prevPageNumber + offset;
      return Math.min(Math.max(1, newPage), numPages || 1);
    });
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className={isLight ? 'text-gray-900' : 'text-white'}>No book selected.</p>
        <button onClick={() => setActivePage('books')} className="mt-4 text-blue-500 underline">Go back</button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-[calc(100vh-80px)] w-full animate-fade-in ${isLight ? 'bg-gray-100' : 'bg-[#0f1115]'}`}>
      {/* Top Toolbar */}
      <div className={`flex items-center justify-between px-6 py-3 border-b ${
        isLight ? 'bg-white border-gray-200' : 'bg-obsidian border-white/5'
      }`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActivePage('books')}
            className={`p-2 rounded-lg transition-colors ${
              isLight ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className={`font-bold text-sm md:text-base ${isLight ? 'text-gray-900' : 'text-white'}`}>
              {book.title}
            </h2>
            <span className={`text-[10px] uppercase tracking-wider font-bold ${isLight ? 'text-blue-600' : 'text-gold'}`}>
              Quantrex Smart Reader
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 bg-black/5 dark:bg-white/5 rounded-lg p-1">
          <button onClick={zoomOut} className={`p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className={`text-xs font-mono font-bold w-12 text-center ${isLight ? 'text-gray-900' : 'text-white'}`}>
            {Math.round(scale * 100)}%
          </span>
          <button onClick={zoomIn} className={`p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
            <ZoomIn className="h-4 w-4" />
          </button>
          <div className="w-px h-4 bg-gray-300 dark:bg-white/20 mx-1"></div>
          <button onClick={toggleFullscreen} className={`p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main Reader Area */}
      <div className={`flex-1 overflow-auto flex justify-center py-6 relative ${
        isLight ? 'bg-gray-200' : 'bg-[#0a0a0c]'
      }`}>
        <div className="relative shadow-[0_0_40px_rgba(0,0,0,0.3)] transition-transform duration-300" style={{ transformOrigin: 'top center' }}>
          <Document
            file={book.file}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className={`flex flex-col items-center justify-center h-[500px] w-[350px] rounded-lg ${isLight ? 'bg-white text-gray-500' : 'bg-obsidian text-gray-400'}`}>
                <div className="h-10 w-10 rounded-full border-2 border-t-gold border-r-gold border-b-transparent border-l-transparent animate-spin mb-4"></div>
                <p className="text-sm font-medium tracking-wide">Extracting High-Res Pages...</p>
              </div>
            }
            error={
              <div className={`p-6 rounded-lg ${isLight ? 'bg-red-50 text-red-600' : 'bg-red-900/20 text-red-400'}`}>
                Failed to load the book. Please try again.
              </div>
            }
          >
            <Page 
              pageNumber={pageNumber} 
              scale={scale} 
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className={`rounded-sm overflow-hidden ${isLight ? 'bg-white' : 'bg-white'}`}
              loading={
                <div className={`flex items-center justify-center h-[500px] w-[350px] ${isLight ? 'bg-white' : 'bg-obsidian'}`}>
                  <div className="h-6 w-6 rounded-full border-2 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent animate-spin"></div>
                </div>
              }
            />
          </Document>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className={`flex items-center justify-between px-6 py-4 border-t ${
        isLight ? 'bg-white border-gray-200' : 'bg-obsidian border-white/5'
      }`}>
        <p className={`text-xs hidden md:block ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
          Use keyboard arrows <span className="font-mono bg-gray-200 dark:bg-white/10 px-1 rounded">←</span> <span className="font-mono bg-gray-200 dark:bg-white/10 px-1 rounded">→</span> to navigate
        </p>
        
        <div className="flex items-center gap-6 mx-auto md:mx-0">
          <button 
            disabled={pageNumber <= 1}
            onClick={() => changePage(-1)}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg font-bold text-xs transition-colors ${
              pageNumber <= 1 
                ? 'opacity-50 cursor-not-allowed' 
                : isLight ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-electric/10 text-electric hover:bg-electric/20'
            }`}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          
          <span className={`text-sm font-bold font-mono tracking-wider ${isLight ? 'text-gray-900' : 'text-white'}`}>
            {pageNumber} <span className="text-gray-400 font-normal">/ {numPages || '--'}</span>
          </span>
          
          <button 
            disabled={pageNumber >= numPages}
            onClick={() => changePage(1)}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg font-bold text-xs transition-colors ${
              pageNumber >= numPages 
                ? 'opacity-50 cursor-not-allowed' 
                : isLight ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-electric/10 text-electric hover:bg-electric/20'
            }`}
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
