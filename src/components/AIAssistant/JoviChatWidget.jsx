import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, Settings, Trophy, RotateCcw, User, Loader2, Database, ChevronRight } from "lucide-react";
import { useAIAssistant } from '../../contexts/AIAssistantContext';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

// ---------- Mock Database for Offline AI ----------
const MOCK_QUESTION_BANK = {
  "calculus": [
    { q: "What is the derivative of $\\sin(x)$ with respect to $x$?", options: ["$\\cos(x)$", "$-\\cos(x)$", "$\\sin(x)$", "$\\sec^2(x)$"], correct: 0, explanation: "The derivative of sin(x) is a fundamental trigonometric limit resulting in cos(x)." },
    { q: "Evaluate the integral $\\int 2x dx$.", options: ["$x^2 + C$", "$2x^2 + C$", "$x + C$", "$\\frac{x^2}{2} + C$"], correct: 0, explanation: "Using the power rule for integration: $\\int x^n dx = \\frac{x^{n+1}}{n+1} + C$." },
    { q: "What is the limit of $\\frac{\\sin(x)}{x}$ as $x \\to 0$?", options: ["$0$", "$1$", "$\\infty$", "undefined"], correct: 1, explanation: "This is a standard limit proven using the squeeze theorem." },
    { q: "Find the local maximum of $f(x) = -x^2 + 4x$.", options: ["$x=0$", "$x=2$", "$x=4$", "$x=-2$"], correct: 1, explanation: "Set derivative $f'(x) = -2x + 4 = 0$, giving $x = 2$." },
    { q: "Which of these is the product rule?", options: ["$(fg)' = f'g'$", "$(fg)' = f'g + fg'$", "$(f/g)' = (f'g - fg')/g^2$", "$(f(g))' = f'(g)g'$"], correct: 1, explanation: "The product rule states that the derivative of $f(x)g(x)$ is $f'(x)g(x) + f(x)g'(x)$." }
  ],
  "sets": [
    { q: "If A = {1, 2, 3} and B = {3, 4, 5}, what is A ∩ B?", options: ["{1, 2}", "{3}", "{4, 5}", "∅"], correct: 1, explanation: "Intersection means elements common to both sets." },
    { q: "A relation R on set A is called reflexive if for every $a \\in A$...", options: ["$(a, a) \\in R$", "$(a, b) \\in R \\implies (b, a) \\in R$", "R is empty", "None of the above"], correct: 0, explanation: "Reflexive property requires every element to be related to itself." },
    { q: "If a set has $n$ elements, how many subsets does it have?", options: ["$n$", "$2n$", "$n^2$", "$2^n$"], correct: 3, explanation: "The power set of a set with $n$ elements has $2^n$ elements." },
    { q: "What is $A \\cup A'$ (where $A'$ is the complement of A)?", options: ["$A$", "$A'$", "$\\emptyset$", "Universal Set (U)"], correct: 3, explanation: "A set and its complement together make up the entire Universal Set." },
    { q: "Which of the following is an empty set?", options: ["{x : x is an even prime number}", "{x : x is a real number and $x^2 < 0$}", "{0}", "{$\\emptyset$}"], correct: 1, explanation: "The square of any real number is non-negative, so no such real number exists." }
  ],
  "physics": [
    { q: "What is the SI unit of Force?", options: ["Joule", "Newton", "Watt", "Pascal"], correct: 1, explanation: "Force is measured in Newtons ($N = kg \\cdot m/s^2$)." },
    { q: "According to Newton's Second Law...", options: ["$F = m/a$", "$F = ma$", "$F = m - a$", "$F = m^2a$"], correct: 1, explanation: "Force equals mass times acceleration." },
    { q: "What is the escape velocity from Earth?", options: ["$11.2 \\text{ km/s}$", "$9.8 \\text{ m/s}$", "$3 \\times 10^8 \\text{ m/s}$", "$11.2 \\text{ m/s}$"], correct: 0, explanation: "Escape velocity $v_e = \\sqrt{2gR}$, which is approx 11.2 km/s for Earth." },
    { q: "Which of these is a scalar quantity?", options: ["Velocity", "Acceleration", "Work", "Force"], correct: 2, explanation: "Work has magnitude but no direction, so it is a scalar." },
    { q: "What is the dimensional formula of Energy?", options: ["$[MLT^{-1}]$", "$[ML^2T^{-2}]$", "$[ML^{-1}T^{-2}]$", "$[M^0L^2T^{-2}]$"], correct: 1, explanation: "Energy has the same dimensions as Work, which is Force $\\times$ Distance = $[MLT^{-2}][L] = [ML^2T^{-2}]$." }
  ]
};

