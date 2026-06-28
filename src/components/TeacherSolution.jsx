import React, { useMemo, useEffect, useRef } from 'react';

/**
 * TeacherSolution
 * Minimal, native-looking format with guaranteed MathJax processing.
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
          font-size: 16px;
          line-height: 1.6;
        }

        .correct-badge {
          display: inline-flex;
          align-items: center;
          background: ${isLight ? '#dcfce7' : 'rgba(34, 197, 94, 0.15)'};
          color: ${isLight ? '#166534' : '#4ade80'};
          font-weight: 600;
          font-size: 15px;
          padding: 6px 14px;
          border-radius: 6px;
          margin-bottom: 20px;
        }

        .solution-title {
          font-size: 14px;
          font-weight: 700;
          color: ${isLight ? '#64748b' : '#94a3b8'};
          margin-bottom: 12px;
          text-transform: uppercase;
        }
        
        .solution-content p {
          margin-bottom: 12px;
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
          margin: 10px auto;
          display: block;
          border-radius: 4px;
        }

        /* Dark mode specific for images */
        .dark .solution-content img {
          filter: brightness(0.9);
          background: transparent;
        }
      `}</style>
      
      {answerText && (
        <div className="correct-badge">
          ✅ {answerText}
        </div>
      )}
      
      <div className="solution-title">Explanation</div>
      
      <div 
        ref={containerRef}
        className="tex2jax_process solution-content" 
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    </div>
  );
}
