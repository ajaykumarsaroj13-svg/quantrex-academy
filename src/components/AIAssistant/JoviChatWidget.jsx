import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, Trophy, RotateCcw, User, Loader2, Database, ChevronRight, ExternalLink } from "lucide-react";
import { useAIAssistant } from '../../contexts/AIAssistantContext';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

// Helper to get slug for test engine
const getFetchSlug = (examKey, ch) => {
  const slug = (ch.url && ch.url !== '#') ? ch.url.split('/').pop() : (ch.id || '');
  let fetchSlug = String(slug || ch.id || 'unknown');
  if (examKey === 'jee-advanced') {
    if (fetchSlug.startsWith('physics_')) fetchSlug = fetchSlug.replace('physics_', '');
    else if (fetchSlug.startsWith('chemistry_')) fetchSlug = fetchSlug.replace('chemistry_', '');
    else if (fetchSlug.startsWith('mathematics_')) fetchSlug = fetchSlug.replace('mathematics_', '');

    if (!fetchSlug.startsWith('adv-') && !fetchSlug.startsWith('ch_adv_math_')) {
      fetchSlug = 'adv-' + fetchSlug;
    }
  }
  return fetchSlug;
};

// Initial Guided Options
const EXAM_OPTIONS = [
  { label: "JEE Main", value: "jee-mains" },
  { label: "JEE Advanced", value: "jee-advanced" },
  { label: "NDA", value: "nda" }
];

const GREETING = "Welcome to Quantrex AI! Let's generate a real test for you. Please select your target exam:";

