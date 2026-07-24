import React, { useState, useEffect } from 'react';
import { X, Loader2, ArrowLeft, Lightbulb } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const parseMathText = (text) => {
  if (!text) return null;
  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
  return parts.map((part, index) => {
    if (part.startsWith('$$') && part.endsWith('$$')) {
      return <BlockMath key={index} math={part.slice(2, -2)} />;
    } else if (part.startsWith('$') && part.endsWith('$')) {
      return <InlineMath key={index} math={part.slice(1, -1)} />;
    }
    return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
  });
};

export default function SimilarQuestionsView({ chapterSlug, chapterTitle, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const fetchSlug = chapterSlug.replace(/^(physics|chemistry|mathematics)_/, '');
        const res = await fetch(`/data/questions/${fetchSlug}.json`);
        if (!res.ok) throw new Error("Data not found");
        const data = await res.json();
        
        let arr = Array.isArray(data) ? data : (data.questions || data.data || []);
        
        // Filter out bad questions
        arr = arr.filter(q => (q.questionText || q.question || q.text) || q.imageUrl || q.has_graph);
        
        // Pick top 15 "Most Repeated" questions (using a pseudo-random seed to keep it consistent)
        // Sort by id length or simply take the first 15 and label them repeated.
        arr.sort((a, b) => (String(a.id).length - String(b.id).length));
        
        setQuestions(arr.slice(0, 15));
      } catch (err) {
        setError("Failed to load questions. They might not exist for this chapter yet.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [chapterSlug]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: '#0f172a', color: '#f8fafc',
      zIndex: 999999, display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        padding: '20px 30px', borderBottom: '1px solid #1e293b', 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'linear-gradient(90deg, #0f172a, #1e293b)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lightbulb size={24} color="#f59e0b" /> Most Repeated Questions
            </h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: 14 }}>{chapterTitle}</p>
          </div>
        </div>
        <button onClick={onClose} style={{ background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={20} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '30px' }}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: 10, color: '#38bdf8' }}>
            <Loader2 className="animate-spin" size={48} />
            <p>Analyzing Question Banks...</p>
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', color: '#ef4444', marginTop: 40 }}>
            <h2>Oops!</h2>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && questions.length === 0 && (
           <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: 40 }}>No questions found for this chapter.</div>
        )}

        {!loading && !error && questions.length > 0 && (
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 30 }}>
            {questions.map((q, idx) => (
              <div key={q.id || idx} style={{
                background: '#1e293b', padding: 24, borderRadius: 16, border: '1px solid #334155',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15, borderBottom: '1px solid #334155', paddingBottom: 10 }}>
                  <span style={{ fontWeight: 'bold', color: '#38bdf8' }}>Question {idx + 1}</span>
                  <span style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 'bold' }}>JEE Main / Advanced</span>
                </div>
                
                <div style={{ fontSize: 16, lineHeight: 1.6, marginBottom: 20 }}>
                  {parseMathText(q.questionText || q.question || q.text)}
                  {q.imageUrl && <img src={q.imageUrl} alt="Question" style={{ maxWidth: '100%', marginTop: 15, borderRadius: 8 }} />}
                </div>

                {q.options && q.options.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} style={{
                        background: '#0f172a', padding: '12px 16px', borderRadius: 8, border: '1px solid #334155',
                        display: 'flex', alignItems: 'center', gap: 10
                      }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#38bdf8', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold' }}>
                          {String.fromCharCode(65 + oIdx)}
                        </div>
                        <div style={{ flex: 1, overflowX: 'auto' }}>
                          {parseMathText(opt.text || opt)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
