import{r as d,j as t}from"./index-zcvWKXev.js";import{T as H}from"./TeacherSolution-BB9KAXRx.js";function S(s={}){const h=d.useRef(null);return d.useEffect(()=>{const m=h.current;if(!m)return;const y=new IntersectionObserver(w=>{w.forEach(j=>{j.isIntersecting?(j.target.classList.add("reveal-visible"),s.repeat||y.unobserve(j.target)):s.repeat&&j.target.classList.remove("reveal-visible")})},{threshold:s.threshold||.1,rootMargin:s.rootMargin||"0px 0px -50px 0px"});return y.observe(m),()=>{m&&y.unobserve(m)}},[s.threshold,s.rootMargin,s.repeat]),h}function B({result:s,user:h,onBack:m,onRetake:y}){const[w,j]=d.useState(null),[O,M]=d.useState(!1),[A,P]=d.useState("All"),[N,Q]=d.useState("All"),[T,I]=d.useState(0),_=S(),$=S(),E=S(),U=S();if(d.useEffect(()=>{s!=null&&s.testId&&(M(!0),fetch(`/data/tests/${s.testId}.json?_t=${Date.now()}`).then(e=>e.json()).then(e=>{e&&j(e),M(!1),setTimeout(()=>{var r;(r=window.MathJax)!=null&&r.typesetPromise&&window.MathJax.typesetPromise()},300)}).catch(e=>{console.error("Failed to fetch test details for review:",e),M(!1)}))},[s==null?void 0:s.testId]),d.useEffect(()=>{setTimeout(()=>{var e;(e=window.MathJax)!=null&&e.typesetPromise&&window.MathJax.typesetPromise()},100)},[T,A,N]),!s)return t.jsx("div",{style:{minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",background:"#0a0a1a"},children:t.jsxs("div",{style:{textAlign:"center"},children:[t.jsx("p",{style:{fontSize:20,color:"#94a3b8"},children:"No test result data found."}),t.jsx("button",{onClick:m,style:{marginTop:20,padding:"10px 24px",background:"#3b82f6",color:"#fff",border:"none",borderRadius:8,cursor:"pointer"},children:"Go Back"})]})});const J=e=>{if(!e)return"0m 0s";const r=Math.floor(e/3600),i=Math.floor(e%3600/60),x=e%60;return r>0?`${r}h ${i}m ${x}s`:`${i}m ${x}s`},F=()=>{const e=(s.correctCount||0)+(s.wrongCount||0);return e===0?"0%":`${Math.round((s.correctCount||0)/e*100)}%`},Y=(w==null?void 0:w.questions)||s.questions||[];s.answers;const l=Y.map(e=>{var g,b,f,L;if(s.questionResults){const n=s.questionResults.find(o=>o.questionId===e._id),v=(n==null?void 0:n.isAttempted)||!1;return{...e,userAnswer:n==null?void 0:n.userAnswer,isCorrect:(n==null?void 0:n.isCorrect)||!1,marksAwarded:(n==null?void 0:n.marksAwarded)||0,isAttempted:v}}const r=answers[e.questionNumber||e._id];let i=r!==void 0&&r!=="";Array.isArray(r)&&(i=r.length>0);const x=e.questionType!=="NUMERICAL"&&(e.questionType==="MULTI_CORRECT"||e.questionType==="MCQM"||e.questionType==="multi_correct"||e.questionType==="multiple_correct"||e.questionType==="MCQM"||e.questionType==="mcqm"||e.questionType==="MCQ (Multiple Correct)"||e.questionType==="Multiple Correct"||e.correctOptionsArray&&e.correctOptionsArray.length>0||e.isMultiCorrect||((b=(g=e.question)==null?void 0:g.en)==null?void 0:b.correct_options)&&e.question.en.correct_options.length>1||e.correctAnswer&&(String(e.correctAnswer).includes(",")||String(e.correctAnswer).toLowerCase().includes("and")||String(e.correctAnswer).includes("&"))||Array.isArray(e.correctOptionIndex)||((L=(f=e.question)==null?void 0:f.en)==null?void 0:L.content)&&(e.question.en.content.toLowerCase().includes("one or more")||e.question.en.content.toLowerCase().includes("multiple correct"))||typeof e.question=="string"&&(e.question.toLowerCase().includes("one or more")||e.question.toLowerCase().includes("multiple correct")));let u=!1,c=[];if(i)if(e.questionType==="NUMERICAL")u=String(r).trim()===String(e.correctAnswer||"").trim();else if(x){Array.isArray(e.correctOptionIndex)?c=[...e.correctOptionIndex].sort((v,o)=>v-o):e.correctAnswer&&(String(e.correctAnswer).includes(",")||String(e.correctAnswer).toLowerCase().includes("and")||String(e.correctAnswer).includes("&"))?c=String(e.correctAnswer).replace(/[()]/g,"").replace(/and/ig,",").replace(/&/g,",").split(",").map(o=>{const C=o.trim(),R=parseInt(C,10);if(!isNaN(R))return R;const z=C.toUpperCase().charCodeAt(0);return z>=65&&z<=90?z-65:NaN}).filter(o=>!isNaN(o)).sort((o,C)=>o-C):e.correctOption!==void 0&&(c=[parseInt(e.correctOption)]);const n=Array.isArray(r)?[...r].sort((v,o)=>v-o):[parseInt(r)];u=JSON.stringify(n)===JSON.stringify(c)}else u=parseInt(r)===e.correctOption;const p=u?e.marks:i&&e.questionType!=="NUMERICAL"?e.negativeMarks:0;return{...e,userAnswer:r,isCorrect:u,marksAwarded:p,isAttempted:i,isMultiCorrect:x,actualCorrectArr:c}}),k=l.filter(e=>{const r=A==="All"||e.subject===A,i=N==="All"||N==="Correct"&&e.isAttempted&&e.isCorrect||N==="Incorrect"&&e.isAttempted&&!e.isCorrect||N==="Unattempted"&&!e.isAttempted;return r&&i}),a=k[T];return t.jsxs("div",{className:"tsr-root",children:[t.jsx("style",{children:`
        .tsr-root {
          background: #06060f;
          min-height: 100vh;
          color: #f1f5f9;
          font-family: 'Inter', system-ui, sans-serif;
          padding: 40px 24px;
        }
        .tsr-container {
          max-w: 1200px;
          margin: 0 auto;
        }
        .tsr-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding-bottom: 24px;
        }
        .tsr-title-group h1 {
          font-size: 28px;
          font-weight: 800;
          background: linear-gradient(135deg, #fff 30%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 6px;
        }
        .tsr-subtitle {
          color: #94a3b8;
          font-size: 14px;
        }
        .tsr-action-btns {
          display: flex;
          gap: 16px;
        }
        .tsr-btn {
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }
        .tsr-btn-back {
          background: rgba(255,255,255,0.05);
          color: #f1f5f9;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .tsr-btn-back:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
        }
        .tsr-btn-retake {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: #fff;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .tsr-btn-retake:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }
        .tsr-btn-retake:active, .tsr-btn-back:active, .tsr-q-btn:active {
          transform: scale(0.95);
        }

        /* Stats Grid */
        .tsr-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        .tsr-stat-card {
          background: rgba(30, 41, 59, 0.35);
          border: 1px solid rgba(255,255,255,0.05);
          backdrop-filter: blur(12px);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          position: relative;
          overflow: hidden;
        }
        .tsr-stat-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 100%; height: 3px;
          background: transparent;
        }
        .tsr-stat-card.score::after { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
        .tsr-stat-card.percentile::after { background: linear-gradient(90deg, #a78bfa, #c084fc); }
        .tsr-stat-card.accuracy::after { background: linear-gradient(90deg, #34d399, #6ee7b7); }
        .tsr-stat-card.time::after { background: linear-gradient(90deg, #fbbf24, #fde047); }
        
        .tsr-stat-icon {
          font-size: 32px;
          background: rgba(255,255,255,0.03);
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .tsr-stat-info {
          display: flex;
          flex-direction: column;
        }
        .tsr-stat-label {
          font-size: 12px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }
        .tsr-stat-value {
          font-size: 24px;
          font-weight: 800;
        }

        /* Subjects Panel */
        .tsr-subjects-wrapper {
          background: rgba(30, 41, 59, 0.2);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 40px;
        }
        .tsr-panel-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 20px;
        }
        .tsr-subjects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }
        .tsr-subject-card {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255,255,255,0.03);
          border-radius: 14px;
          padding: 20px;
        }
        .tsr-subject-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .tsr-subject-name {
          font-weight: 700;
          font-size: 16px;
        }
        .tsr-subject-name.maths { color: #f472b6; }
        .tsr-subject-name.phy { color: #60a5fa; }
        .tsr-subject-name.chem { color: #34d399; }
        
        .tsr-subject-score {
          font-weight: 800;
          font-size: 18px;
        }
        .tsr-subject-stats {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: #94a3b8;
        }
        .tsr-subject-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .tsr-subject-stat-item span {
          font-weight: 600;
          color: #f1f5f9;
          font-size: 15px;
          margin-top: 4px;
        }

        /* Detailed Question Analysis */
        .tsr-analysis-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 24px;
          align-items: start;
        }
        
        /* Left Sidebar: Palette & Filters */
        .tsr-sidebar-panel {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 16px;
          padding: 20px;
        }
        .tsr-filter-group {
          margin-bottom: 20px;
        }
        .tsr-filter-label {
          font-size: 11px;
          text-transform: uppercase;
          color: #64748b;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        .tsr-tabs-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .tsr-tab-btn {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          color: #94a3b8;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .tsr-tab-btn:hover {
          color: #fff;
          background: rgba(255,255,255,0.08);
        }
        .tsr-tab-btn.active {
          background: #3b82f6;
          color: #fff;
          border-color: #3b82f6;
        }
        
        .tsr-questions-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
          max-height: 380px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .tsr-q-btn {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 8px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tsr-q-btn.correct { background: #065f46; color: #34d399; border: 1px solid #047857; }
        .tsr-q-btn.incorrect { background: #7f1d1d; color: #f87171; border: 1px solid #991b1b; }
        .tsr-q-btn.unattempted { background: #334155; color: #94a3b8; border: 1px solid #475569; }
        
        .tsr-q-btn:hover {
          transform: scale(1.05);
        }
        .tsr-q-btn.selected {
          outline: 3px solid #ffb300;
          outline-offset: 1px;
        }

        /* Right side: Active Question Card */
        .tsr-question-card {
          background: rgba(30, 41, 59, 0.25);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 16px;
          padding: 32px;
        }
        .tsr-q-meta-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .tsr-q-badge-row {
          display: flex;
          gap: 10px;
        }
        .tsr-badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .tsr-badge.subject { background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); }
        .tsr-badge.topic { background: rgba(255,255,255,0.05); color: #e2e8f0; border: 1px solid rgba(255,255,255,0.1); }
        .tsr-badge.difficulty { background: rgba(251,191,36,0.15); color: #fbbf24; border: 1px solid rgba(251,191,36,0.3); }
        
        .tsr-marks-badge {
          font-size: 13px;
          font-weight: 600;
        }
        .tsr-marks-badge.correct { color: #34d399; }
        .tsr-marks-badge.incorrect { color: #f87171; }
        .tsr-marks-badge.unattempted { color: #94a3b8; }
        
        .tsr-q-text {
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 28px;
        }
        .tsr-opts-container {
          display: grid;
          gap: 12px;
          margin-bottom: 32px;
        }
        .tsr-opt-card {
          background: rgba(15, 23, 42, 0.3);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 10px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
            position: relative;
            border: 2px solid rgba(255,255,255,0.04);
        }
        .tsr-opt-card.correct {
          background: rgba(6, 95, 70, 0.15);
          border-color: #22c55e;
        }
        .tsr-opt-card.user-selected {
          background: rgba(127, 29, 29, 0.15);
          border-color: #ef4444;
        }
        .tsr-opt-card.correct.user-selected {
          background: rgba(6, 95, 70, 0.2);
          border-color: #22c55e;
        }
        
        .tsr-opt-letter {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
          color: #94a3b8;
        }
        .tsr-opt-card.correct .tsr-opt-letter { background: #047857; color: #fff; }
        .tsr-opt-card.user-selected .tsr-opt-letter { background: #b91c1c; color: #fff; }
        .tsr-opt-card.correct.user-selected .tsr-opt-letter { background: #047857; color: #fff; }
        
        .tsr-opt-status-badge {
          margin-left: auto;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .tsr-opt-status-badge.correct { color: #34d399; }
        .tsr-opt-status-badge.user-wrong { color: #f87171; }

        .tsr-numerical-review-box {
          background: rgba(15, 23, 42, 0.35);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 32px;
        }
        .tsr-num-item {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }
        .tsr-num-item span.correct { color: #34d399; font-weight: 700; }
        .tsr-num-item span.wrong { color: #f87171; font-weight: 700; }
        .tsr-num-item span.unattempted { color: #94a3b8; }
        
        .tsr-solution-card {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 24px;
          margin-top: 24px;
        }
        .tsr-sol-title {
          font-weight: 700;
          font-size: 15px;
          margin-bottom: 12px;
          color: #fbbf24;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tsr-sol-text {
          font-size: 15px;
          line-height: 1.6;
          color: #cbd5e1;
        }
        
        @media(max-width: 900px) {
          .tsr-analysis-layout {
            grid-template-columns: 1fr;
          }
          .tsr-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .tsr-action-btns {
            width: 100%;
          }
          .tsr-btn {
            flex: 1;
            text-align: center;
          }
        }
      `}),t.jsxs("div",{className:"tsr-container",children:[t.jsxs("div",{ref:_,className:"tsr-header reveal",children:[t.jsxs("div",{className:"tsr-title-group",children:[t.jsx("h1",{children:s.testTitle||"Test Attempt Result"}),t.jsxs("p",{className:"tsr-subtitle",children:["Attempted by ",t.jsx("strong",{children:(h==null?void 0:h.name)||"Candidate"}),"  |  Official Paper Assessment"]})]}),t.jsxs("div",{className:"tsr-action-btns",children:[t.jsx("button",{className:"tsr-btn tsr-btn-back",onClick:m,children:"← Exit Review"}),t.jsx("button",{className:"tsr-btn tsr-btn-retake",onClick:y,children:"🔄 Retake Practice"})]})]}),t.jsxs("div",{ref:$,className:"tsr-stats-grid reveal delay-100",children:[t.jsxs("div",{className:"tsr-stat-card score",children:[t.jsx("div",{className:"tsr-stat-icon",children:"🎯"}),t.jsxs("div",{className:"tsr-stat-info",children:[t.jsx("span",{className:"tsr-stat-label",children:"Total Score"}),t.jsxs("span",{className:"tsr-stat-value",children:[s.totalScore," ",t.jsxs("span",{style:{fontSize:14,fontWeight:500,color:"#64748b"},children:["/ ",s.totalMarks||300]})]})]})]}),t.jsxs("div",{className:"tsr-stat-card percentile",children:[t.jsx("div",{className:"tsr-stat-icon",children:"📊"}),t.jsxs("div",{className:"tsr-stat-info",children:[t.jsx("span",{className:"tsr-stat-label",children:"Estimated Percentile"}),t.jsxs("span",{className:"tsr-stat-value",children:[s.percentile,"%"]})]})]}),t.jsxs("div",{className:"tsr-stat-card accuracy",children:[t.jsx("div",{className:"tsr-stat-icon",children:"📈"}),t.jsxs("div",{className:"tsr-stat-info",children:[t.jsx("span",{className:"tsr-stat-label",children:"Accuracy Rate"}),t.jsx("span",{className:"tsr-stat-value",children:F()})]})]}),t.jsxs("div",{className:"tsr-stat-card time",children:[t.jsx("div",{className:"tsr-stat-icon",children:"⏱"}),t.jsxs("div",{className:"tsr-stat-info",children:[t.jsx("span",{className:"tsr-stat-label",children:"Time Spent"}),t.jsx("span",{className:"tsr-stat-value",children:J(s.timeSpentSeconds)})]})]})]}),t.jsxs("div",{ref:E,className:"tsr-subjects-wrapper reveal delay-200",children:[t.jsx("h2",{className:"tsr-panel-title",children:"Subject-wise Analytics"}),t.jsxs("div",{className:"tsr-subjects-grid",children:[t.jsxs("div",{className:"tsr-subject-card",children:[t.jsxs("div",{className:"tsr-subject-header",children:[t.jsx("span",{className:"tsr-subject-name phy",children:"Physics"}),t.jsx("span",{className:"tsr-subject-score",children:s.physicsScore??"N/A"})]}),t.jsxs("div",{className:"tsr-subject-stats",children:[t.jsxs("div",{className:"tsr-subject-stat-item",children:["Correct",t.jsx("span",{children:l.filter(e=>e.subject==="Physics"&&e.isAttempted&&e.isCorrect).length})]}),t.jsxs("div",{className:"tsr-subject-stat-item",children:["Incorrect",t.jsx("span",{children:l.filter(e=>e.subject==="Physics"&&e.isAttempted&&!e.isCorrect).length})]}),t.jsxs("div",{className:"tsr-subject-stat-item",children:["Unattempted",t.jsx("span",{children:l.filter(e=>e.subject==="Physics"&&!e.isAttempted).length})]})]})]}),t.jsxs("div",{className:"tsr-subject-card",children:[t.jsxs("div",{className:"tsr-subject-header",children:[t.jsx("span",{className:"tsr-subject-name chem",children:"Chemistry"}),t.jsx("span",{className:"tsr-subject-score",children:s.chemistryScore??"N/A"})]}),t.jsxs("div",{className:"tsr-subject-stats",children:[t.jsxs("div",{className:"tsr-subject-stat-item",children:["Correct",t.jsx("span",{children:l.filter(e=>e.subject==="Chemistry"&&e.isAttempted&&e.isCorrect).length})]}),t.jsxs("div",{className:"tsr-subject-stat-item",children:["Incorrect",t.jsx("span",{children:l.filter(e=>e.subject==="Chemistry"&&e.isAttempted&&!e.isCorrect).length})]}),t.jsxs("div",{className:"tsr-subject-stat-item",children:["Unattempted",t.jsx("span",{children:l.filter(e=>e.subject==="Chemistry"&&!e.isAttempted).length})]})]})]}),t.jsxs("div",{className:"tsr-subject-card",children:[t.jsxs("div",{className:"tsr-subject-header",children:[t.jsx("span",{className:"tsr-subject-name maths",children:"Mathematics"}),t.jsx("span",{className:"tsr-subject-score",children:s.mathsScore??"N/A"})]}),t.jsxs("div",{className:"tsr-subject-stats",children:[t.jsxs("div",{className:"tsr-subject-stat-item",children:["Correct",t.jsx("span",{children:l.filter(e=>e.subject==="Mathematics"&&e.isAttempted&&e.isCorrect).length})]}),t.jsxs("div",{className:"tsr-subject-stat-item",children:["Incorrect",t.jsx("span",{children:l.filter(e=>e.subject==="Mathematics"&&e.isAttempted&&!e.isCorrect).length})]}),t.jsxs("div",{className:"tsr-subject-stat-item",children:["Unattempted",t.jsx("span",{children:l.filter(e=>e.subject==="Mathematics"&&!e.isAttempted).length})]})]})]})]})]}),t.jsxs("div",{ref:U,className:"reveal delay-300",children:[t.jsx("h2",{className:"tsr-panel-title",children:"Question-by-Question Review"}),O?t.jsx("div",{style:{padding:"40px 0",textAlign:"center",color:"#94a3b8"},children:t.jsx("p",{children:"Loading detailed question analyses..."})}):t.jsxs("div",{className:"tsr-analysis-layout",children:[t.jsxs("div",{className:"tsr-sidebar-panel",children:[t.jsxs("div",{className:"tsr-filter-group",children:[t.jsx("div",{className:"tsr-filter-label",children:"Subject"}),t.jsx("div",{className:"tsr-tabs-row",children:["All","Physics","Chemistry","Mathematics"].map(e=>t.jsx("button",{className:`tsr-tab-btn ${A===e?"active":""}`,onClick:()=>{P(e),I(0)},children:e},e))})]}),t.jsxs("div",{className:"tsr-filter-group",children:[t.jsx("div",{className:"tsr-filter-label",children:"Status"}),t.jsx("div",{className:"tsr-tabs-row",children:["All","Correct","Incorrect","Unattempted"].map(e=>t.jsx("button",{className:`tsr-tab-btn ${N===e?"active":""}`,onClick:()=>{Q(e),I(0)},children:e},e))})]}),t.jsxs("div",{className:"tsr-filter-group",children:[t.jsxs("div",{className:"tsr-filter-label",children:["Questions (",k.length,")"]}),k.length>0?t.jsx("div",{className:"tsr-questions-grid",children:k.map((e,r)=>{let i="unattempted";return e.isAttempted&&(i=e.isCorrect?"correct":"incorrect"),t.jsx("button",{className:`tsr-q-btn ${i} ${T===r?"selected":""}`,onClick:()=>I(r),children:e.questionNumber},e.questionNumber)})}):t.jsx("p",{style:{fontSize:13,color:"#64748b",fontStyle:"italic",padding:"10px 0"},children:"No questions match filters."})]})]}),t.jsx("div",{className:"tsr-question-card",children:a?t.jsxs("div",{children:[t.jsxs("div",{className:"tsr-q-meta-header",children:[t.jsxs("div",{className:"tsr-q-badge-row",children:[t.jsx("span",{className:"tsr-badge subject",children:a.subject}),a.topic&&t.jsx("span",{className:"tsr-badge topic",children:a.topic}),a.difficulty&&t.jsx("span",{className:"tsr-badge difficulty",children:a.difficulty})]}),t.jsx("div",{children:a.isAttempted?a.isCorrect?t.jsxs("span",{className:"tsr-marks-badge correct",children:["Correct (+",a.marks," Marks)"]}):t.jsxs("span",{className:"tsr-marks-badge incorrect",children:["Incorrect (",a.negativeMarks," Marks)"]}):t.jsx("span",{className:"tsr-marks-badge unattempted",children:"Unattempted (0 Marks)"})})]}),t.jsx("div",{className:"tsr-q-text tex2jax_process",dangerouslySetInnerHTML:{__html:a.questionText}}),a.questionType==="NUMERICAL"?t.jsxs("div",{className:"tsr-numerical-review-box",children:[t.jsxs("div",{className:"tsr-num-item",children:[t.jsx("span",{children:"Your entered answer:"}),t.jsx("span",{className:a.isAttempted?a.isCorrect?"correct":"wrong":"unattempted",children:a.isAttempted?a.userAnswer:"Not Attempted"})]}),t.jsxs("div",{className:"tsr-num-item",children:[t.jsx("span",{children:"Correct answer:"}),t.jsx("span",{className:"correct",children:a.correctAnswer})]})]}):t.jsx("div",{className:"tsr-opts-container",children:(a.options||[]).map((e,r)=>{const i=a.isMultiCorrect,x=a.actualCorrectArr||[],u=Array.isArray(a.userAnswer)?a.userAnswer:[parseInt(a.userAnswer)],c=i?x.includes(r):a.correctOption===r,p=i?u.includes(r):a.userAnswer===r;let g="";c&&p?g="correct user-selected":c&&!p?g="correct":!c&&p&&(g="user-selected user-wrong");let b=null,f="";return c&&p?(b="Your answer | Correct answer",f="bg-[#22c55e]"):c&&!p?(b="Correct answer",f="bg-[#22c55e]"):!c&&p&&(b="Your answer",f="bg-[#ef4444]"),t.jsxs("div",{className:`tsr-opt-card ${g}`,children:[t.jsx("span",{className:"tsr-opt-letter",children:String.fromCharCode(65+r)}),t.jsx("span",{className:"tex2jax_process flex-1",dangerouslySetInnerHTML:{__html:e}}),b&&t.jsx("div",{className:`absolute -top-[10px] right-6 px-2.5 py-[2px] rounded-md text-[10px] font-bold text-white tracking-wide shadow-md ${f}`,children:b})]},r)})}),a.solution&&t.jsx("div",{className:"tsr-solution-card",children:t.jsx(H,{html:a.solution})})]}):t.jsx("div",{style:{textAlign:"center",color:"#94a3b8",padding:"40px 0"},children:"Select a question to view details"})})]})]})]})]})}export{B as default};
