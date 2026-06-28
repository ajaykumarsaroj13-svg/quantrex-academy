import React, { useMemo, useEffect } from 'react';

/**
 * TeacherSolution
 * Simple, clean, and highly readable format.
 * Preserves original MathJax rendering perfectly.
 */
export default function TeacherSolution({ html, isLight = true, correctOptionLabel }) {
  const content = useMemo(() => {
    if (!html) return '<p class="text-gray-500 italic">Solution coming soon. Stay tuned!</p>';
    
    let text = html;
    if (typeof text === 'object') {
      text = text.en?.explanation || text.en?.solution || text.explanation || text.solution || '';
    }
    if (!text) return '<p class="text-gray-500 italic">Solution coming soon. Stay tuned!</p>';
    
    text = String(text);
    
    // We do NOT strip styles here to avoid breaking MathJax or ExamGoal tables/layouts.
    // Just fix scattered MathJax rendering issues.
    text = text.replace(/\\root\s+([a-zA-Z0-9]+)\s+\\of\s+\{([^}]+)\}/g, '\\sqrt[$1]{$2}');
    text = text.replace(/\\root\s+([a-zA-Z0-9]+)\s+\\of\s+([a-zA-Z0-9]+)/g, '\\sqrt[$1]{$2}');
    text = text.replace(/\\Rightarrow([a-zA-Z]+)/g, '\\Rightarrow \\text{$1}');
    
    return text;
  }, [html]);

  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise().catch((err) => console.log('MathJax error:', err));
    }
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
          background: ${isLight ? '#ffffff' : '#1e293b'};
          color: ${isLight ? '#334155' : '#e2e8f0'};
          border: 1px solid ${isLight ? '#e2e8f0' : '#334155'};
          border-radius: 8px;
          padding: 20px;
          margin-top: 10px;
          /* Apply clean sans-serif font to wrapper, but DO NOT force it on children with * */
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-size: 16px;
          line-height: 1.6;
        }

        .correct-badge {
          display: inline-flex;
          align-items: center;
          background: ${isLight ? '#dcfce7' : 'rgba(34, 197, 94, 0.2)'};
          color: ${isLight ? '#166534' : '#4ade80'};
          font-weight: 700;
          font-size: 16px;
          padding: 8px 16px;
          border-radius: 6px;
          margin-bottom: 20px;
        }

        .solution-title {
          font-size: 14px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: ${isLight ? '#64748b' : '#94a3b8'};
          margin-bottom: 12px;
          border-bottom: 1px solid ${isLight ? '#e2e8f0' : '#334155'};
          padding-bottom: 4px;
        }
        
        .solution-content p {
          margin-bottom: 12px;
        }

        .solution-content strong, 
        .solution-content b {
          font-weight: 600;
          color: ${isLight ? '#0f172a' : '#f8fafc'};
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
          background: white;
          padding: 8px;
        }
      `}</style>
      
      {answerText && (
        <div className="correct-badge">
          ✅ {answerText}
        </div>
      )}
      
      <div className="solution-title">Explanation</div>
      
      <div className="tex2jax_process solution-content" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}
