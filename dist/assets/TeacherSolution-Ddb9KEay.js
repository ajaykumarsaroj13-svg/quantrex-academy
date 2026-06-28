import{r as n,j as o}from"./index-CzQntlea.js";function d({html:t,isLight:l=!0,correctOptionLabel:r}){const a=n.useMemo(()=>{var i,s;if(!t)return'<p style="color:#9ca3af;font-style:italic;font-size:15px;">Solution coming soon — stay tuned! 📝</p>';let e=t;return typeof e=="object"&&(e=((i=e.en)==null?void 0:i.explanation)||((s=e.en)==null?void 0:s.solution)||e.explanation||e.solution||""),e?(e=String(e),e=e.replace(/style\s*=\s*"[^"]*"/gi,""),e=e.replace(/style\s*=\s*'[^']*'/gi,""),e=e.replace(/\\root\s+([a-zA-Z0-9]+)\s+\\of\s+\{([^}]+)\}/g,"\\sqrt[$1]{$2}"),e=e.replace(/\\root\s+([a-zA-Z0-9]+)\s+\\of\s+([a-zA-Z0-9]+)/g,"\\sqrt[$1]{$2}"),e=e.replace(/\\Rightarrow([a-zA-Z]+)/g,"\\Rightarrow \\text{$1}"),e):'<p style="color:#9ca3af;font-style:italic;font-size:15px;">Solution coming soon — stay tuned! 📝</p>'},[t]);return n.useEffect(()=>{window.MathJax&&window.MathJax.typesetPromise&&window.MathJax.typesetPromise().catch(e=>console.log("MathJax error in TeacherSolution:",e))},[a]),o.jsxs("div",{className:`teacher-solution-wrapper ${l?"light-mode":"dark-mode"}`,children:[o.jsx("style",{children:`
        .teacher-solution-wrapper {
          position: relative;
          border-radius: 12px;
          padding: 28px 32px;
          overflow: hidden;
          font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
          font-size: 1.05rem;
          line-height: 1.8;
          transition: all 0.3s ease;
        }

        /* Light Mode Styles */
        .teacher-solution-wrapper.light-mode {
          background: #ffffff;
          color: #374151;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }

        /* Dark Mode Styles */
        .teacher-solution-wrapper.dark-mode {
          background: #1e2538;
          color: #d1d5db;
          border: 1px solid #2d3748;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }

        /* Typography & Content */
        .teacher-solution-wrapper * {
          font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
        }

        .sol-correct-option {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 1.1rem;
          font-weight: 700;
          padding: 10px 20px;
          border-radius: 8px;
          margin-bottom: 24px;
          transition: all 0.3s ease;
        }
        
        .light-mode .sol-correct-option {
          color: #059669;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
        }
        
        .dark-mode .sol-correct-option {
          color: #34d399;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(52, 211, 153, 0.2);
        }

        /* Headings & Strong Text */
        .teacher-solution-wrapper strong, .teacher-solution-wrapper b {
          font-weight: 700;
        }
        
        .light-mode strong, .light-mode b { color: #111827; }
        .dark-mode strong, .dark-mode b { color: #f3f4f6; }

        /* Math Equations */
        .teacher-solution-wrapper .MathJax,
        .teacher-solution-wrapper mjx-container,
        .teacher-solution-wrapper .tex2jax_process,
        .teacher-solution-wrapper .katex {
          font-family: inherit !important;
        }

        .light-mode .MathJax, .light-mode mjx-container, .light-mode .MathJax * { color: #1f2937 !important; }
        .dark-mode .MathJax, .dark-mode mjx-container, .dark-mode .MathJax * { color: #e5e7eb !important; }

        .teacher-solution-wrapper p {
          margin-bottom: 16px;
        }

        /* Images */
        .teacher-solution-wrapper img {
          max-width: 100%;
          height: auto;
          margin: 20px auto;
          display: block;
          border-radius: 8px;
          /* Remove watermark filter */
          filter: url(#watermark-threshold);
        }
        
        .light-mode img {
          mix-blend-mode: multiply;
        }
        
        /* In dark mode, invert image colors for better visibility of math/graphs, but preserve some contrast */
        .dark-mode img {
          filter: url(#watermark-threshold) invert(1) hue-rotate(180deg) brightness(1.2);
          background: white;
          padding: 8px;
        }

        @media (max-width: 640px) {
          .teacher-solution-wrapper {
            padding: 20px 16px;
            font-size: 1rem;
            line-height: 1.6;
          }
        }
      `}),o.jsx("svg",{width:"0",height:"0",style:{position:"absolute",pointerEvents:"none"},children:o.jsx("filter",{id:"watermark-threshold",children:o.jsxs("feComponentTransfer",{children:[o.jsx("feFuncR",{type:"linear",slope:"3",intercept:"-1.5"}),o.jsx("feFuncG",{type:"linear",slope:"3",intercept:"-1.5"}),o.jsx("feFuncB",{type:"linear",slope:"3",intercept:"-1.5"})]})})}),r&&o.jsxs("div",{className:"sol-correct-option",children:[o.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"3",strokeLinecap:"round",strokeLinejoin:"round",children:o.jsx("polyline",{points:"20 6 9 17 4 12"})}),o.jsxs("span",{children:["Correct Answer: ",r]})]}),o.jsx("div",{className:"tex2jax_process",dangerouslySetInnerHTML:{__html:a}})]})}export{d as T};
