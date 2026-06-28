import React, { useMemo, useEffect, useRef } from 'react';

/**
 * TeacherSolution
 * Beautiful, neat, and highly readable format.
 * Preserves original MathJax rendering perfectly.
 */
export default function TeacherSolution({ html, isLight = true, correctOptionLabel }) {
  const containerRef = useRef(null);

  const content = useMemo(() => {
    if (!html) return '<p class="text-gray-500 italic">Solution coming soon. Stay tuned!</p>';
    
    let text = html;
    if (typeof text === 'object') {
      text = text.en?.explanation || text.en?.solution || text.explanation || text.solution || '';
    }
    if (!text) return '<p class="text-gray-500 italic">Solution coming soon. Stay tuned!</p>';
    
    text = String(text);
    
    // Fix scattered MathJax rendering issues
    text = text.replace(/\\root\s+([a-zA-Z0-9]+)\s+\\of\s+\{([^}]+)\}/g, '\\sqrt[$1]{$2}');
    text = text.replace(/\\root\s+([a-zA-Z0-9]+)\s+\\of\s+([a-zA-Z0-9]+)/g, '\\sqrt[$1]{$2}');
    text = text.replace(/\\Rightarrow([a-zA-Z]+)/g, '\\Rightarrow \\text{$1}');
    
    return text;
  }, [html]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.MathJax && window.MathJax.typesetPromise && containerRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([containerRef.current]);
        }
        window.MathJax.typesetPromise([containerRef.current]).catch((err) => console.log('MathJax error:', err));
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [content]);

  // Determine correct answer phrasing
  const answerText = useMemo(() => {
    if (!correctOptionLabel) return null;
    const label = String(correctOptionLabel).trim();
    if (label.includes(',')) {
      return `Options ${label} are Correct`;
    }
    if (!isNaN(Number(label)) || label.length > 2) {
      return `Correct Answer: ${label}`;
    }
    return `Option ${label} is Correct`;
  }, [correctOptionLabel]);

  return (
    <div className={`simple-solution-wrapper ${isLight ? 'light' : 'dark'}`}>
      <style>{`
        .simple-solution-wrapper {
          color: ${isLight ? '#334155' : '#e2e8f0'};
          margin-top: 10px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-size: 14.5px;
          line-height: 1.65;
        }

        .correct-badge {
          display: inline-flex;
          align-items: center;
          background: ${isLight ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' : 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.1) 100%)'};
          color: ${isLight ? '#15803d' : '#4ade80'};
          font-weight: 700;
          font-size: 14.5px;
          padding: 8px 18px;
          border-radius: 8px;
          margin-bottom: 24px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          border: 1px solid ${isLight ? '#86efac' : 'rgba(74, 222, 128, 0.2)'};
        }

        .solution-content-wrapper {
          border-left: 3px solid ${isLight ? '#3b82f6' : '#38bdf8'};
          background: ${isLight ? 'rgba(241, 245, 249, 0.5)' : 'rgba(15, 23, 42, 0.3)'};
          padding: 16px 20px;
          border-radius: 0 8px 8px 0;
        }

        .solution-title {
          font-size: 13px;
          font-weight: 800;
          color: ${isLight ? '#3b82f6' : '#38bdf8'};
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .solution-content p {
          margin-bottom: 12px;
        }
        
        .solution-content p:last-child {
          margin-bottom: 0;
        }

        .solution-content strong, 
        .solution-content b {
          font-weight: 600;
          color: ${isLight ? '#000000' : '#ffffff'};
        }

        /* Preserve images cleanly */
        .solution-content img {
          max-width: 100%;
          height: auto;
          margin: 12px auto;
          display: block;
          border-radius: 6px;
        }

        /* Dark mode specific for images */
        .dark .solution-content img {
          filter: brightness(0.95);
          background: transparent;
        }
      `}</style>
      
      {answerText && (
        <div className="correct-badge">
          ✅ {answerText}
        </div>
      )}
      
      <div className="solution-content-wrapper">
        <div className="solution-title">Step-by-Step Explanation</div>
        <div 
          ref={containerRef}
          className="tex2jax_process solution-content" 
          dangerouslySetInnerHTML={{ __html: content }} 
        />
      </div>
    </div>
  );
}
