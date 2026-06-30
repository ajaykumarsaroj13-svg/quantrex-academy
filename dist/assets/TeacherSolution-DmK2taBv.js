import{r as n,j as t}from"./index-Cv2TlAnU.js";function x({html:i,isLight:o=!0,correctOptionLabel:s}){const r=n.useRef(null),l=n.useMemo(()=>{var a,d;if(!i)return'<p class="text-gray-500 italic">Solution coming soon. Stay tuned!</p>';let e=i;return typeof e=="object"&&(e=((a=e.en)==null?void 0:a.explanation)||((d=e.en)==null?void 0:d.solution)||e.explanation||e.solution||""),e?(e=String(e),e=e.replace(/\\root\s+([a-zA-Z0-9]+)\s+\\of\s+\{([^}]+)\}/g,"\\sqrt[$1]{$2}"),e=e.replace(/\\root\s+([a-zA-Z0-9]+)\s+\\of\s+([a-zA-Z0-9]+)/g,"\\sqrt[$1]{$2}"),e=e.replace(/\\Rightarrow([a-zA-Z]+)/g,"\\Rightarrow \\text{$1}"),e=e.replace(/(Step\s*\d+|Case\s*\d+|Method\s*\d+):/gi,'<span class="step-badge">$1</span>'),e=e.replace(/(Hence|Therefore|Thus|Now|Clearly|Observe that|We know that),/gi,'<span class="connector-word">$1</span>,'),e):'<p class="text-gray-500 italic">Solution coming soon. Stay tuned!</p>'},[i]);n.useEffect(()=>{const e=setTimeout(()=>{window.MathJax&&window.MathJax.typesetPromise&&r.current&&(window.MathJax.typesetClear&&window.MathJax.typesetClear([r.current]),window.MathJax.typesetPromise([r.current]).catch(a=>console.log("MathJax error:",a)))},150);return()=>clearTimeout(e)},[l]);const p=n.useMemo(()=>{if(!s)return null;const e=String(s).trim();return e.includes(",")?`Options ${e} are Correct`:!isNaN(Number(e))||e.length>2?`Correct Answer: ${e}`:`Option ${e} is Correct`},[s]);return t.jsxs("div",{className:`premium-solution-wrapper ${o?"light":"dark"}`,children:[t.jsx("style",{children:`
        .premium-solution-wrapper {
          margin-top: 18px;
          margin-bottom: 10px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-size: 15px;
          line-height: 1.7;
        }

        .correct-badge-premium {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          font-weight: 800;
          font-size: 14px;
          padding: 8px 18px;
          border-radius: 12px;
          margin-bottom: 16px;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .solution-content-card {
          border: 1px solid ${o?"rgba(59, 130, 246, 0.15)":"rgba(56, 189, 248, 0.15)"};
          background: ${o?"linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)":"linear-gradient(180deg, #1b2035 0%, #121626 100%)"};
          box-shadow: ${o?"0 10px 25px -5px rgba(59, 130, 246, 0.05), 0 8px 10px -6px rgba(59, 130, 246, 0.05)":"0 10px 30px -5px rgba(0, 0, 0, 0.25)"};
          padding: 22px 26px;
          border-radius: 16px;
          position: relative;
          overflow: hidden;
        }

        .solution-content-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%);
        }

        .solution-title-premium {
          font-size: 11.5px;
          font-weight: 900;
          color: ${o?"#4f46e5":"#818cf8"};
          margin-bottom: 18px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .solution-title-icon {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          display: inline-block;
        }
        
        .solution-body {
          color: ${o?"#334155":"#cbd5e1"};
        }
        
        .solution-body p {
          margin-bottom: 14px;
        }
        
        .solution-body p:last-child {
          margin-bottom: 0;
        }

        /* Color accents for math formulas */
        .solution-body .mjx-container,
        .solution-body .MathJax {
          color: ${o?"#2563eb":"#38bdf8"} !important;
          font-weight: 500;
        }

        /* Bold terms highlighted with warm brand colors */
        .solution-body strong, 
        .solution-body b {
          font-weight: 700;
          color: ${o?"#b45309":"#f59e0b"};
          background: ${o?"rgba(245, 158, 11, 0.06)":"rgba(245, 158, 11, 0.12)"};
          padding: 1px 5px;
          border-radius: 4px;
          border: 1px solid ${o?"rgba(245, 158, 11, 0.15)":"rgba(245, 158, 11, 0.2)"};
        }

        /* Connector words highlighted softly */
        .connector-word {
          color: ${o?"#8b5cf6":"#a78bfa"};
          font-weight: 600;
        }

        /* Beautiful colorful step badges */
        .step-badge {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: #ffffff !important;
          font-weight: 800;
          font-size: 10.5px;
          padding: 2.5px 8px;
          border-radius: 6px;
          margin-right: 8px;
          display: inline-flex;
          align-items: center;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.15);
        }

        /* Preserve images cleanly */
        .solution-body img {
          max-width: 100%;
          height: auto;
          margin: 16px auto;
          display: block;
          border-radius: 10px;
          box-shadow: ${o?"0 4px 12px rgba(0,0,0,0.05)":"0 4px 16px rgba(0,0,0,0.3)"};
          border: 1px solid ${o?"rgba(0,0,0,0.05)":"rgba(255,255,255,0.05)"};
        }

        /* Dark mode specific for images */
        .dark .solution-body img {
          filter: brightness(0.95);
          background: transparent;
        }
      `}),p&&t.jsxs("div",{className:"correct-badge-premium",children:[t.jsx("span",{className:"flex items-center justify-center bg-white/20 rounded-full p-0.5",children:t.jsx("svg",{className:"w-4 h-4 text-white",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"3",d:"M5 13l4 4L19 7"})})}),p]}),t.jsxs("div",{className:"solution-content-card",children:[t.jsxs("div",{className:"solution-title-premium",children:[t.jsx("span",{className:"solution-title-icon"}),"Step-by-Step Explanation"]}),t.jsx("div",{ref:r,className:"tex2jax_process solution-body",dangerouslySetInnerHTML:{__html:l}})]})]})}export{x as T};