// Initial Guided Options
const EXAM_OPTIONS = ["JEE Main", "JEE Advanced", "NDA", "BITSAT"];
const SUBJECT_OPTIONS = ["Mathematics", "Physics", "Chemistry"];
const MATH_CHAPTERS = ["Calculus", "Sets & Relations", "Algebra", "Coordinate Geometry", "Trigonometry"];
const ACTION_OPTIONS = ["Generate Test", "View Formulas", "Important Questions", "PYQs"];

const GREETING = "Welcome to Quantrex AI! Select your target exam to begin your preparation:";

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
    { id: 1, from: "bot", text: GREETING, options: EXAM_OPTIONS },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null); 
  const [chatContext, setChatContext] = useState({ exam: null, subject: null, chapter: null });
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading, activeQuiz, open]);

  // quiz countdown
  useEffect(() => {
    if (!activeQuiz || activeQuiz.finished) return;
    const t = setInterval(() => {
      setActiveQuiz((q) => {
        if (!q || q.finished) return q;
        if (q.secondsLeft <= 1) {
          clearInterval(t);
          return finishQuiz(q);
        }
        return { ...q, secondsLeft: q.secondsLeft - 1 };
      });
    }, 1000);
    return () => clearInterval(t);
  }, [activeQuiz?.idx, !!activeQuiz]);

  function addMsg(from, content, options = null) {
    setMessages((m) => [...m, { id: Date.now() + Math.random(), from, text: content, options }]);
  }

  async function handleSend(textOverride = null) {
    const text = textOverride ?? input.trim();
    if (!text) return;
    
    if (!textOverride) setInput(""); // Only clear input if it was typed
    addMsg("user", text);
    setIsLoading(true);

    const lowerText = text.toLowerCase();
    
    // Simulate network delay for natural feel
    await new Promise(resolve => setTimeout(resolve, 600));
    setIsLoading(false);

    // --- Guided Wizard Flow ---
    if (EXAM_OPTIONS.some(o => o.toLowerCase() === lowerText)) {
      setChatContext(prev => ({ ...prev, exam: text }));
      addMsg("bot", `Great choice! Which subject do you want to study for **${text}**?`, SUBJECT_OPTIONS);
      return;
    }
    
    if (SUBJECT_OPTIONS.some(o => o.toLowerCase() === lowerText)) {
      setChatContext(prev => ({ ...prev, subject: text }));
      // Currently mocking Mathematics chapters, you can expand for physics/chem
      const chapters = text.toLowerCase() === "physics" ? ["Mechanics", "Thermodynamics", "Optics"] : MATH_CHAPTERS;
      addMsg("bot", `Select a chapter from **${text}**:`, chapters);
      return;
    }

    if (MATH_CHAPTERS.some(o => o.toLowerCase() === lowerText) || lowerText.includes("mechanics") || lowerText.includes("optics")) {
      setChatContext(prev => ({ ...prev, chapter: text }));
      addMsg("bot", `What would you like to do in **${text}**?`, ACTION_OPTIONS);
      return;
    }

    if (lowerText === "generate test" || lowerText.includes("create a test") || lowerText.includes("test")) {
      const topic = chatContext.chapter || "general";
      let matchedTopic = "general";
      
      if (topic.toLowerCase().includes("calculus")) matchedTopic = "calculus";
      else if (topic.toLowerCase().includes("sets")) matchedTopic = "sets";
      else if (chatContext.subject?.toLowerCase() === "physics" || topic.toLowerCase().includes("mechanics")) matchedTopic = "physics";

      const questions = MOCK_QUESTION_BANK[matchedTopic] || MOCK_QUESTION_BANK["general"];
      
      addMsg("bot", `Generating a personalized mock test for **${topic}**... Good luck!`);
      setActiveQuiz({
        topic: topic.toUpperCase(), 
        timeLimit: 15,
        questions, 
        idx: 0, 
        answers: Array(questions.length).fill(null),
        secondsLeft: 15 * 60, 
        finished: false,
      });
      return;
    }

    if (lowerText === "view formulas") {
      addMsg("bot", `Here are some key formulas for **${chatContext.chapter || "your topic"}**:\n\n1. $\\sin^2(x) + \\cos^2(x) = 1$\n2. $\\int x^n dx = \\frac{x^{n+1}}{n+1} + C$\n3. $e^{i\\pi} + 1 = 0$\n\n*Check the Library section for the complete PDF formula sheet.*`);
      return;
    }

    if (lowerText === "important questions" || lowerText === "pyqs") {
      addMsg("bot", `I found 45 previous year questions (PYQs) for **${chatContext.chapter || "your topic"}** in our database. Would you like to practice them in test format?`, ["Generate Test", "Show as PDF"]);
      return;
    }
    
    if (lowerText === "show as pdf") {
      addMsg("bot", "Opening the PDF viewer module is currently restricted in this mode. Please use 'Generate Test' instead.");
      return;
    }

    // --- Free Text Fallback ---
    if (lowerText.includes("hello") || lowerText.includes("hi")) {
      addMsg("bot", "Hello! Let me help you navigate. What exam are you preparing for?", EXAM_OPTIONS);
      return;
    }
    
    addMsg("bot", `I am currently operating in **Internal Database Mode**. For best results, please select from the guided options below or type "Generate a test for Calculus".`, ["JEE Main", "JEE Advanced", "Test Series"]);
  }

  function finishQuiz(q) {
    const score = q.answers.reduce((s, a, i) => s + (a === q.questions[i].correct ? 1 : 0), 0);
    setTimeout(() => {
      addMsg("bot", `Test completed! You scored **${score}/${q.questions.length}**. Would you like to try another topic?`, EXAM_OPTIONS);
    }, 500);
    return { ...q, finished: true, score };
  }

  function selectAnswer(optIdx) {
    setActiveQuiz((q) => {
      const answers = [...q.answers];
      answers[q.idx] = optIdx;
      return { ...q, answers };
    });
  }

  function nextQuestion() {
    setActiveQuiz((q) => {
      if (q.idx + 1 >= q.questions.length) return finishQuiz(q);
      return { ...q, idx: q.idx + 1 };
    });
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
            Internal Database Mode
          </div>
        </div>
        <button onClick={() => {
          // Reset chat helper
          setMessages([{ id: 1, from: "bot", text: GREETING, options: EXAM_OPTIONS }]);
          setChatContext({ exam: null, subject: null, chapter: null });
          setActiveQuiz(null);
        }} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 6, display: "flex", alignItems: "center" }} title="Reset Chat">
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
              
              {/* Quick Reply Options */}
              {m.options && m.options.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                  {m.options.map((opt, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => handleSend(opt)}
                      disabled={isLoading || m.id !== messages[messages.length-1].id} // Disable older buttons
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
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
             <div style={{ background: "#38bdf822", padding: 6, borderRadius: "50%" }}>
                <Bot size={20} color="#38bdf8" />
              </div>
            <div style={{ background: "#1e293b", borderRadius: 16, padding: "12px 16px", color: "#94a3b8", display: "flex", alignItems: "center", gap: 8 }}>
              <Loader2 size={16} className="animate-spin" /> Thinking...
            </div>
          </div>
        )}

        {/* active quiz card */}
        {activeQuiz && !activeQuiz.finished && (
          <QuizCard quiz={activeQuiz} onSelect={selectAnswer} onNext={nextQuestion} />
        )}
        {activeQuiz && activeQuiz.finished && (
          <ResultsCard quiz={activeQuiz} onClose={() => setActiveQuiz(null)} />
        )}
      </div>

      {/* input */}
      <div style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.1)", background: "#0f172a" }}>
        <div style={{ display: "flex", gap: 10, background: "#1e293b", borderRadius: 24, padding: "6px 6px 6px 16px", border: "1px solid #334155" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your answer or selection..."
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
          <Database size={10} /> Quantrex Offline Question Bank Active
        </div>
      </div>
    </div>
  );
}