// Simple Markdown + Math Renderer
function MessageContent({ text }) {
  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
  return (
    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, wordBreak: 'break-word' }}>
      {parts.map((part, i) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          return <BlockMath key={i} math={part.slice(2, -2)} />;
        } else if (part.startsWith('$') && part.endsWith('$')) {
          return <InlineMath key={i} math={part.slice(1, -1)} />;
        }
        let htmlText = part
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/```([\s\S]*?)```/g, '<pre style="background:#1e293b;padding:10px;border-radius:6px;margin:8px 0;overflow-x:auto;">$1</pre>')
          .replace(/`([^`]+)`/g, '<code style="background:#1e293b;padding:2px 4px;border-radius:4px;color:#38bdf8;">$1</code>');
        return <span key={i} dangerouslySetInnerHTML={{__html: htmlText}} />;
      })}
    </div>
  );
}

// ---------- Main widget ----------
export default function JoviChatWidget() {
  const { isOpen: open, openAssistant, closeAssistant } = useAIAssistant();
  const setOpen = (val) => val ? openAssistant() : closeAssistant();

  const [messages, setMessages] = useState([
    { id: 1, from: "bot", text: GREETING, options: EXAM_OPTIONS.map(e => e.label) },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // State machine context
  const [chatContext, setChatContext] = useState({ 
    step: 'exam', // exam -> subject -> chapter -> count -> time -> ready
    examKey: null, 
    subjectKey: null, 
    chapterSlug: null,
    chapterTitle: null,
    qCount: null,
    duration: null
  });
  
  const [currentChapterPage, setCurrentChapterPage] = useState(0);

  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading, open, currentChapterPage]);

  function addMsg(from, content, options = null, customData = null) {
    setMessages((m) => [...m, { id: Date.now() + Math.random(), from, text: content, options, customData }]);
  }

  async function handleSend(textOverride = null) {
    const text = textOverride ?? input.trim();
    if (!text) return;
    
    if (!textOverride) setInput("");
    addMsg("user", text);
    setIsLoading(true);

    const lowerText = text.toLowerCase();
    await new Promise(resolve => setTimeout(resolve, 600));
    setIsLoading(false);
    
    const syllabus = window.DEFAULT_SYLLABUS || {};

    // Step 1: Select Exam
    if (chatContext.step === 'exam') {
      const match = EXAM_OPTIONS.find(e => e.label.toLowerCase() === lowerText);
      if (match) {
        const examData = syllabus[match.value];
        if (!examData || !examData.subjects) {
           addMsg("bot", `Syllabus data for **${match.label}** is currently unavailable. Please try another exam.`, EXAM_OPTIONS.map(e => e.label));
           return;
        }
        setChatContext(prev => ({ ...prev, step: 'subject', examKey: match.value }));
        const subjects = Object.keys(examData.subjects).map(k => examData.subjects[k].label || k);
        addMsg("bot", `Great choice! Which subject do you want to practice for **${match.label}**?`, subjects);
        return;
      }
    }

    // Step 2: Select Subject
    if (chatContext.step === 'subject') {
      const examData = syllabus[chatContext.examKey];
      const subjKey = Object.keys(examData.subjects).find(k => (examData.subjects[k].label || k).toLowerCase() === lowerText);
      
      if (subjKey) {
        setChatContext(prev => ({ ...prev, step: 'chapter', subjectKey: subjKey }));
        setCurrentChapterPage(0);
        
        const chapters = examData.subjects[subjKey].chapters || [];
        if (chapters.length === 0) {
          addMsg("bot", `No chapters found for this subject. Try another one.`, Object.keys(examData.subjects).map(k => examData.subjects[k].label || k));
          setChatContext(prev => ({ ...prev, step: 'subject' }));
          return;
        }
        
        addMsg("bot", `Awesome! Now select a chapter to practice:`, null, { type: 'chapter_select', chapters, subjectKey: subjKey, examKey: chatContext.examKey });
        return;
      }
    }

    // Step 3: Select Chapter (handled via custom button clicks, but fallback text matching)
    if (chatContext.step === 'chapter') {
      const examData = syllabus[chatContext.examKey];
      const chapters = examData.subjects[chatContext.subjectKey].chapters || [];
      const match = chapters.find(c => c.title.toLowerCase() === lowerText);
      
      if (match) {
        const fetchSlug = getFetchSlug(chatContext.examKey, match);
        setChatContext(prev => ({ ...prev, step: 'count', chapterSlug: fetchSlug, chapterTitle: match.title }));
        
        addMsg("bot", `You selected **${match.title}**. How many questions would you like in this test?`, ["10 Questions", "15 Questions", "20 Questions", "30 Questions"]);
        return;
      }
    }

    // Step 4: Question Count
    if (chatContext.step === 'count') {
      if (lowerText.includes("10") || lowerText.includes("15") || lowerText.includes("20") || lowerText.includes("30")) {
        const count = parseInt(lowerText.match(/\d+/)[0]);
        setChatContext(prev => ({ ...prev, step: 'time', qCount: count }));
        
        addMsg("bot", `Got it, **${count} questions**. How much time do you need?`, ["15 Mins", "30 Mins", "60 Mins"]);
        return;
      }
    }

    // Step 5: Time Limit & Generate
    if (chatContext.step === 'time') {
      if (lowerText.includes("15") || lowerText.includes("30") || lowerText.includes("60") || lowerText.includes("45")) {
        const duration = parseInt(lowerText.match(/\d+/)[0]);
        
        // Build real test payload
        const isAdv = chatContext.examKey === 'jee-advanced';
        
        // Distribute question counts based on total requested
        let typesCount = {};
        if (isAdv) {
          const base = Math.floor(chatContext.qCount / 4);
          typesCount = { MCQ: base*2 || 5, MULTI_CORRECT: base || 5, COMPREHENSION: 0, MATCHING: 0 };
        } else {
          const num = Math.floor(chatContext.qCount * 0.25);
          const mcq = chatContext.qCount - num;
          typesCount = { MCQ: mcq, NUMERICAL: num };
        }

        const params = {
          exam: chatContext.examKey,
          chapters: [chatContext.chapterSlug],
          types: typesCount,
          count: chatContext.qCount,
          duration: duration,
          years: 'All',
          seed: Math.floor(Math.random() * 1000000)
        };
        
        const encodedParams = encodeURIComponent(JSON.stringify(params));
        const testUrl = `/?custom_test=${encodedParams}`;
        
        addMsg("bot", `Your test on **${chatContext.chapterTitle}** is ready!`, null, { type: 'launch_test', url: testUrl });
        
        // Reset state so user can create another
        setChatContext({ step: 'exam', examKey: null, subjectKey: null, chapterSlug: null, chapterTitle: null, qCount: null, duration: null });
        return;
      }
    }

    // Free Text Fallback / Restart
    addMsg("bot", `I'm an AI test generator. Let's restart the setup process. Which exam are you targeting?`, EXAM_OPTIONS.map(e => e.label));
    setChatContext({ step: 'exam', examKey: null, subjectKey: null, chapterSlug: null, chapterTitle: null, qCount: null, duration: null });
  }

  // ---------- render ----------
  if (!open) {
    return (
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
        <button
          onClick={() => setOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "linear-gradient(135deg, #0f172a, #1e293b)",
            border: "1px solid #38bdf8", borderRadius: 30,
            padding: "12px 20px", cursor: "pointer",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 15px rgba(56,189,248,0.3)",
            transition: "transform 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          <Bot size={24} color="#38bdf8" />
          <span style={{ color: "#fff", fontWeight: 600, fontSize: 14, fontFamily: "system-ui" }}>Quantrex AI</span>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px #34d399" }} />
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed", bottom: 24, right: 24, zIndex: 9999,
        width: 400, maxWidth: "94vw", height: 650, maxHeight: "85vh",
        background: "#0f172a", borderRadius: 16,
        border: "1px solid rgba(56,189,248,0.3)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
        display: "flex", flexDirection: "column", overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "16px",
        background: "linear-gradient(90deg, #1e293b, #0f172a)", borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}>
        <div style={{ background: "#38bdf822", padding: 8, borderRadius: "50%", border: "1px solid #38bdf8" }}>
          <Bot size={22} color="#38bdf8" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", gap: 6 }}>
            Quantrex AI <Sparkles size={14} color="#f5a623" />
          </div>
          <div style={{ color: "#94a3b8", fontSize: 12, display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399" }} />
            Connected to Test Engine
          </div>
        </div>
        <button onClick={() => {
          setMessages([{ id: 1, from: "bot", text: GREETING, options: EXAM_OPTIONS.map(e => e.label) }]);
          setChatContext({ step: 'exam', examKey: null, subjectKey: null, chapterSlug: null, chapterTitle: null, qCount: null, duration: null });
        }} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 6, display: "flex", alignItems: "center" }} title="Restart Generator">
          <RotateCcw size={18} />
        </button>
        <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 6 }}>
          <X size={22} />
        </button>
      </div>

      {/* body */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.map((m) => (
          <div key={m.id} style={{ display: "flex", gap: 12, alignItems: "flex-start", flexDirection: m.from === "user" ? "row-reverse" : "row" }}>
            {m.from === "bot" ? (
              <div style={{ background: "#38bdf822", padding: 6, borderRadius: "50%", flexShrink: 0 }}>
                <Bot size={20} color="#38bdf8" />
              </div>
            ) : (
              <div style={{ background: "#3b82f6", padding: 6, borderRadius: "50%", flexShrink: 0 }}>
                <User size={20} color="#fff" />
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: "80%" }}>
              <div style={{
                background: m.from === "user" ? "#3b82f6" : "#1e293b",
                color: "#f8fafc",
                borderRadius: 16,
                borderTopRightRadius: m.from === "user" ? 4 : 16,
                borderTopLeftRadius: m.from === "bot" ? 4 : 16,
                padding: "12px 16px", fontSize: 14,
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                border: m.from === "bot" ? "1px solid rgba(255,255,255,0.05)" : "none"
              }}>
                <MessageContent text={m.text} />
              </div>
              
              {/* Standard Options */}
              {m.options && m.options.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                  {m.options.map((opt, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => handleSend(opt)}
                      disabled={isLoading || m.id !== messages[messages.length-1].id}
                      style={{
                        background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.3)", 
                        color: "#38bdf8", borderRadius: 20, padding: "8px 14px", fontSize: 13, 
                        cursor: (isLoading || m.id !== messages[messages.length-1].id) ? "default" : "pointer",
                        opacity: (isLoading || m.id !== messages[messages.length-1].id) ? 0.5 : 1,
                        display: "flex", alignItems: "center", gap: 4, transition: "background 0.2s"
                      }}
                    >
                      {opt} <ChevronRight size={14} />
                    </button>
                  ))}
                </div>
              )}

              {/* Custom Component Renders (Chapter List / Launch Button) */}
              {m.customData && m.id === messages[messages.length-1].id && (
                <div style={{ marginTop: 8 }}>
                  {m.customData.type === 'chapter_select' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {m.customData.chapters.slice(currentChapterPage * 5, (currentChapterPage + 1) * 5).map((ch, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(ch.title)}
                          style={{
                            background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0",
                            padding: "10px 14px", borderRadius: 10, fontSize: 13, textAlign: "left",
                            cursor: "pointer", transition: "all 0.2s"
                          }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = "#38bdf8"}
                          onMouseLeave={e => e.currentTarget.style.borderColor = "#334155"}
                        >
                          {ch.title}
                        </button>
                      ))}
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        <button 
                          disabled={currentChapterPage === 0}
                          onClick={() => setCurrentChapterPage(p => p - 1)}
                          style={{ background: "transparent", border: "none", color: currentChapterPage === 0 ? "#475569" : "#38bdf8", cursor: currentChapterPage === 0 ? "default" : "pointer", fontSize: 13 }}
                        >
                          &larr; Prev
                        </button>
                        <span style={{ fontSize: 12, color: "#64748b" }}>Page {currentChapterPage + 1} of {Math.ceil(m.customData.chapters.length / 5)}</span>
                        <button 
                          disabled={(currentChapterPage + 1) * 5 >= m.customData.chapters.length}
                          onClick={() => setCurrentChapterPage(p => p + 1)}
                          style={{ background: "transparent", border: "none", color: (currentChapterPage + 1) * 5 >= m.customData.chapters.length ? "#475569" : "#38bdf8", cursor: (currentChapterPage + 1) * 5 >= m.customData.chapters.length ? "default" : "pointer", fontSize: 13 }}
                        >
                          Next &rarr;
                        </button>
                      </div>
                    </div>
                  )}

                  {m.customData.type === 'launch_test' && (
                    <button
                      onClick={() => window.location.href = m.customData.url}
                      style={{
                        background: "linear-gradient(135deg, #38bdf8, #3b82f6)", border: "none", color: "#fff",
                        padding: "12px 20px", borderRadius: 12, fontSize: 15, fontWeight: "bold",
                        cursor: "pointer", display: "flex", alignItems: "center", gap: 8, width: "100%", justifyContent: "center",
                        boxShadow: "0 4px 15px rgba(56,189,248,0.4)"
                      }}
                    >
                      <ExternalLink size={18} /> Open Test Interface
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
             <div style={{ background: "#38bdf822", padding: 6, borderRadius: "50%" }}>
                <Bot size={20} color="#38bdf8" />
              </div>
            <div style={{ background: "#1e293b", borderRadius: 16, padding: "12px 16px", color: "#94a3b8", display: "flex", alignItems: "center", gap: 8 }}>
              <Loader2 size={16} className="animate-spin" /> Processing...
            </div>
          </div>
        )}
      </div>

      {/* input */}
      <div style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.1)", background: "#0f172a" }}>
        <div style={{ display: "flex", gap: 10, background: "#1e293b", borderRadius: 24, padding: "6px 6px 6px 16px", border: "1px solid #334155" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your selection..."
            style={{
              flex: 1, background: "transparent", border: "none",
              color: "#fff", fontSize: 14, outline: "none", width: "100%"
            }}
          />
          <button 
            onClick={() => handleSend()} 
            disabled={!input.trim() || isLoading}
            style={{
              background: input.trim() && !isLoading ? "#38bdf8" : "#334155", 
              border: "none", borderRadius: "50%", width: 38, height: 38,
              display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() && !isLoading ? "pointer" : "default", flexShrink: 0,
              transition: "background 0.2s"
          }}>
            <Send size={18} color={input.trim() && !isLoading ? "#0f172a" : "#94a3b8"} style={{ marginLeft: -2 }} />
          </button>
        </div>
        <div style={{ textAlign: "center", color: "#64748b", fontSize: 10, marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <Database size={10} /> Integrated with Quantrex Test Engine
        </div>
      </div>
    </div>
  );
}
