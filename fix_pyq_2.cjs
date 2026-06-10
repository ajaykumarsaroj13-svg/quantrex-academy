const fs = require('fs');
const content = fs.readFileSync('C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/src/pages/StudentDashboard.jsx', 'utf8');

// 1. Restore the deleted lines
let fixed = content.replace(
\                          if (!chapter) return null;
                          return (

                                  <div className="flex flex-wrap gap-2">\,
\                          if (!chapter) return null;
                          return (

                            <div className="space-y-4">
                              <h4 className="text-white font-bold text-sm uppercase tracking-wider text-glow-blue border-b border-white/5 pb-2">
                                {chapter.title}
                              </h4>

                              {/* Topics covered */}
                              {chapter.topics && chapter.topics.length > 0 && (
                                <div className="p-4 bg-cyberdark/60 border border-white/5 rounded-xl space-y-1.5">
                                  <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider block">Topics covered in this chapter:</span>
                                  <div className="flex flex-wrap gap-2">\
);

// 2. Insert ExamGoalChapterOverview as a full window
fixed = fixed.replace(
\      )}

      {!isTrueFullScreen && (<div className={\\\study-portal-wrapper \ px-4 md:px-12 py-10 mx-auto grid grid-cols-1 gap-8 \ themed-root\\\}>\,
\      )}

      {examGoalOverviewConfig && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
            <ExamGoalChapterOverview 
              chapter={examGoalOverviewConfig} 
              onBack={() => setExamGoalOverviewConfig(null)} 
              onLaunchPractice={(config, mode) => {
                 setExamGoalOverviewConfig(null);
                 setActivePracticeMode(mode);
                 if (config.id === 'ch_mathematics_algebra_0') {
                   let allQs = [];
                   if (typeof pyqSetsRelationData !== 'undefined' && pyqSetsRelationData && pyqSetsRelationData.topics) {
                     pyqSetsRelationData.topics.forEach(t => {
                       if (pyqSetsRelationData.questions[t.id]) {
                         allQs = [...allQs, ...pyqSetsRelationData.questions[t.id]];
                       }
                     });
                   }
                   setCustomPracticeQuestions(allQs);
                   setSelectedPyqTopic({ name: config.title });
                 } else {
                   setCustomPracticeQuestions([]);
                   setSelectedPyqTopic({ name: config.title });
                 }
              }} 
            />
        </div>
      )}

      {!isTrueFullScreen && (<div className={\\\study-portal-wrapper \ px-4 md:px-12 py-10 mx-auto grid grid-cols-1 gap-8 \ themed-root\\\}>\
);

fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/src/pages/StudentDashboard.jsx', fixed);
console.log('Fixed full window');