function QuizCard({ quiz, onSelect, onNext }) {
  const q = quiz.questions[quiz.idx];
  const chosen = quiz.answers[quiz.idx];
  return (
    <div style={{ background: "#1e293b", border: "1px solid rgba(56,189,248,0.3)", borderRadius: 16, padding: 16, marginLeft: 40, marginTop: 8 }}>
      <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ background: "#0f172a", padding: "4px 8px", borderRadius: 6 }}>{quiz.topic}</span>
        <span style={{ fontWeight: "bold", color: "#38bdf8" }}>Question {quiz.idx + 1} of {quiz.questions.length}</span>
      </div>
      <div style={{ color: "#f8fafc", fontSize: 15, marginBottom: 16, fontWeight: 500 }}>
        <MessageContent text={q.q} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => onSelect(i)} style={{
            textAlign: "left", padding: "12px 16px", borderRadius: 12, fontSize: 14,
            border: chosen === i ? "2px solid #38bdf8" : "1px solid #334155",
            background: chosen === i ? "#38bdf815" : "#0f172a",
            color: "#e2e8f0", cursor: "pointer", transition: "all 0.2s"
          }}>
            <span style={{ fontWeight: "bold", marginRight: 8, color: chosen === i ? "#38bdf8" : "#94a3b8" }}>{String.fromCharCode(65 + i)}.</span>
            <MessageContent text={opt} />
          </button>
        ))}
      </div>
      
      {/* Show explanation if answer is selected but before moving next (optional, but let's keep it simple for now) */}
      {chosen !== null && (
        <div style={{ marginTop: 12, padding: 12, background: chosen === q.correct ? "#34d39922" : "#f8717122", borderRadius: 8, border: `1px solid ${chosen === q.correct ? "#34d39955" : "#f8717155"}` }}>
          <div style={{ color: chosen === q.correct ? "#34d399" : "#f87171", fontWeight: "bold", marginBottom: 4, fontSize: 13 }}>
            {chosen === q.correct ? "✅ Correct!" : "❌ Incorrect (Correct is " + String.fromCharCode(65 + q.correct) + ")"}
          </div>
          <div style={{ color: "#cbd5e1", fontSize: 13 }}>
            <MessageContent text={q.explanation || "No explanation provided."} />
          </div>
        </div>
      )}

      <button onClick={onNext} disabled={chosen === null} style={{
        marginTop: 16, width: "100%", padding: "12px 0", borderRadius: 12, border: "none",
        background: chosen === null ? "#334155" : "#38bdf8",
        color: chosen === null ? "#64748b" : "#0f172a", fontWeight: "bold", fontSize: 14,
        cursor: chosen === null ? "not-allowed" : "pointer", transition: "background 0.2s"
      }}>
        {quiz.idx + 1 === quiz.questions.length ? "Submit Test" : "Next Question"}
      </button>
    </div>
  );
}

