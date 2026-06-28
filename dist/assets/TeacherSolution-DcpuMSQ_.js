import{r as s,j as t}from"./index-pxtdhbrr.js";function c({html:r,isLight:l=!0,correctOptionLabel:o}){const a=s.useMemo(()=>{var i,n;if(!r)return'<p style="color:#999;font-style:italic;font-family:sans-serif;font-size:14px;">Solution coming soon — stay tuned! 📝</p>';let e=r;return typeof e=="object"&&(e=((i=e.en)==null?void 0:i.explanation)||((n=e.en)==null?void 0:n.solution)||e.explanation||e.solution||""),e?(e=String(e),e=e.replace(/style\s*=\s*"[^"]*"/gi,""),e=e.replace(/style\s*=\s*'[^']*'/gi,""),e=e.replace(/\\root\s+([a-zA-Z0-9]+)\s+\\of\s+\{([^}]+)\}/g,"\\sqrt[$1]{$2}"),e=e.replace(/\\root\s+([a-zA-Z0-9]+)\s+\\of\s+([a-zA-Z0-9]+)/g,"\\sqrt[$1]{$2}"),e=e.replace(/\\Rightarrow([a-zA-Z]+)/g,"\\Rightarrow \\text{$1}"),e):'<p style="color:#999;font-style:italic;font-family:sans-serif;font-size:14px;">Solution coming soon — stay tuned! 📝</p>'},[r]);return s.useEffect(()=>{window.MathJax&&window.MathJax.typesetPromise&&window.MathJax.typesetPromise().catch(e=>console.log("MathJax error in TeacherSolution:",e))},[a]),t.jsxs("div",{className:"teacher-solution-wrapper",children:[t.jsx("style",{children:`
        .teacher-solution-wrapper {
          position: relative;
          background: #ffffff !important; /* Always white paper */
          border-radius: 4px;
          padding: 24px;
          overflow: hidden;
          font-family: 'Kalam', 'Caveat', cursive !important;
          font-size: 1.3rem;
          line-height: 2.2rem;
          letter-spacing: 0.2px;
          color: #1a237e !important; /* Blue Pen for main text */
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .teacher-solution-wrapper * {
          font-family: 'Kalam', 'Caveat', cursive !important;
          color: #1a237e; /* Force dark blue text for all children */
        }

        .sol-correct-option {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #4a148c !important; /* Purple Pen */
          font-size: 1.4rem;
          font-weight: 700;
          padding: 6px 16px;
          border: 2px solid #ce93d8;
          border-radius: 4px;
          margin-bottom: 20px;
          background: #fdfaf6;
        }

        /* Red pen for headings */
        .sol-red-heading, .teacher-solution-wrapper strong, .teacher-solution-wrapper b {
          color: #d32f2f !important;
          font-weight: 700;
        }

        /* Math equations in Black ink */
        .teacher-solution-wrapper .MathJax,
        .teacher-solution-wrapper mjx-container,
        .teacher-solution-wrapper .tex2jax_process,
        .teacher-solution-wrapper .katex {
          color: #212121 !important;
          font-family: inherit !important;
        }

        .teacher-solution-wrapper .MathJax *,
        .teacher-solution-wrapper mjx-container * {
          color: #212121 !important;
        }

        .teacher-solution-wrapper p {
          margin-bottom: 12px;
        }

        .teacher-solution-wrapper img {
          max-width: 100%;
          height: auto;
          margin: 16px auto;
          display: block;
          /* Aggressive filter to erase ExamGoal watermarks completely */
          filter: url(#watermark-threshold) grayscale(100%);
          mix-blend-mode: multiply;
        }

        @media (max-width: 640px) {
          .teacher-solution-wrapper {
            padding: 16px 8px;
            font-size: 1.2rem;
            line-height: 2rem;
          }
        }
      `}),t.jsx("svg",{width:"0",height:"0",style:{position:"absolute",pointerEvents:"none"},children:t.jsx("filter",{id:"watermark-threshold",children:t.jsxs("feComponentTransfer",{children:[t.jsx("feFuncR",{type:"linear",slope:"4",intercept:"-2"}),t.jsx("feFuncG",{type:"linear",slope:"4",intercept:"-2"}),t.jsx("feFuncB",{type:"linear",slope:"4",intercept:"-2"})]})})}),o&&t.jsxs("div",{className:"sol-correct-option",children:[t.jsx("span",{children:"✅"}),t.jsxs("span",{children:["Correct Answer: ",o]})]}),t.jsx("div",{className:"tex2jax_process",dangerouslySetInnerHTML:{__html:a}})]})}export{c as T};
