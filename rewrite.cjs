const fs = require('fs');
const file = 'src/components/ExamGoalPracticeInterface.jsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');
const startLine = 147; // 0-indexed for 148
const before = lines.slice(0, startLine);

const newJSX = `  return (
    <div className="fixed inset-0 z-[100] flex flex-col font-sans bg-[#f5f5f5] overflow-hidden">
      
      {/* Top Header */}
      <div className="h-[52px] bg-[#2962ff] text-white flex items-center px-4 shadow-md justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-[16px] font-medium">{topic ? topic.name : 'Practice Session'}</span>
        </div>
        <div className="flex items-center gap-4">
           {/* Mock icons for top right */}
           <svg className="w-5 h-5 opacity-80" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
           <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
           <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
        </div>
      </div>

      {/* Horizontal Pagination Bar */}
      <div className="h-12 bg-[#214dc7] flex items-center px-2 shadow-inner shrink-0 overflow-x-auto no-scrollbar border-t border-white/10">
        <button onClick={handlePrev} className="px-3 py-1.5 text-white/70 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <div className="flex items-center gap-1">
          {questions.slice(0, 30).map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={\`min-w-[30px] h-[30px] text-[13px] font-medium rounded border transition-colors flex items-center justify-center
                \${idx === currentQuestionIndex 
                  ? 'bg-transparent border-[#ff9800] text-[#ff9800]' 
                  : 'bg-transparent border-transparent text-white/90 hover:bg-white/10'}\`}
            >
              {idx + 1}
            </button>
          ))}
          {questions.length > 30 && <span className="text-white/70 px-2">...</span>}
        </div>
        <button onClick={handleNext} className="px-3 py-1.5 text-white/70 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>

      {/* Main Content Area: Split Left and Right */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Question and Options */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-white relative shadow-sm z-10">
          
          <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full pb-32">
            
            {/* Header: Date, Shift, Q No, Type */}
            <div className="mb-6">
              <div className="flex items-center gap-4 text-xs font-mono text-gray-500 mb-3">
                 <span>12:46</span>
                 <span>02:17</span>
                 <span className="text-[#28a745] font-bold">+4</span>
                 <span className="text-gray-500 font-bold">-0</span>
              </div>
              <div className="flex items-start justify-between">
                <div className="flex gap-3 items-center">
                  <div className="w-[30px] h-[30px] rounded-full bg-[#28a745] text-white flex items-center justify-center font-bold text-[13px] shrink-0">
                    {currentQuestionIndex + 1}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[#28a745] text-[13px] font-medium">
                      {currentQuestion.year} - {currentQuestion.shift || 'JEE Main'}
                    </span>
                    <span className="px-2 py-0.5 bg-[#e3f2fd] text-[#1976d2] text-[11px] font-bold rounded border border-[#bbdefb]">
                      {currentQuestion.type || 'MCQ Single Answer'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 text-[#dc3545]">
                  <button className="w-6 h-6 bg-[#e8f5e9] text-[#28a745] hover:bg-[#c8e6c9] rounded-full flex items-center justify-center transition-colors"><Plus className="w-4 h-4" /></button>
                  <button className="w-6 h-6 bg-[#fdecea] text-[#dc3545] hover:bg-[#f8d7da] rounded-full flex items-center justify-center transition-colors"><AlertCircle className="w-4 h-4" /></button>
                </div>
              </div>
            </div>

            {/* Question Text */}
            <div className="text-gray-900 font-medium mb-8">
              <div 
                className="text-[15px] leading-[1.8] exam-math-content"
                dangerouslySetInnerHTML={{ __html: fixMathJax(currentQuestion.question) }}
              />
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {!isNumerical ? (
                (currentQuestion.options || []).map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrectOption = idx === currentQuestion.correctOptionIndex;
                  
                  let boxClass = 'border-gray-200 bg-white hover:border-gray-300';
                  let circleClass = 'bg-[#1976d2] text-white';

                  if (isAnswerChecked) {
                    if (isSelected && isCorrectOption) {
                      boxClass = 'border-[#28a745] bg-[#e8f5e9]';
                      circleClass = 'bg-[#28a745] text-white';
                    } else if (isSelected && !isCorrectOption) {
                      boxClass = 'border-[#dc3545] bg-[#fdecea]';
                      circleClass = 'bg-[#dc3545] text-white';
                    } else if (!isSelected && isCorrectOption) {
                      boxClass = 'border-[#28a745] bg-[#e8f5e9]';
                      circleClass = 'bg-[#28a745] text-white';
                    } else {
                      boxClass = 'border-gray-200 bg-white opacity-50';
                      circleClass = 'bg-gray-400 text-white';
                    }
                  } else if (isSelected) {
                    boxClass = 'border-[#2962ff] bg-[#f0f4ff]';
                  }

                  const labelChar = String.fromCharCode(65 + idx); // A, B, C, D

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        handleOptionSelect(idx);
                      }}
                      disabled={isAnswerChecked}
                      className={\`w-full text-left p-4 flex items-start gap-4 border rounded-xl transition-all shadow-sm relative overflow-hidden \${boxClass}\`}
                    >
                      <div className={\`w-[30px] h-[30px] shrink-0 rounded-full flex items-center justify-center font-bold text-[13px] \${circleClass}\`}>
                        {labelChar}
                      </div>
                      <div className="flex-1 mt-1 text-[15px] text-gray-800 font-medium exam-math-content" dangerouslySetInnerHTML={{ __html: fixMathJax(opt) }} />
                      
                      {/* Correct Answer Badge */}
                      {isAnswerChecked && isCorrectOption && (
                        <div className="absolute top-0 right-0 bg-[#28a745] text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                           Your answer | Correct answer
                        </div>
                      )}
                      {/* Users Percentage Mock */}
                      {isAnswerChecked && (
                        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-gray-500 text-white text-[9px] font-bold rounded">
                           {Math.floor(Math.random() * 40 + 10)}% users
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="col-span-1 md:col-span-2">
                  <div className={\`p-6 border rounded-xl shadow-sm \${isAnswerChecked ? (isCorrect ? 'border-[#28a745] bg-[#e8f5e9]' : 'border-[#dc3545] bg-[#fdecea]') : 'border-gray-200 bg-white'}\`}>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Your Answer:</label>
                    <input
                      type="text"
                      value={selectedOption || ''}
                      onChange={(e) => handleOptionSelect(e.target.value)}
                      disabled={isAnswerChecked}
                      className={\`w-full max-w-xs px-4 py-3 border rounded-lg outline-none text-lg font-mono font-bold \${isAnswerChecked ? 'bg-white' : 'border-gray-300 focus:border-[#2962ff]'}\`}
                      placeholder="Type integer value..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Explanation Section */}
            {(isAnswerChecked || savedAnswers[currentQuestionIndex]) && (
              <div className="bg-[#f8f9fa] border border-[#e0e0e0] rounded-xl overflow-hidden shadow-sm mt-8">
                 <div className="bg-[#e3f2fd] text-[#1976d2] px-4 py-2 font-medium text-[13px] border-b border-[#e0e0e0]">
                   Explanation
                 </div>
                 <div 
                    className="p-5 text-[15px] text-gray-800 font-medium leading-[1.8] exam-math-content"
                    dangerouslySetInnerHTML={{ __html: fixMathJax(currentQuestion.solution || '<p>No explanation provided.</p>') }}
                 />
                 <div className="bg-white border-t border-gray-200 p-2 flex justify-end">
                    <button className="text-[#1976d2] text-xs font-bold px-3 py-1 border border-[#1976d2] rounded hover:bg-[#e3f2fd] transition-colors">
                      Add a Note
                    </button>
                 </div>
              </div>
            )}

          </div>

          {/* Bottom Action Bar (Fixed to left content area) */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] h-16">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={isAnswerChecked} onChange={(e) => {
                    if (e.target.checked && selectedOption !== '') handleCheckAnswer();
                    else if (e.target.checked && selectedOption === '') {
                      setIsAnswerChecked(true);
                      setSavedAnswers(prev => ({...prev, [currentQuestionIndex]: { selectedOption: '', isAnswerChecked: true }}));
                    }
                  }} />
                  <div className={\`block w-[38px] h-[20px] rounded-full transition-colors \${isAnswerChecked ? 'bg-[#2962ff]' : 'bg-gray-300'}\`}></div>
                  <div className={\`dot absolute left-1 top-1 bg-white w-[12px] h-[12px] rounded-full transition-transform \${isAnswerChecked ? 'transform translate-x-[18px]' : ''}\`}></div>
                </div>
                <span className="text-[13px] font-medium text-gray-700 group-hover:text-gray-900">Show Answer</span>
              </label>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className={\`px-6 py-2 rounded transition-colors text-[13px] font-medium \${currentQuestionIndex === 0 ? 'bg-[#f0f0f0] text-gray-400' : 'bg-[#e3f2fd] text-[#1976d2] hover:bg-[#bbdefb]'}\`}
              >
                Previous
              </button>
              <button 
                onClick={handleNext}
                disabled={currentQuestionIndex === questions.length - 1}
                className={\`px-8 py-2 rounded transition-colors text-[13px] font-medium \${currentQuestionIndex === questions.length - 1 ? 'bg-[#f0f0f0] text-gray-400' : 'bg-[#28a745] text-white hover:bg-[#218838] shadow-sm'}\`}
              >
                Next
              </button>
            </div>
          </div>

        </div>

        {/* Right Sidebar: Bubble Grid */}
        <div className="w-[320px] bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-hidden shadow-[-4px_0_10px_rgba(0,0,0,0.02)] z-0">
          
          {/* Status Legend */}
          <div className="p-4 border-b border-gray-100 grid grid-cols-2 gap-y-3">
             <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#28a745]"></div><span className="text-[11px] text-gray-600 font-medium">Correct</span></div>
             <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#dc3545]"></div><span className="text-[11px] text-gray-600 font-medium">Wrong</span></div>
             <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#1976d2]"></div><span className="text-[11px] text-gray-600 font-medium">Attempted</span></div>
             <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#ffc107]"></div><span className="text-[11px] text-gray-600 font-medium">Seen</span></div>
             <div className="flex items-center gap-2 col-span-2"><div className="w-4 h-4 rounded-full bg-[#6c757d]"></div><span className="text-[11px] text-gray-600 font-medium">Not Seen</span></div>
          </div>

          {/* Subject Header with Counts */}
          <div className="px-4 py-3 border-b border-gray-100 bg-[#f8f9fa]">
             <h4 className="font-semibold text-gray-800 text-[14px] mb-3">Mathematics</h4>
             <div className="flex items-center justify-between text-[11px] font-semibold text-gray-700">
                <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-[#28a745]"></div> 44</span>
                <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-[#dc3545]"></div> 13</span>
                <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-[#1976d2]"></div> 0</span>
                <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-[#ffc107]"></div> 1</span>
                <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-[#6c757d]"></div> 63</span>
             </div>
          </div>

          {/* Question Bubbles Grid */}
          <div className="p-4 flex-1 overflow-y-auto no-scrollbar">
             <div className="grid grid-cols-6 gap-2.5">
               {questions.map((_, idx) => {
                 let bubbleClass = "bg-[#6c757d] text-white"; // default not seen
                 const s = savedAnswers[idx];
                 
                 if (s && s.isAnswerChecked) {
                    const q = questions[idx];
                    const isNum = q.type === 'Numerical Value' || q.type === 'Integer' || q.type === 'numerical' || q.type === 'integer-value' || (q.options && q.options.length === 0);
                    let correct = false;
                    if (isNum) correct = String(s.selectedOption).trim() === String(q.correctAnswer).trim();
                    else correct = parseInt(s.selectedOption, 10) === q.correctOptionIndex;
                    
                    if (s.selectedOption === '') bubbleClass = "bg-[#ffc107] text-white"; // Seen but just revealed answer
                    else bubbleClass = correct ? "bg-[#28a745] text-white" : "bg-[#dc3545] text-white";
                 } else if (s && s.selectedOption !== '') {
                    bubbleClass = "bg-[#1976d2] text-white"; // attempted but not checked
                 } else if (idx <= currentQuestionIndex) {
                    bubbleClass = "bg-[#ffc107] text-white"; // seen
                 }

                 return (
                   <button
                     key={idx}
                     onClick={() => setCurrentQuestionIndex(idx)}
                     className={\`w-[32px] h-[32px] rounded-full flex items-center justify-center font-bold text-[12px] shadow-sm hover:opacity-80 transition-all \${bubbleClass} \${idx === currentQuestionIndex ? 'ring-[2px] ring-offset-[2px] ring-[#3f51b5] transform scale-105' : ''}\`}
                   >
                     {idx + 1}
                   </button>
                 );
               })}
             </div>
          </div>

        </div>

      </div>

    </div>
  );
}
`;

const finalLines = [...before, newJSX];
fs.writeFileSync(file, finalLines.join('\n'));
