import React, { useMemo, useEffect } from 'react';

/**
 * TeacherSolution
 * Renders solutions in a realistic handwritten style with multi-color pen feel.
 * Shows correct option at the top.
 */
export default function TeacherSolution({ html, isLight = true, correctOptionLabel }) {
  const content = useMemo(() => {
    if (!html) return '<p style="color:#999;font-style:italic;font-family:sans-serif;font-size:14px;">Solution coming soon — stay tuned! 📝</p>';
    
    let text = html;
    if (typeof text === 'object') {
      text = text.en?.explanation || text.en?.solution || text.explanation || text.solution || '';
    }
    if (!text) return '<p style="color:#999;font-style:italic;font-family:sans-serif;font-size:14px;">Solution coming soon — stay tuned! 📝</p>';
    
    text = String(text);
    
    // Strip inline styles and fonts from ExamGoal data that break handwriting format
    text = text.replace(/style\s*=\s*"[^"]*"/gi, '');
    text = text.replace(/style\s*=\s*'[^']*'/gi, '');
    
    // Fix scattered MathJax issues
    text = text.replace(/\\root\s+([a-zA-Z0-9]+)\s+\\of\s+\{([^}]+)\}/g, '\\sqrt[$1]{$2}');
    text = text.replace(/\\root\s+([a-zA-Z0-9]+)\s+\\of\s+([a-zA-Z0-9]+)/g, '\\sqrt[$1]{$2}');
    
    // Fix common missing space errors in LaTeX
    text = text.replace(/\\Rightarrow([a-zA-Z]+)/g, '\\Rightarrow \\text{$1}');
    
    return text;
  }, [html]);

  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise().catch((err) => console.log('MathJax error in TeacherSolution:', err));
    }
  }, [content]);

  return (
    <div className="teacher-solution-wrapper">
      <style>{`
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
      
      {correctOptionLabel && (
        <div className="sol-correct-option">
          <span>✅</span>
          <span>Correct Answer: {correctOptionLabel}</span>
        </div>
      )}
      
      <div className="tex2jax_process" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}
