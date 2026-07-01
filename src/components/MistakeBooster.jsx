import React, { useState, useEffect } from 'react';
import { generateSimilarQuestion } from '../utils/aiGenerator';
import { Sparkles, Loader2, CheckCircle2, Target, XCircle, ChevronRight, Hash, Eye, RotateCcw } from 'lucide-react';

export default function MistakeBooster({ originalQuestion }) {
  const [loading, setLoading] = useState(false);
  const [generateCount, setGenerateCount] = useState(3);
  const [similarQuestions, setSimilarQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [checkedState, setCheckedState] = useState({}); // { 0: true (checked), 1: true }
  const [status, setStatus] = useState('idle'); // idle, loading, practicing, finished

  // Ensure MathJax renders when question changes
  useEffect(() => {
    if (similarQuestions.length > 0 && window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise().catch(e => console.log(e));
    }
  }, [similarQuestions, currentIndex, status]);

  const handleGenerate = async () => {
    setLoading(true);
    setStatus('loading');
    const newQs = await generateSimilarQuestion(originalQuestion, generateCount);
    setSimilarQuestions(newQs);
    setUserAnswers({});
    setCheckedState({});
    setCurrentIndex(0);
    setLoading(false);
    setStatus('practicing');
  };

  const handleCheck = () => {
    setCheckedState(prev => ({ ...prev, [currentIndex]: true }));
  };

  const handleNext = () => {
    if (currentIndex < similarQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setStatus('finished');
    }
  };

  const handleRestart = () => {
    setStatus('idle');
    setSimilarQuestions([]);
    setUserAnswers({});
    setCheckedState({});
    setCurrentIndex(0);
  };

  if (!originalQuestion) return null;

  const currentQ = similarQuestions[currentIndex];
  const isChecked = checkedState[currentIndex];
  const currentUserAnswer = userAnswers[currentIndex];

  const getScore = () => {
    let correct = 0;
    similarQuestions.forEach((q, idx) => {
      if (checkedState[idx] && userAnswers[idx] === q.correctOption) {
        correct++;
      }
    });
    return correct;
  };

  return (
    <div className="mt-8 border-2 border-indigo-200 bg-indigo-50/50 rounded-2xl p-6 relative overflow-hidden shadow-sm">
      {status === 'idle' && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-indigo-600 shrink-0" />
            <div>
              <h4 className="font-bold text-indigo-900 text-lg">Mistake Booster AI</h4>
              <p className="text-sm text-indigo-700 mt-1 font-medium">Challenge yourself with trickier, realistic variations of this concept.</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-indigo-100">
            <div className="flex items-center gap-2 text-sm font-bold text-indigo-800">
              <Hash className="w-4 h-4" /> Questions to generate:
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 5].map(num => (
                <button
                  key={num}
                  onClick={() => setGenerateCount(num)}
                  className={`w-10 h-10 rounded-full font-bold transition-all border-2 flex items-center justify-center ${generateCount === num ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:border-indigo-400'}`}
                >
                  {num}
                </button>
              ))}
            </div>
            <button 
              onClick={handleGenerate}
              className="ml-auto w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Generate Practice
            </button>
          </div>
        </div>
      )}

      {status === 'loading' && (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-sm font-bold text-indigo-800 animate-pulse tracking-wide uppercase">AI is crafting tricky questions...</p>
        </div>
      )}

      {status === 'practicing' && currentQ && (
        <div className="animate-fade-in space-y-6">
          <div className="flex items-center justify-between border-b border-indigo-200/50 pb-4">
            <h4 className="font-bold text-indigo-900 flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-indigo-600" /> Challenge {currentIndex + 1} of {similarQuestions.length}
            </h4>
            {isChecked && (
               <span className="bg-emerald-100 text-emerald-800 px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 border border-emerald-300">
                 <CheckCircle2 className="w-4 h-4" /> Evaluated
               </span>
            )}
          </div>
          
          <div className="text-slate-800 font-medium tex2jax_process text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: currentQ.questionText || currentQ.question }} />

          {/* Options */}
          {currentQ.options && currentQ.options.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQ.options.map((opt, idx) => {
                const isSelected = currentUserAnswer === idx;
                const isCorrect = isChecked && currentQ.correctOption === idx;
                const isWrong = isChecked && isSelected && !isCorrect;

                let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ";
                if (!isChecked) {
                  btnClass += isSelected ? "border-indigo-500 bg-white ring-4 ring-indigo-50" : "border-slate-200 hover:border-indigo-300 bg-white";
                } else {
                  if (isCorrect) btnClass += "border-emerald-500 bg-emerald-50/50";
                  else if (isWrong) btnClass += "border-red-400 bg-red-50/50";
                  else btnClass += "border-slate-200 bg-white opacity-50";
                }

                return (
                  <button 
                    key={idx} 
                    disabled={isChecked}
                    onClick={() => setUserAnswers(prev => ({ ...prev, [currentIndex]: idx }))}
                    className={btnClass}
                  >
                    <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold border-2 ${!isChecked && isSelected ? 'bg-indigo-600 text-white border-indigo-600' : isCorrect ? 'bg-emerald-500 text-white border-emerald-500' : isWrong ? 'bg-red-500 text-white border-red-500' : 'border-slate-300 text-slate-500'}`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <div className="tex2jax_process text-sm text-slate-700 pt-0.5" dangerouslySetInnerHTML={{ __html: opt }} />
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <input 
                type="text"
                disabled={isChecked}
                className="px-4 py-3 border-2 border-slate-300 rounded-xl outline-none focus:border-indigo-500 font-mono text-lg w-full max-w-sm shadow-inner"
                placeholder="Type your answer"
                value={currentUserAnswer || ''}
                onChange={(e) => setUserAnswers(prev => ({ ...prev, [currentIndex]: e.target.value }))}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-indigo-100">
            {!isChecked ? (
              <button 
                onClick={handleCheck}
                disabled={currentUserAnswer === undefined || currentUserAnswer === ''}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-md flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" /> Check Answer
              </button>
            ) : (
              <button 
                onClick={handleNext}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-md flex items-center gap-2 ml-auto"
              >
                {currentIndex < similarQuestions.length - 1 ? 'Next Question' : 'Finish Practice'} <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Solution Panel */}
          {isChecked && (
            <div className="mt-6 p-6 bg-white border border-indigo-100 rounded-2xl space-y-4 shadow-sm relative">
               <div className="absolute top-0 left-0 w-2 h-full bg-indigo-400 rounded-l-2xl"></div>
               <h5 className="font-bold text-indigo-900 text-lg flex items-center gap-2"><Eye className="w-5 h-5 text-indigo-500" /> Detailed Solution</h5>
               <div className="text-slate-700 tex2jax_process leading-relaxed text-sm md:text-base bg-indigo-50/30 p-4 rounded-xl border border-indigo-50" dangerouslySetInnerHTML={{ __html: currentQ.explanation || currentQ.solution }} />
            </div>
          )}
        </div>
      )}

      {status === 'finished' && (
        <div className="text-center py-8 animate-fade-in space-y-6">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-indigo-200">
            <Target className="w-10 h-10 text-indigo-600" />
          </div>
          <h3 className="text-2xl font-bold text-indigo-900">Practice Completed!</h3>
          <p className="text-indigo-700 font-medium text-lg">
            You scored <span className="font-bold text-indigo-900">{getScore()}</span> out of <span className="font-bold text-indigo-900">{similarQuestions.length}</span>.
          </p>
          <button onClick={handleRestart} className="mt-4 px-6 py-3 bg-indigo-100 text-indigo-800 rounded-xl font-bold hover:bg-indigo-200 transition-colors flex items-center gap-2 mx-auto">
            <RotateCcw className="w-5 h-5" /> Try Another Concept
          </button>
        </div>
      )}
    </div>
  );
}
