import React, { useMemo } from 'react';

/**
 * TeacherSolution
 * Renders a solution in a clean, white handwritten style resembling an expert teacher.
 */
export default function TeacherSolution({ html, isLight = true }) {
  const content = useMemo(() => {
    if (!html) return '<p>No explanation provided.</p>';
    
    let text = html.toString();
    text = text.replace(/\\root\s+([a-zA-Z0-9]+)\s+\\of\s+([a-zA-Z0-9]+)/g, '\\sqrt[$1]{$2}');
    
    // Add colored highlights to important keywords if they exist as text
    const keywords = ['Concept:', 'Given:', 'Formula:', 'Solution:', 'Therefore,', 'Hence,', 'Step 1:', 'Step 2:', 'Step 3:'];
    keywords.forEach(kw => {
       const regex = new RegExp(`(${kw})`, 'g');
       text = text.replace(regex, `<span class="sol-heading">$1</span>`);
    });

    return text;
  }, [html]);

  const bgClass = isLight ? 'bg-white' : 'bg-[#1a1b26]';
  const textClass = isLight ? 'text-[#1e3a8a]' : 'text-[#a9b1d6]'; // Dark blue ink for light, soft slate for dark
  
  return (
    <div className={`${bgClass} ${textClass} p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full`}
         style={{ fontFamily: "'Caveat', cursive", fontSize: '1.45rem', lineHeight: '2.2rem', letterSpacing: '0.5px' }}>
      <style>{`
        .sol-heading, strong, b {
          color: ${isLight ? '#dc2626' : '#f7768e'}; /* Reddish/Pinkish */
          font-weight: 700;
          letter-spacing: 0.5px;
          border-bottom: 2px dashed ${isLight ? '#fca5a5' : '#f7768e'};
        }
        .tex2jax_process {
          color: ${isLight ? '#0369a1' : '#7dcfff'}; /* Light Blueish math */
        }
      `}</style>
      <div className="flex items-center justify-between mb-4 border-b pb-2" style={{ borderColor: isLight ? '#f1f5f9' : '#24283b' }}>
        <div style={{ color: isLight ? '#059669' : '#9ece6a', fontWeight: 700, fontSize: '1.1rem', fontFamily: 'ui-sans-serif, system-ui, sans-serif', textTransform: 'uppercase', letterSpacing: '1px' }}>
          <span style={{ borderBottom: '2px solid currentColor' }}>Short Hand Method</span> ✍️
        </div>
      </div>
      <div className="tex2jax_process leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}