function ResultsCard({ quiz, onClose }) {
  const score = quiz.score ?? quiz.answers.reduce((s, a, i) => s + (a === quiz.questions[i].correct ? 1 : 0), 0);
  const pct = Math.round((score / quiz.questions.length) * 100);
  const color = pct >= 75 ? "#34d399" : pct >= 45 ? "#fbbf24" : "#f87171";
  
  return (
    <div style={{ background: "#1e293b", border: `1px solid ${color}55`, borderRadius: 16, padding: 24, marginLeft: 40, marginTop: 8, textAlign: "center" }}>
      <div style={{ background: `${color}15`, width: 60, height: 60, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <Trophy size={32} color={color} />
      </div>
      <div style={{ color: "#fff", fontWeight: 800, fontSize: 24, marginBottom: 4 }}>{score} / {quiz.questions.length}</div>
      <div style={{ color, fontSize: 14, fontWeight: 600, marginBottom: 20 }}>{pct}% Score • {quiz.topic}</div>
      <button onClick={onClose} style={{
        background: "#0f172a", border: "1px solid #334155",
        color: "#e2e8f0", borderRadius: 24, padding: "10px 20px", fontSize: 14, fontWeight: 500, cursor: "pointer",
        display: "inline-flex", alignItems: "center", gap: 8, transition: "background 0.2s"
      }}
      onMouseEnter={e => e.currentTarget.style.background = "#334155"}
      onMouseLeave={e => e.currentTarget.style.background = "#0f172a"}
      >
        <RotateCcw size={16} /> Close Results
      </button>
    </div>
  );
}
