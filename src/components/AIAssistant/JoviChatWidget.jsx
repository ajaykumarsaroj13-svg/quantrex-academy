import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, Clock, BookOpen, MessageCircle, ChevronRight, Trophy, RotateCcw, Loader2 } from "lucide-react";
import { useAIAssistant } from '../../contexts/AIAssistantContext';

// ---------- Quantrex Academy chapter data (mirrors the live platform's chapter lists) ----------
const SUBJECTS = {
  Mathematics: [
    "Sets and Relations", "Logarithm", "Quadratic Equations", "Sequence and Series",
    "Mathematical Induction", "Binomial Theorem", "Matrices and Determinants",
    "Permutation and Combination", "Probability", "Vector Algebra", "3D Geometry",
    "Complex Numbers", "Statistics", "Trigonometric Ratios", "Trigonometric Equations",
    "Inverse Trigonometry",
  ],
  Physics: [
    "Units and Measurement", "Vector Algebra", "Motion In a Straight Line", "Motion In a Plane",
    "Circular Motion", "Laws of Motion", "Work, Energy and Power", "Center of Mass and Collision",
    "Rotational Motion", "Gravitation", "Elasticity", "Fluid Mechanics",
    "Thermal Properties of Matter", "Kinetic Theory of Gases", "Thermodynamics", "Simple Harmonic Motion",
  ],
  Chemistry: [
    "Mole Concept", "Atomic Structure", "Chemical Bonding", "States of Matter",
    "Chemical Thermodynamics", "Equilibrium", "Redox Reactions", "Periodic Table",
    "p-Block Elements", "d and f Block Elements", "Coordination Compounds",
    "Organic Chemistry Basics", "Hydrocarbons", "Biomolecules", "Polymers", "Environmental Chemistry",
  ],
};

const QUESTION_COUNTS = [10, 15, 20, 25];
const TIME_OPTIONS = [15, 30, 45, 60];

const GREETING = {
  hi: "Namaste! Main hoon Jovi 🤖 — Quantrex Academy ka AI assistant. Aap mujhse test banwa sakte ho, doubt puch sakte ho, ya chapters explore kar sakte ho. Kaise madad karu?",
};

// ---------- Claude API helper ----------
async function askClaude(systemPrompt, userText) {
  // IMPORTANT: For frontend usage, this requires Anthropic CORS headers or a proxy, 
  // and exposing the API key is dangerous. Assuming the user provided this as a conceptual placeholder.
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { 
        "Content-Type": "application/json",
        "x-api-key": "", // API key would go here
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userText }],
    }),
  });
  const data = await res.json();
  const text = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  return text;
}

async function generateQuestions(subject, chapter, count) {
  const system = `You are a question-setter for Quantrex Academy, an Indian JEE/NDA/BITSAT coaching platform. Generate exactly ${count} original multiple-choice questions for the topic "${chapter}" (${subject}), at JEE Main/Advanced difficulty. Respond with ONLY a raw JSON array, no markdown fences, no preamble. Each item: {"q": "question text (use plain text, describe any math in words/unicode, no LaTeX)", "options": ["A text","B text","C text","D text"], "correct": 0-3 index, "explanation": "short 1-2 line explanation"}.`;
  const raw = await askClaude(system, `Generate the ${count} questions now as a JSON array only.`);
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  const jsonStr = start >= 0 && end >= 0 ? cleaned.slice(start, end + 1) : cleaned;
  return JSON.parse(jsonStr);
}

// ---------- Small UI pieces ----------
function JoviAvatar({ size = 36 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "30%",
        background: "linear-gradient(145deg, #1a2540, #0d1420)",
        border: "1.5px solid #f5a623",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 0 12px rgba(245,166,35,0.25)",
      }}
    >
      <Bot size={size * 0.58} color="#4fb3ff" strokeWidth={2.2} />
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, padding: "10px 14px" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#4fb3ff",
            animation: `joviBounce 1.1s ${i * 0.15}s infinite ease-in-out`,
          }}
        />
      ))}
      <style>{`@keyframes joviBounce{0%,80%,100%{transform:translateY(0);opacity:.5}40%{transform:translateY(-4px);opacity:1}}`}</style>
    </div>
  );
}

