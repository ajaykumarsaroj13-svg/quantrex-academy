import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Eye, CheckCircle, XCircle, Info, Tag, Calendar } from 'lucide-react';

export default function PyqViewer({ questions }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    // Reset state when question changes
    setSelectedOption(null);
    setShowSolution(false);
    
    // Trigger MathJax typesetting if available globally
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise().catch((err) => console.log('MathJax error:', err));
    }
  }, [currentIndex, questions]);

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-cyberdark/40 border border-white/5 rounded-xl">
        <Info className="h-10 w-10 text-gray-500 mb-3" />
        <p className="text-gray-400">No PYQs available for this chapter yet.</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(c => c + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(c => c - 1);
  };

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'hard': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="bg-obsidian border border-white/10 rounded-xl overflow-hidden flex flex-col shadow-2xl">
      {/* Header */}
      <div className="bg-cyberdark border-b border-white/5 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-white font-bold text-lg">{currentQ.title}</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className={`text-[10px] uppercase font-bold px-2 py-1 border rounded flex items-center gap-1 ${getDifficultyColor(currentQ.difficulty)}`}>
              <Tag className="h-3 w-3" /> {currentQ.difficulty || 'Unknown'}
            </span>
            <span className="text-[10px] uppercase font-bold px-2 py-1 bg-electric/10 text-electric border border-electric/20 rounded flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {currentQ.year}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-xs font-mono text-gray-400 bg-obsidian px-3 py-1.5 rounded-lg border border-white/5">
            {currentIndex + 1} / {questions.length}
          </span>
          <button 
            onClick={handleNext}
            disabled={currentIndex === questions.length - 1}
            className="p-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Question Body */}
      <div className="p-6 md:p-8 space-y-8">
        <div className="text-gray-200 text-sm md:text-base leading-relaxed tracking-wide min-h-[80px]">
          {/* Render Math content */}
          <div dangerouslySetInnerHTML={{ __html: currentQ.question }} />
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = currentQ.correctOptionIndex === idx;
            const showResult = selectedOption !== null || showSolution;
            
            let btnClass = "border-white/10 bg-cyberdark hover:bg-white/5 text-gray-300";
            
            if (showResult) {
              if (isCorrect) {
                btnClass = "border-emerald-500/50 bg-emerald-500/10 text-emerald-400";
              } else if (isSelected) {
                btnClass = "border-red-500/50 bg-red-500/10 text-red-400";
              } else {
                btnClass = "border-white/5 bg-cyberdark/50 text-gray-500 opacity-50";
              }
            } else if (isSelected) {
              btnClass = "border-electric/50 bg-electric/10 text-electric";
            }

            return (
              <button
                key={idx}
                onClick={() => !showResult && setSelectedOption(idx)}
                disabled={showResult}
                className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${btnClass}`}
              >
                <div className="mt-0.5 shrink-0 flex items-center justify-center w-6 h-6 rounded-full border border-current font-bold text-xs">
                  {String.fromCharCode(65 + idx)}
                </div>
                <div className="flex-1 overflow-x-auto custom-scrollbar pb-1">
                  <span dangerouslySetInnerHTML={{ __html: opt }} />
                </div>
                {showResult && isCorrect && <CheckCircle className="h-5 w-5 shrink-0" />}
                {showResult && isSelected && !isCorrect && <XCircle className="h-5 w-5 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="bg-cyberdark p-4 border-t border-white/5 flex flex-wrap gap-3 justify-between items-center">
        <button
          onClick={() => setShowSolution(!showSolution)}
          className={`px-4 py-2 text-xs font-bold uppercase rounded-lg flex items-center gap-2 transition-colors ${
            showSolution 
              ? 'bg-white/10 text-white hover:bg-white/20' 
              : 'bg-electric hover:bg-cyan-400 text-obsidian shadow-lg shadow-cyan-500/20'
          }`}
        >
          <Eye className="h-4 w-4" /> {showSolution ? 'Hide Solution' : 'View Solution'}
        </button>
        
        {selectedOption !== null && !showSolution && (
          <span className="text-xs text-electric animate-fade-in font-medium">
            Answer submitted! Click 'View Solution' for detailed steps.
          </span>
        )}
      </div>

      {/* Solution Section */}
      {showSolution && (
        <div className="p-6 bg-obsidian border-t border-white/5 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-gold rounded-full"></div>
            <h4 className="text-gold font-bold text-sm uppercase tracking-wider">Detailed Solution</h4>
          </div>
          <div className="text-gray-300 text-sm leading-relaxed p-4 bg-cyberdark/50 rounded-xl border border-white/5 whitespace-pre-wrap">
            <div dangerouslySetInnerHTML={{ __html: currentQ.solution }} />
          </div>
        </div>
      )}
    </div>
  );
}
