import React, { useMemo, useEffect } from 'react';

/**
 * TeacherSolution
 * Renders solutions in a highly readable, premium format tailored for weak students.
 * Multi-colored, highlighted, clean font.
 */
export default function TeacherSolution({ html, isLight = true, correctOptionLabel }) {
  const content = useMemo(() => {
    if (!html) return '<p class="text-gray-500 italic text-sm">Solution coming soon. Stay tuned! 📝</p>';
    
    let text = html;
    if (typeof text === 'object') {
      text = text.en?.explanation || text.en?.solution || text.explanation || text.solution || '';
    }
    if (!text) return '<p class="text-gray-500 italic text-sm">Solution coming soon. Stay tuned! 📝</p>';
    
    text = String(text);
    
    // Strip inline styles and fonts from ExamGoal data to apply our own premium styling
    text = text.replace(/style\s*=\s*"[^"]*"/gi, '');
    text = text.replace(/style\s*=\s*'[^']*'/gi, '');
    text = text.replace(/color\s*=\s*"[^"]*"/gi, '');
    text = text.replace(/size\s*=\s*"[^"]*"/gi, '');
    
    // Fix scattered MathJax issues
    text = text.replace(/\\root\s+([a-zA-Z0-9]+)\s+\\of\s+\{([^}]+)\}/g, '\\sqrt[$1]{$2}');
    text = text.replace(/\\root\s+([a-zA-Z0-9]+)\s+\\of\s+([a-zA-Z0-9]+)/g, '\\sqrt[$1]{$2}');
    text = text.replace(/\\Rightarrow([a-zA-Z]+)/g, '\\Rightarrow \\text{$1}');
    
    return text;
  }, [html]);

  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise().catch((err) => console.log('MathJax error in TeacherSolution:', err));
    }
  }, [content]);

  // Determine correct answer phrasing
  const answerText = useMemo(() => {
    if (!correctOptionLabel) return null;
    const label = String(correctOptionLabel).trim();
    if (label.includes(',')) {
      return `Options ${label} are Correct!`;
    }
    if (!isNaN(Number(label)) || label.length > 2) {
      return `Correct Answer: ${label}`;
    }
    return `Option ${label} is Correct!`;
  }, [correctOptionLabel]);

  return (
    <div className={`premium-solution-wrapper ${isLight ? 'light-theme' : 'dark-theme'}`}>
      <style>{`
        .premium-solution-wrapper {
          position: relative;
          background: var(--sol-bg, #ffffff);
          border-radius: 12px;
          border: 1px solid var(--sol-border, #e2e8f0);
          padding: 28px;
          overflow: hidden;
          font-family: 'Inter', 'Roboto', 'Segoe UI', sans-serif !important;
          font-size: 1.05rem;
          line-height: 1.8;
          color: var(--sol-text, #1e293b);
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }
        
        .premium-solution-wrapper.dark-theme {
          --sol-bg: #1e293b;
          --sol-border: #334155;
          --sol-text: #e2e8f0;
          --highlight-bg: rgba(56, 189, 248, 0.1);
          --correct-bg: rgba(34, 197, 94, 0.1);
          --correct-border: rgba(34, 197, 94, 0.4);
          --header-color: #38bdf8;
        }
        
        .premium-solution-wrapper.light-theme {
          --sol-bg: #ffffff;
          --sol-border: #e2e8f0;
          --sol-text: #334155;
          --highlight-bg: #f0f9ff;
          --correct-bg: #f0fdf4;
          --correct-border: #86efac;
          --header-color: #3b82f6;
        }

        .premium-solution-wrapper * {
          font-family: inherit;
        }

        .sol-correct-option {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #16a34a; /* Green */
          font-size: 1.25rem;
          font-weight: 700;
          padding: 12px 20px;
          border-left: 4px solid #16a34a;
          border-radius: 8px;
          margin-bottom: 24px;
          background: var(--correct-bg);
          box-shadow: inset 0 0 0 1px var(--correct-border);
        }
        
        .dark-theme .sol-correct-option {
          color: #4ade80;
          border-left: 4px solid #4ade80;
        }

        .sol-header-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--header-color);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 16px;
          border-bottom: 2px dashed var(--sol-border);
          padding-bottom: 8px;
          display: inline-block;
        }

        /* Highlighting and distinct text elements */
        .premium-solution-wrapper strong, 
        .premium-solution-wrapper b {
          color: #ea580c; /* Orange highlighting for important points */
          font-weight: 700;
          background: rgba(234, 88, 12, 0.1);
          padding: 0 4px;
          border-radius: 4px;
        }
        
        .dark-theme .premium-solution-wrapper strong,
        .dark-theme .premium-solution-wrapper b {
           color: #f97316;
           background: rgba(249, 115, 22, 0.15);
        }

        /* Equation Box styling */
        .premium-solution-wrapper .MathJax,
        .premium-solution-wrapper mjx-container,
        .premium-solution-wrapper .tex2jax_process {
          color: var(--sol-text) !important;
        }
        
        /* Clean paragraph spacing for readability */
        .premium-solution-wrapper p {
          margin-bottom: 16px;
          padding: 12px 16px;
          background: var(--highlight-bg);
          border-radius: 8px;
          border-left: 3px solid var(--header-color);
        }

        .premium-solution-wrapper img {
          max-width: 100%;
          height: auto;
          margin: 20px auto;
          display: block;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          /* Very aggressive filter to erase ExamGoal watermarks completely */
          filter: url(#watermark-threshold) grayscale(100%) contrast(1.2);
          mix-blend-mode: multiply;
        }
        
        .dark-theme .premium-solution-wrapper img {
           mix-blend-mode: normal;
           background: white;
           padding: 10px;
        }

        @media (max-width: 640px) {
          .premium-solution-wrapper {
            padding: 20px 16px;
            font-size: 1rem;
          }
          .sol-correct-option {
            font-size: 1.1rem;
          }
        }
      `}</style>
      
      {/* Invisible SVG Filter for removing watermark */}
      <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
        <filter id="watermark-threshold">
          <feComponentTransfer>
            <feFuncR type="linear" slope="4" intercept="-2"/>
            <feFuncG type="linear" slope="4" intercept="-2"/>
            <feFuncB type="linear" slope="4" intercept="-2"/>
          </feComponentTransfer>
        </filter>
      </svg>
      
      {answerText && (
        <div className="sol-correct-option">
          <span>🎯</span>
          <span>{answerText}</span>
        </div>
      )}
      
      <div className="sol-header-title">Step-by-Step Explanation</div>
      
      <div className="tex2jax_process solution-content-area" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}
