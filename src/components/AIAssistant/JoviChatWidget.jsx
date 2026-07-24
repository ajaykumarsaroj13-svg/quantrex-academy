import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, Clock, BookOpen, Settings, Trophy, RotateCcw, User, Loader2, Key } from "lucide-react";
import { useAIAssistant } from '../../contexts/AIAssistantContext';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

// ---------- Quantrex Academy Data ----------
const SUBJECTS = {
  Mathematics: ["Sets and Relations", "Logarithm", "Quadratic Equations", "Calculus", "Coordinate Geometry", "Algebra", "Trigonometry"],
  Physics: ["Mechanics", "Thermodynamics", "Electromagnetism", "Optics", "Modern Physics"],
  Chemistry: ["Physical Chemistry", "Organic Chemistry", "Inorganic Chemistry"],
};

const GREETING = "Hello! I am Quantrex AI, the ultimate intelligent assistant for Quantrex Academy. I can solve mathematics problems step-by-step, generate mock tests, explain concepts, and analyze your performance. How can I assist you today?";

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
        // Basic bold markdown
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
    { id: 1, from: "bot", text: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("quantrex_openai_key") || "");
  const [showSettings, setShowSettings] = useState(false);
  
  // Test flow state
  const [activeQuiz, setActiveQuiz] = useState(null); 
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading, activeQuiz, open, showSettings]);

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

  function addMsg(from, content) {
    setMessages((m) => [...m, { id: Date.now() + Math.random(), from, text: content }]);
  }

  const saveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem("quantrex_openai_key", key);
    setShowSettings(false);
    addMsg("bot", "API Key saved successfully! I am now fully connected and ready to assist you.");
  };

  async function generateTestQuestions(topic, count) {
    const prompt = `You are the Ultimate AI Agent for Quantrex Academy. Generate exactly ${count} multiple-choice questions for the topic "${topic}" at IIT JEE Advanced difficulty level. 
    Respond strictly with a JSON array format only, with no markdown fences or other text.
    Format: [{"q": "Question text here (use $ for inline math and $$ for block math)", "options": ["Option A", "Option B", "Option C", "Option D"], "correct": 0, "explanation": "Detailed explanation with math"}]`;
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "system", content: prompt }],
        temperature: 0.7
      })
    });

    if (!response.ok) throw new Error("API call failed");
    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(content);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    addMsg("user", text);

    if (!apiKey) {
      setTimeout(() => {
        addMsg("bot", "Please provide your OpenAI API Key in the settings to unlock my full capabilities (test generation, problem solving, etc.).");
        setShowSettings(true);
      }, 500);
      return;
    }

    setIsLoading(true);

    // Basic intent detection for test creation
    const lowerText = text.toLowerCase();
    if (lowerText.includes("test") || lowerText.includes("quiz") || lowerText.includes("questions")) {
      try {
        const questions = await generateTestQuestions(text, 5); // Default to 5 for speed
        setIsLoading(false);
        addMsg("bot", `I have generated a high-quality test based on your request. Good luck!`);
        setActiveQuiz({
          topic: "Custom Test", timeLimit: 15,
          questions, idx: 0, answers: Array(questions.length).fill(null),
          secondsLeft: 15 * 60, finished: false,
        });
        return;
      } catch (e) {
        setIsLoading(false);
        addMsg("bot", "I encountered an error while generating the test. Please ensure your API key is correct and has available quota.");
        return;
      }
    }

    // Standard Chat with Streaming Simulation (or direct API call)
    try {
      const systemPrompt = `You are the Ultimate AI Agent for Quantrex Academy, founded by A.K. Sir. 
      You are an expert in JEE Main, JEE Advanced, NDA, and BITSAT.
      Always respond in highly professional English. Never say 'I don't know'. Provide step-by-step mathematical solutions using LaTeX formatting ($ for inline, $$ for block).
      Prioritize logical reasoning and highlight shortcuts or tricks when solving problems.`;

      // Pass conversation history
      const apiMessages = [
        { role: "system", content: systemPrompt },
        ...messages.slice(-6).map(m => ({ role: m.from === "bot" ? "assistant" : "user", content: m.text })),
        { role: "user", content: text }
      ];

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: apiMessages,
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error("API call failed");
      const data = await response.json();
      setIsLoading(false);
      addMsg("bot", data.choices[0].message.content);

    } catch (e) {
      setIsLoading(false);
      addMsg("bot", "Connection error. Please check your OpenAI API key in settings or try again later.");
    }
  }

  function finishQuiz(q) {
    const score = q.answers.reduce((s, a, i) => s + (a === q.questions[i].correct ? 1 : 0), 0);
    setTimeout(() => {
      addMsg("bot", `Test completed! You scored **${score}/${q.questions.length}**. Keep practicing to master this topic!`);
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
            Ultimate Assistant
          </div>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 6 }}>
          <Settings size={20} />
        </button>
        <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 6 }}>
          <X size={22} />
        </button>
      </div>

      {/* body */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 16 }}>
        {showSettings ? (
          <div style={{ background: "#1e293b", padding: 16, borderRadius: 12, border: "1px solid #334155" }}>
            <h3 style={{ color: "#fff", marginTop: 0, fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
              <Key size={16} color="#38bdf8" /> AI Configuration
            </h3>
            <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 12 }}>Enter your OpenAI API Key to enable test generation and advanced problem solving.</p>
            <input 
              type="password" 
              placeholder="sk-..." 
              defaultValue={apiKey}
              onKeyDown={(e) => {
                if(e.key === 'Enter') saveApiKey(e.target.value);
              }}
              style={{ width: "100%", padding: "10px", borderRadius: 8, background: "#0f172a", border: "1px solid #475569", color: "#fff", outline: "none", boxSizing: "border-box" }}
            />
            <button 
              onClick={(e) => saveApiKey(e.target.previousSibling.value)}
              style={{ marginTop: 12, width: "100%", padding: "10px", background: "#38bdf8", color: "#0f172a", fontWeight: "bold", border: "none", borderRadius: 8, cursor: "pointer" }}>
              Save API Key
            </button>
          </div>
        ) : null}

        {!showSettings && messages.map((m) => (
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
            <div style={{
              background: m.from === "user" ? "#3b82f6" : "#1e293b",
              color: "#f8fafc",
              borderRadius: 16,
              borderTopRightRadius: m.from === "user" ? 4 : 16,
              borderTopLeftRadius: m.from === "bot" ? 4 : 16,
              padding: "12px 16px", fontSize: 14, maxWidth: "75%",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              border: m.from === "bot" ? "1px solid rgba(255,255,255,0.05)" : "none"
            }}>
              <MessageContent text={m.text} />
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
            placeholder="Ask a question or generate a test..."
            style={{
              flex: 1, background: "transparent", border: "none",
              color: "#fff", fontSize: 14, outline: "none", width: "100%"
            }}
          />
          <button 
            onClick={handleSend} 
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
        <div style={{ textAlign: "center", color: "#64748b", fontSize: 10, marginTop: 8 }}>
          Quantrex AI can make mistakes. Consider verifying important information.
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