function QuickReplies({ options, onPick }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "6px 2px 2px" }}>
      {options.map((opt, i) => (
        <button
          key={i}
          onClick={() => onPick(opt)}
          style={{
            background: "rgba(79,179,255,0.08)",
            border: "1px solid rgba(79,179,255,0.35)",
            color: "#cfe6ff",
            borderRadius: 18,
            padding: "7px 14px",
            fontSize: 13,
            cursor: "pointer",
            transition: "all .15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(79,179,255,0.2)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(79,179,255,0.08)")}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ---------- Main widget ----------
export default function JoviChatWidget() {
  // Use Context instead of local state so "Ask AI" buttons across the app work
  const { isOpen: open, openAssistant, closeAssistant } = useAIAssistant();
  const setOpen = (val) => val ? openAssistant() : closeAssistant();

  const [messages, setMessages] = useState([
    { id: 1, from: "bot", text: GREETING.hi },
  ]);
  const [quickOptions, setQuickOptions] = useState([
    { label: "📝 Test banao", value: "make_test" },
    { label: "💬 Doubt puchna hai", value: "doubt" },
    { label: "📚 Chapters dekhein", value: "chapters" },
  ]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [flow, setFlow] = useState({ step: "menu" }); // tracks multi-step test-creation flow
  const [activeQuiz, setActiveQuiz] = useState(null); // {questions, subject, chapter, timeLimit, idx, answers, secondsLeft}
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, activeQuiz, open]);

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

  function addMsg(from, content, extra = {}) {
    setMessages((m) => [...m, { id: Date.now() + Math.random(), from, ...extra, text: content }]);
  }

  function botSay(text, opts, delay = 500) {
    setTyping(true);
    setQuickOptions([]);
    setTimeout(() => {
      setTyping(false);
      addMsg("bot", text);
      if (opts) setQuickOptions(opts);
    }, delay);
  }

  function resetToMenu() {
    setFlow({ step: "menu" });
    botSay("Aur kuch madad chahiye? Yeh options try karo:", [
      { label: "📝 Test banao", value: "make_test" },
      { label: "💬 Doubt puchna hai", value: "doubt" },
      { label: "📚 Chapters dekhein", value: "chapters" },
    ], 400);
  }

  function handleQuickPick(opt) {
    addMsg("user", opt.label);
    setQuickOptions([]);

    if (opt.value === "make_test") {
      setFlow({ step: "subject" });
      botSay("Great! Kis subject ka test banau?", Object.keys(SUBJECTS).map((s) => ({ label: s, value: s })));
      return;
    }
    if (opt.value === "doubt") {
      setFlow({ step: "doubt" });
      botSay("Bilkul, apna doubt type karke bhejo — Hindi ya English, jaise comfortable ho. Main step-by-step samjhaunga.");
      return;
    }
    if (opt.value === "chapters") {
      setFlow({ step: "chapter_subject" });
      botSay("Kis subject ke chapters dekhne hain?", Object.keys(SUBJECTS).map((s) => ({ label: s, value: s })));
      return;
    }
    if (flow.step === "subject" && SUBJECTS[opt.value]) {
      setFlow({ step: "chapter", subject: opt.value });
      botSay(`${opt.value} — kaunsa chapter?`, SUBJECTS[opt.value].map((c) => ({ label: c, value: c })));
      return;
    }
    if (flow.step === "chapter_subject" && SUBJECTS[opt.value]) {
      const list = SUBJECTS[opt.value];
      setFlow({ step: "menu" });
      botSay(
        `${opt.value} mein ye chapters available hain:\n\n${list.map((c, i) => `${i + 1}. ${c}`).join("\n")}\n\nInme se kisi ka test banwana ho to bas bolo — "test banao".`,
        [{ label: "📝 Isi subject ka test banao", value: "make_test" }]
      );
      return;
    }
    if (flow.step === "chapter") {
      setFlow({ step: "count", subject: flow.subject, chapter: opt.value });
      botSay("Kitne questions ka test chahiye?", QUESTION_COUNTS.map((n) => ({ label: `${n} Questions`, value: n })).concat([{ label: "Custom", value: "custom_count" }]));
      return;
    }
    if (flow.step === "count") {
      if (opt.value === "custom_count") {
        setFlow({ ...flow, step: "count_custom" });
        botSay("Theek hai, number of questions type karke bhejo (jaise 12):");
        return;
      }
      setFlow({ ...flow, step: "time", count: opt.value });
      botSay("Time limit kitni rakhein?", TIME_OPTIONS.map((n) => ({ label: `${n} min`, value: n })).concat([{ label: "Custom", value: "custom_time" }]));
      return;
    }
    if (flow.step === "time") {
      if (opt.value === "custom_time") {
        setFlow({ ...flow, step: "time_custom" });
        botSay("Time limit minutes mein type karo (jaise 20):");
        return;
      }
      startTestGeneration(flow.subject, flow.chapter, flow.count, opt.value);
      return;
    }
  }

  async function startTestGeneration(subject, chapter, count, timeMin) {
    setFlow({ step: "generating" });
    botSay(`Perfect ✅ ${subject} → ${chapter}\n${count} questions • ${timeMin} min\n\nTest generate ho raha hai, ek second...`, null, 400);
    try {
      const questions = await generateQuestions(subject, chapter, count);
      setTyping(false);
      addMsg("bot", `Test ready hai! "${chapter}" — ${questions.length} questions, ${timeMin} minute. All the best! 🚀`);
      setActiveQuiz({
        subject, chapter, timeLimit: timeMin,
        questions, idx: 0, answers: Array(questions.length).fill(null),
        secondsLeft: timeMin * 60, finished: false,
      });
    } catch (e) {
      setTyping(false);
      addMsg("bot", "Oops, test generate karte waqt thodi dikkat aa gayi. Dobara try karte hain?");
      setQuickOptions([{ label: "🔁 Dobara try karo", value: "make_test" }]);
      setFlow({ step: "menu" });
    }
  }

  function finishQuiz(q) {
    const score = q.answers.reduce((s, a, i) => s + (a === q.questions[i].correct ? 1 : 0), 0);
    setTimeout(() => {
      addMsg("bot", `Test khatam! Score: ${score}/${q.questions.length} (${Math.round((score / q.questions.length) * 100)}%). Neeche results dekh lo.`);
      resetToMenu();
    }, 300);
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

  async function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    addMsg("user", text);

    if (flow.step === "count_custom") {
      const n = parseInt(text.replace(/\D/g, ""), 10) || 10;
      setFlow({ ...flow, step: "time", count: n });
      botSay("Time limit kitni rakhein?", TIME_OPTIONS.map((t) => ({ label: `${t} min`, value: t })).concat([{ label: "Custom", value: "custom_time" }]));
      return;
    }
    if (flow.step === "time_custom") {
      const n = parseInt(text.replace(/\D/g, ""), 10) || 30;
      startTestGeneration(flow.subject, flow.chapter, flow.count, n);
      return;
    }

    // free-form doubt / general chat -> Claude
    setTyping(true);
    try {
      const system = `Tum ho "Jovi" — Quantrex Academy (A K Sir) ka friendly AI doubt-solving coach for JEE Mains/Advanced, NDA aur BITSAT students. Style: warm, encouraging, thoda Hinglish (Hindi + English mix), jaise ek senior coaching mentor baat karta hai. Doubts ko step-by-step, seedhi bhasha mein samjhao. Math expressions plain text/unicode mein likho, LaTeX mat use karo. Jawab concise rakho (max ~120 words) jab tak student aur detail na maange.`;
      const reply = await askClaude(system, text);
      setTyping(false);
      addMsg("bot", reply || "Hmm, samajh nahi paya — dobara thoda clearly likh sakte ho?");
      setQuickOptions([
        { label: "📝 Test banao", value: "make_test" },
        { label: "❓ Aur doubt", value: "doubt" },
      ]);
    } catch (e) {
      setTyping(false);
      addMsg("bot", "Connection mein dikkat aa gayi, dobara try karo. Note: Anthropic API call may fail without a valid API key or proper CORS proxy in browser.");
    }
  }

  // ---------- render ----------
  if (!open) {
    return (
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
        <button
          onClick={() => setOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "linear-gradient(135deg,#0d1420,#1a2540)",
            border: "1px solid #f5a623", borderRadius: 30,
            padding: "12px 18px", cursor: "pointer",
            boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 0 20px rgba(245,166,35,0.2)",
          }}
        >
          <JoviAvatar size={32} />
          <span style={{ color: "#fff", fontWeight: 600, fontSize: 14, fontFamily: "system-ui" }}>Chat with Jovi</span>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#33d17a", boxShadow: "0 0 6px #33d17a" }} />
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed", bottom: 24, right: 24, zIndex: 9999,
        width: 380, maxWidth: "94vw", height: 600, maxHeight: "85vh",
        background: "#0b0f1a", borderRadius: 18,
        border: "1px solid rgba(245,166,35,0.25)",
        boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
        display: "flex", flexDirection: "column", overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
        background: "linear-gradient(90deg,#0d1420,#141d33)", borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <JoviAvatar size={38} />
        <div style={{ flex: 1 }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Jovi</div>
          <div style={{ color: "#7fd68f", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#33d17a" }} />
            Quantrex Academy AI • online
          </div>
        </div>
        {activeQuiz && !activeQuiz.finished && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#f5a623", fontSize: 13, fontWeight: 600 }}>
            <Clock size={14} />
            {String(Math.floor(activeQuiz.secondsLeft / 60)).padStart(2, "0")}:{String(activeQuiz.secondsLeft % 60).padStart(2, "0")}
          </div>
        )}
        <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8aa0c0", padding: 4 }}>
          <X size={20} />
        </button>
      </div>

      {/* body */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "14px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m) => (
          <div key={m.id} style={{ display: "flex", gap: 8, alignItems: "flex-start", flexDirection: m.from === "user" ? "row-reverse" : "row" }}>
            {m.from === "bot" && <JoviAvatar size={26} />}
            <div style={{
              background: m.from === "user" ? "linear-gradient(135deg,#3b82f6,#2563eb)" : "#141d33",
              color: m.from === "user" ? "#fff" : "#dce6f5",
              borderRadius: 14,
              borderTopRightRadius: m.from === "user" ? 4 : 14,
              borderTopLeftRadius: m.from === "bot" ? 4 : 14,
              padding: "9px 13px", fontSize: 13.5, lineHeight: 1.5, maxWidth: "78%", whiteSpace: "pre-wrap",
            }}>
              {m.text}
            </div>
          </div>
        ))}

        {typing && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <JoviAvatar size={26} />
            <div style={{ background: "#141d33", borderRadius: 14, borderTopLeftRadius: 4 }}>
              <TypingDots />
            </div>
          </div>
        )}

        {quickOptions.length > 0 && !typing && (
          <div style={{ marginLeft: 34 }}>
            <QuickReplies options={quickOptions} onPick={handleQuickPick} />
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
      <div style={{ display: "flex", gap: 8, padding: 10, borderTop: "1px solid rgba(255,255,255,0.06)", background: "#0d1420" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Message likho... (Hindi ya English)"
          style={{
            flex: 1, background: "#141d33", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20, padding: "9px 14px", color: "#fff", fontSize: 13.5, outline: "none",
          }}
        />
        <button onClick={handleSend} style={{
          background: "#3b82f6", border: "none", borderRadius: "50%", width: 36, height: 36,
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
        }}>
          <Send size={16} color="#fff" />
        </button>
      </div>
    </div>
  );
}

function QuizCard({ quiz, onSelect, onNext }) {
  const q = quiz.questions[quiz.idx];
  const chosen = quiz.answers[quiz.idx];
  return (
    <div style={{ background: "#101a2e", border: "1px solid rgba(79,179,255,0.25)", borderRadius: 14, padding: 14, marginLeft: 34 }}>
      <div style={{ color: "#8aa0c0", fontSize: 11, marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
        <span>{quiz.chapter}</span>
        <span>Q{quiz.idx + 1} / {quiz.questions.length}</span>
      </div>
      <div style={{ color: "#fff", fontSize: 14, marginBottom: 10, lineHeight: 1.5 }}>{q.q}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => onSelect(i)} style={{
            textAlign: "left", padding: "8px 12px", borderRadius: 10, fontSize: 13,
            border: chosen === i ? "1.5px solid #f5a623" : "1px solid rgba(255,255,255,0.1)",
            background: chosen === i ? "rgba(245,166,35,0.12)" : "rgba(255,255,255,0.03)",
            color: "#dce6f5", cursor: "pointer",
          }}>
            {String.fromCharCode(65 + i)}. {opt}
          </button>
        ))}
      </div>
      <button onClick={onNext} disabled={chosen === null} style={{
        marginTop: 12, width: "100%", padding: "8px 0", borderRadius: 10, border: "none",
        background: chosen === null ? "#22304d" : "linear-gradient(135deg,#f5a623,#e08e00)",
        color: chosen === null ? "#5f7191" : "#0b0f1a", fontWeight: 700, fontSize: 13,
        cursor: chosen === null ? "not-allowed" : "pointer",
      }}>
        {quiz.idx + 1 === quiz.questions.length ? "Submit Test" : "Next Question →"}
      </button>
    </div>
  );
}

function ResultsCard({ quiz, onClose }) {
  const score = quiz.score ?? quiz.answers.reduce((s, a, i) => s + (a === quiz.questions[i].correct ? 1 : 0), 0);
  const pct = Math.round((score / quiz.questions.length) * 100);
  const color = pct >= 75 ? "#33d17a" : pct >= 45 ? "#f5a623" : "#ef4444";
  return (
    <div style={{ background: "#101a2e", border: `1px solid ${color}55`, borderRadius: 14, padding: 16, marginLeft: 34, textAlign: "center" }}>
      <Trophy size={28} color={color} style={{ marginBottom: 6 }} />
      <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{score} / {quiz.questions.length}</div>
      <div style={{ color, fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{pct}% • {quiz.chapter}</div>
      <button onClick={onClose} style={{
        background: "rgba(79,179,255,0.12)", border: "1px solid rgba(79,179,255,0.35)",
        color: "#cfe6ff", borderRadius: 20, padding: "6px 16px", fontSize: 12.5, cursor: "pointer",
        display: "inline-flex", alignItems: "center", gap: 6,
      }}>
        <RotateCcw size={13} /> Close Results
      </button>
    </div>
  );
}
