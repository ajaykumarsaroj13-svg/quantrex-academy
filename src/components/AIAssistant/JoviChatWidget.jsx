import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, Trophy, RotateCcw, User, Loader2, Database, ChevronRight, ExternalLink, FileText, Settings2, Search, Mic, Share2, Maximize2, Minimize2 } from "lucide-react";
import { useAIAssistant } from '../../contexts/AIAssistantContext';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import RobotAvatar from './RobotAvatar'; // We added this component
import FullScreenRobot from './FullScreenRobot'; // Full screen voice mode

// Helper to get slug for test engine
const getFetchSlug = (examKey, ch) => {
  const slug = (ch.url && ch.url !== '#') ? ch.url.split('/').pop() : (ch.id || '');
  let fetchSlug = String(slug || ch.id || 'unknown');
  
  if (fetchSlug.startsWith('physics_')) fetchSlug = fetchSlug.replace('physics_', '');
  else if (fetchSlug.startsWith('chemistry_')) fetchSlug = fetchSlug.replace('chemistry_', '');
  else if (fetchSlug.startsWith('mathematics_')) fetchSlug = fetchSlug.replace('mathematics_', '');

  if (examKey === 'jee-advanced') {
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

const GREETING = "Welcome to Quantrex AI! Let's get started. Please select your target exam:";

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
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [lastRobotSpeech, setLastRobotSpeech] = useState(GREETING);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // State machine context
  const [chatContext, setChatContext] = useState({ 
    step: 'exam', // exam -> subject -> chapter -> action -> test_config | search_keyword -> ready
    examKey: null, 
    subjectKey: null, 
    chapterSlug: null,
    chapterTitle: null,
    customTestConfig: { duration: 60, count: 15 }
  });
  
  const [currentChapterPage, setCurrentChapterPage] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading, open, currentChapterPage]);

  // Initial Greeting Voice
  useEffect(() => {
    if (open && messages.length === 1 && !isSpeaking) {
      speakText(GREETING);
    }
  }, [open]);

  function speakText(text) {
    setLastRobotSpeech(text);
    if (!isVoiceEnabled || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/\*\*/g, '').replace(/```([\s\S]*?)```/g, 'Code block.').replace(/\$/g, '').replace(/_/g, ' ');

    const msg = new SpeechSynthesisUtterance(cleanText);
    msg.lang = 'en-US';
    msg.rate = 1.0;
    msg.pitch = 1.1; // robot-child pitch
    
    msg.onstart = () => setIsSpeaking(true);
    msg.onend = () => setIsSpeaking(false);
    msg.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(msg);
  }

  function addMsg(from, content, options = null, customData = null) {
    setMessages((m) => [...m, { id: Date.now() + Math.random(), from, text: content, options, customData }]);
    if (from === "bot") {
      speakText(content);
    }
  }

  const processNLQuery = async (command) => {
    const text = command.toLowerCase();
    
    let foundChapters = [];
    let foundSubjects = [];
    
    // Find subjects
    if (text.includes('physics') || text.includes('fiziks') || text.includes('bhautik')) foundSubjects.push('physics');
    if (text.includes('chemistry') || text.includes('kemistry') || text.includes('rasayan')) foundSubjects.push('chemistry');
    if (text.includes('math') || text.includes('ganit') || text.includes('mathematics')) foundSubjects.push('mathematics');
    
    if (text.includes('teeno') || text.includes('all subject') || text.includes('3 subject')) {
        foundSubjects = ['physics', 'chemistry', 'mathematics'];
    }

    // Find chapters
    for (const [subject, chapters] of Object.entries(SUBJECTS)) {
       for (const chapter of chapters) {
          if (text.includes(chapter.toLowerCase())) {
             foundChapters.push({
               title: chapter,
               slug: `${subject.toLowerCase()}_${chapter.toLowerCase().replace(/ /g, '_')}`,
               subject: subject.toLowerCase()
             });
          }
       }
    }
    
    let intent = null;
    if (text.includes('test') || text.includes('exam') || text.includes('banao') || text.includes('create')) intent = 'test';
    if (text.includes('repeat') || text.includes('similar') || text.includes('puchhe') || text.includes('nikalo')) intent = 'repeated';
    if (text.includes('note') || text.includes('pdf') || text.includes('formula') || text.includes('padhna')) intent = 'notes';

    if (intent || foundChapters.length > 0 || foundSubjects.length > 0) {
        
        // Handle repeated questions
        if ((intent === 'repeated' || text.includes('question')) && foundChapters.length > 0) {
            setIsVoiceMode(false);
            
            // True Pattern Recognition Algorithm (Last 5 Years)
            try {
                const slug = getFetchSlug(chatContext.examKey || 'jee-main', foundChapters[0]);
                const response = await fetch(`/data/questions/${slug}.json`);
                if (response.ok) {
                    const data = await response.json();
                    const currentYear = new Date().getFullYear();
                    // 1. Filter last 5 years
                    const recentQuestions = data.filter(q => q.year && q.year >= currentYear - 5);
                    
                    // 2. Group by topic
                    const topicCounts = {};
                    recentQuestions.forEach(q => {
                        const t = q.topic || 'General';
                        topicCounts[t] = (topicCounts[t] || 0) + 1;
                    });
                    
                    // 3. Rank topics
                    const sortedTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]);
                    const topTopics = sortedTopics.slice(0, 2).map(t => t[0]); // Top 2 topics
                    
                    // 4. Select questions from top topics
                    const topQuestions = recentQuestions.filter(q => topTopics.includes(q.topic)).slice(0, 10);
                    
                    if (topQuestions.length > 0) {
                        setIsExpanded(true); // Auto expand to show the large list comfortably
                        addMsg("bot", `I analyzed the ${foundChapters[0].title} questions from the last 5 years. The most repeated patterns belong to these topics: **${topTopics.join('** and **')}**. Here are the most frequently asked questions:`, [], { type: 'similar_questions', data: topQuestions, topics: topTopics });
                    } else {
                        addMsg("bot", `I couldn't find enough recent data for ${foundChapters[0].title} to identify strong repeated patterns.`);
                    }
                } else {
                     addMsg("bot", `Failed to load data for ${foundChapters[0].title}. Please try again later.`);
                }
            } catch (err) {
                console.error(err);
                addMsg("bot", `Oops! Something went wrong while analyzing the patterns for ${foundChapters[0].title}.`);
            }
            return true; // handled
        }
        
        // Handle notes/formulas
        if (intent === 'notes' && foundChapters.length > 0) {
            const tab = text.includes("formula") ? 'formulas' : 'pdfs';
            window.location.href = `/?view_chapter=${foundChapters[0].slug}&tab=${tab}`;
            addMsg("bot", `Opening ${tab} for ${foundChapters[0].title}...`);
            return true;
        }

        // Handle Test Generation
        if (intent === 'test') {
            if (foundSubjects.length > 1) {
                // Multi-subject test requested
                addMsg("bot", `Generating a mixed test for ${foundSubjects.join(', ')}...`);
                setTimeout(() => {
                   setIsVoiceMode(false);
                   // In a real scenario we'd pass all chapters or pick random ones. We can pass 'all_physics' etc if testGenerator supports it,
                   // but for our robust testGenerator, passing subject keys won't fetch anything. We must pass valid chapter slugs.
                   // We'll pick 3 random chapters from each requested subject.
                   let selectedSlugs = [];
                   for (const subj of foundSubjects) {
                       const subjChapters = SUBJECTS[subj.charAt(0).toUpperCase() + subj.slice(1)];
                       if (subjChapters) {
                           // Pick 3 random
                           const shuffled = [...subjChapters].sort(() => 0.5 - Math.random());
                           selectedSlugs.push(...shuffled.slice(0, 3).map(c => `${subj}_${c.replace(/ /g, '_')}`));
                       }
                   }
                   
                   const params = {
                     exam: 'jee-mains',
                     chapters: selectedSlugs,
                     types: { MCQ: 15 },
                     count: 15,
                     duration: 60,
                     years: 'All',
                     seed: Math.floor(Math.random() * 1000000)
                   };
                   window.location.href = `/?custom_test=${encodeURIComponent(JSON.stringify(params))}`;
                }, 2000);
                return true;
            } else if (foundChapters.length > 0) {
                // Single chapter test
                addMsg("bot", `Generating a standard test for ${foundChapters[0].title}...`);
                setTimeout(() => {
                   setIsVoiceMode(false);
                   const params = {
                     exam: 'jee-mains',
                     chapters: [foundChapters[0].slug],
                     types: { MCQ: 15 },
                     count: 15,
                     duration: 60,
                     years: 'All',
                     seed: Math.floor(Math.random() * 1000000)
                   };
                   window.location.href = `/?custom_test=${encodeURIComponent(JSON.stringify(params))}`;
                }, 2000);
                return true;
            }
        }
        
        // Fallback for chapter found but no intent
        if (foundChapters.length > 0) {
            const ch = foundChapters[0];
            setChatContext(prev => ({ ...prev, step: 'action', chapterTitle: ch.title, chapterSlug: ch.slug, subjectKey: ch.subject }));
            addMsg("bot", `I found ${ch.title}. What would you like to do?`, ["View Notes / PDFs", "View Formulas", "Start Standard Test", "Create Custom Test", "Search Similar Questions"]);
            return true;
        }
    }
    
    // Greeting
    if (text.includes("hello") || text.includes("hi ") || text.includes("hey")) {
       addMsg("bot", "Hello! I am Quantrex AI. Which chapter or subject do you want to study? You can say 'Physics chemistry math ka test banao' or 'Matrix ke repeated questions nikalo'.");
       return true;
    }
    
    return false; // not handled
  };

  const handleVoiceCommand = async (command) => {
    const handled = await processNLQuery(command);
    if (!handled) {
       addMsg("bot", "I couldn't quite catch a specific chapter name or action. Please try saying it clearly, like 'Integration ka test' or 'Matrix ke repeated questions'.");
    }
  };

  async function handleSend(textOverride = null) {
    const text = textOverride ?? input.trim();
    if (!text) return;
    
    if (!textOverride) setInput("");
    addMsg("user", text);
    setIsLoading(true);

    const lowerText = text.toLowerCase();
    
    // First, attempt advanced NLP parsing if it wasn't a standard button click
    if (!textOverride) {
        const handled = await processNLQuery(text);
        if (handled) {
            setIsLoading(false);
            return;
        }
    }
    
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
        addMsg("bot", `Great choice! Which subject do you want to study for **${match.label}**?`, subjects);
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
        
        addMsg("bot", `Awesome! Now select a chapter:`, null, { type: 'chapter_select', chapters, subjectKey: subjKey, examKey: chatContext.examKey });
        return;
      }
    }

    // Step 3: Select Chapter 
    if (chatContext.step === 'chapter') {
      const examData = syllabus[chatContext.examKey];
      const chapters = examData.subjects[chatContext.subjectKey].chapters || [];
      const match = chapters.find(c => c.title.toLowerCase() === lowerText);
      
      if (match) {
        const fetchSlug = getFetchSlug(chatContext.examKey, match);
        setChatContext(prev => ({ ...prev, step: 'action', chapterSlug: fetchSlug, chapterTitle: match.title }));
        
        addMsg("bot", `What would you like to do with **${match.title}**?`, [
          "Create Test", 
          "Study Notes / PDFs", 
          "View Formulas", 
          "Search Similar Questions"
        ]);
        return;
      }
    }

    // Step 4: Select Action
    if (chatContext.step === 'action') {
      if (lowerText.includes("test")) {
        setChatContext(prev => ({ ...prev, step: 'test_config' }));
        addMsg("bot", `Would you like a standard test or build your own custom test?`, ["Standard Test (15 Qs)", "Custom Test"]);
        return;
      } else if (lowerText.includes("note") || lowerText.includes("pdf")) {
        addMsg("bot", `Opening Notes for ${chatContext.chapterTitle}...`, null, { type: 'launch_url', url: `/?view_chapter=${chatContext.chapterSlug}&tab=pdfs`, label: 'Open Notes' });
        setChatContext(prev => ({ ...prev, step: 'ready' }));
        return;
      } else if (lowerText.includes("formula")) {
        addMsg("bot", `Opening Formulas for ${chatContext.chapterTitle}...`, null, { type: 'launch_url', url: `/?view_chapter=${chatContext.chapterSlug}&tab=formulas`, label: 'Open Formulas' });
        setChatContext(prev => ({ ...prev, step: 'ready' }));
        return;
      } else if (lowerText.includes("search") || lowerText.includes("similar")) {
        setChatContext(prev => ({ ...prev, step: 'search_keyword' }));
        addMsg("bot", `What topic or keyword are you looking for in ${chatContext.chapterTitle}? (e.g. 'integration', 'matrix')`);
        return;
      }
    }

    // Step 5: Test Config (Standard vs Custom)
    if (chatContext.step === 'test_config') {
      if (lowerText.includes("standard")) {
        const isAdv = chatContext.examKey === 'jee-advanced';
        const types = isAdv ? { MCQ: 10, MULTI_CORRECT: 3, COMPREHENSION: 2 } : { MCQ: 10, NUMERICAL: 5 };
        const params = {
          exam: chatContext.examKey,
          chapters: [chatContext.chapterSlug],
          types: types,
          count: 15,
          duration: 60,
          years: 'All',
          seed: Math.floor(Math.random() * 1000000)
        };
        const encodedParams = encodeURIComponent(JSON.stringify(params));
        addMsg("bot", "Your standard test is ready!", null, { type: 'launch_test', url: `/?custom_test=${encodedParams}` });
        setChatContext(prev => ({ ...prev, step: 'ready' }));
        return;
      } else if (lowerText.includes("custom")) {
        addMsg("bot", "Configure your test settings:", null, { type: 'custom_test_ui' });
        // The inline UI will handle launching.
        return;
      }
    }

    // Step 6: Search Keyword
    if (chatContext.step === 'search_keyword') {
      const keyword = text;
      addMsg("bot", `Searching for "${keyword}"...`);
      setIsLoading(true);
      
      try {
        const response = await fetch(`${window.location.origin}/data/questions/${chatContext.chapterSlug}.json`);
        if (!response.ok) throw new Error("File not found");
        const data = await response.json();
        
        let questionsArray = [];
        if (Array.isArray(data)) questionsArray = data;
        else if (data && data.questions && Array.isArray(data.questions)) questionsArray = data.questions;
        else if (data && data.data && Array.isArray(data.data)) questionsArray = data.data;

        // Semantic keyword filtering (basic local implementation)
        const matched = questionsArray.filter(q => {
           const content = JSON.stringify(q).toLowerCase();
           return content.includes(keyword.toLowerCase());
        });

        if (matched.length > 0) {
          addMsg("bot", `I found ${matched.length} similar questions for "**${keyword}**". Here are a few:`, null, { type: 'search_results', results: matched.slice(0, 5) });
        } else {
          addMsg("bot", `I couldn't find any questions matching "**${keyword}**" in this chapter. Try another keyword or chapter.`);
        }
      } catch (err) {
        addMsg("bot", `Sorry, I encountered an error searching for "${keyword}". Ensure the chapter database is available.`);
      }

      setIsLoading(false);
      setChatContext(prev => ({ ...prev, step: 'action' })); // Let them choose action again
      addMsg("bot", `What else would you like to do?`, ["Create Test", "Search Similar Questions"]);
      return;
    }

    // Fallback logic / Ready state
    addMsg("bot", "Let me help you restart.", ["JEE Main", "JEE Advanced", "NDA"]);
    setChatContext({ step: 'exam', examKey: null, subjectKey: null, chapterSlug: null, chapterTitle: null, customTestConfig: { duration: 60, count: 15 } });
  }

  // --- Inline components for Chat Custom Data ---

  // Custom Test UI inside Chat
  const renderCustomTestUI = (msg) => {
    return (
      <div style={{ background: "#0f172a", borderRadius: 12, padding: 16, marginTop: 8, border: "1px solid #334155" }}>
        <h4 style={{ color: "#fff", fontSize: 13, marginBottom: 12, fontWeight: "bold" }}><Settings2 size={14} style={{ display: 'inline', marginRight: 4 }}/> Custom Test Details</h4>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ color: "#94a3b8", fontSize: 13 }}>Questions</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: "#1e293b", padding: "4px 8px", borderRadius: 8 }}>
            <button onClick={() => setChatContext(c => ({...c, customTestConfig: {...c.customTestConfig, count: Math.max(5, c.customTestConfig.count - 5)}}))} style={{ background: "transparent", color: "#38bdf8", border: "none", cursor: "pointer", fontSize: 16 }}>-</button>
            <span style={{ color: "#fff", fontSize: 14, width: 24, textAlign: 'center' }}>{chatContext.customTestConfig.count}</span>
            <button onClick={() => setChatContext(c => ({...c, customTestConfig: {...c.customTestConfig, count: c.customTestConfig.count + 5}}))} style={{ background: "transparent", color: "#38bdf8", border: "none", cursor: "pointer", fontSize: 16 }}>+</button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ color: "#94a3b8", fontSize: 13 }}>Time (mins)</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: "#1e293b", padding: "4px 8px", borderRadius: 8 }}>
            <button onClick={() => setChatContext(c => ({...c, customTestConfig: {...c.customTestConfig, duration: Math.max(15, c.customTestConfig.duration - 15)}}))} style={{ background: "transparent", color: "#38bdf8", border: "none", cursor: "pointer", fontSize: 16 }}>-</button>
            <span style={{ color: "#fff", fontSize: 14, width: 24, textAlign: 'center' }}>{chatContext.customTestConfig.duration}</span>
            <button onClick={() => setChatContext(c => ({...c, customTestConfig: {...c.customTestConfig, duration: c.customTestConfig.duration + 15}}))} style={{ background: "transparent", color: "#38bdf8", border: "none", cursor: "pointer", fontSize: 16 }}>+</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => {
                const types = chatContext.examKey === 'jee-advanced' 
                  ? { MCQ: chatContext.customTestConfig.count } 
                  : { MCQ: chatContext.customTestConfig.count };
                const params = {
                  exam: chatContext.examKey,
                  chapters: [chatContext.chapterSlug],
                  types: types,
                  count: chatContext.customTestConfig.count,
                  duration: chatContext.customTestConfig.duration,
                  years: 'All',
                  seed: Math.floor(Math.random() * 1000000)
                };
                const encodedParams = encodeURIComponent(JSON.stringify(params));
                window.location.href = `/?custom_test=${encodedParams}`;
              }}
              style={{
                background: "linear-gradient(135deg, #38bdf8, #3b82f6)", border: "none", color: "#fff",
                padding: "10px", borderRadius: 8, fontSize: 14, fontWeight: "bold",
                cursor: "pointer", flex: 1, textAlign: "center"
              }}
            >
              Start Custom Test
            </button>
            <button
              onClick={() => {
                const types = chatContext.examKey === 'jee-advanced' 
                  ? { MCQ: chatContext.customTestConfig.count } 
                  : { MCQ: chatContext.customTestConfig.count };
                const params = {
                  exam: chatContext.examKey,
                  chapters: [chatContext.chapterSlug],
                  types: types,
                  count: chatContext.customTestConfig.count,
                  duration: chatContext.customTestConfig.duration,
                  years: 'All',
                  seed: Math.floor(Math.random() * 1000000)
                };
                // Base64 encode for sharing
                const sharedPayload = btoa(JSON.stringify(params));
                const shareLink = `${window.location.origin}/?shared_test=${sharedPayload}`;
                navigator.clipboard.writeText(shareLink);
                alert("Shareable Link copied to clipboard!");
              }}
              title="Copy Shareable Link"
              style={{
                background: "#1e293b", border: "1px solid #38bdf8", color: "#38bdf8",
                padding: "10px", borderRadius: 8, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              <Share2 size={18} />
            </button>
          </div>
      </div>
    );
  };

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
          <RobotAvatar isSpeaking={false} className="w-8 h-8" />
          <span style={{ color: "#fff", fontWeight: 600, fontSize: 14, fontFamily: "system-ui" }}>Quantrex AI</span>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px #34d399" }} />
        </button>
      </div>
    );
  }

  return (
    <>
    {isVoiceMode && (
      <FullScreenRobot 
        onClose={() => setIsVoiceMode(false)}
        onCommand={handleVoiceCommand}
        isSpeakingAI={isSpeaking}
        aiResponseText={lastRobotSpeech}
      />
    )}
    <div style={{
      position: "fixed", bottom: 20, right: 20, 
      width: isExpanded ? Math.min(800, window.innerWidth - 40) : 380, 
      height: isExpanded ? Math.min(800, window.innerHeight - 40) : 600,
      background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
      borderRadius: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)",
      display: "flex", flexDirection: "column", zIndex: 99999, overflow: "hidden",
      transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
    }}>
      {/* header */}
      <div style={{
        padding: "20px 24px", background: "rgba(15,23,42,0.8)", backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative" }}>
            {/* The Avatar */}
            <RobotAvatar isSpeaking={isSpeaking} className="w-10 h-10" />
            <div style={{ position: "absolute", bottom: -2, right: -2, width: 12, height: 12, background: "#10b981", borderRadius: "50%", border: "2px solid #0f172a" }}></div>
          </div>
          <div>
            <h3 style={{ margin: 0, color: "#f8fafc", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              Quantrex AI <Sparkles size={14} color="#38bdf8" />
            </h3>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: 12 }}>Smart Assistant</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button 
            onClick={() => setIsVoiceMode(true)} 
            style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="Open Voice Chat"
          >
            <Mic size={20} className="animate-pulse" />
          </button>
          
          <button 
            onClick={() => setIsVoiceEnabled(!isVoiceEnabled)} 
            style={{ background: 'none', border: 'none', color: isVoiceEnabled ? '#34d399' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: 20 }}
            title="Toggle Voice (TTS)"
          >
            {isVoiceEnabled ? '🔊' : '🔇'}
          </button>
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title={isExpanded ? "Minimize Chat" : "Expand Chat"}
          >
            {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>

          <button onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>
      </div>

      {/* chat area */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 16 }} className="custom-scrollbar">
        {messages.map((m) => (
          <div key={m.id} style={{ display: "flex", gap: 12, flexDirection: m.from === "user" ? "row-reverse" : "row" }}>
            {m.from === "bot" ? (
              <div style={{ flexShrink: 0 }}>
                {/* Small robot avatar for bot messages */}
                <RobotAvatar isSpeaking={false} className="w-8 h-8" />
              </div>
            ) : (
              <div style={{ background: "#3b82f6", padding: 6, borderRadius: "50%", flexShrink: 0, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={18} color="#fff" />
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

              {/* Custom Component Renders */}
              {m.customData && m.customData.type === 'similar_questions' && (
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {m.customData.data.map((q, idx) => (
                          <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 12, color: '#94a3b8' }}>
                                  <span style={{ background: '#0284c7', color: 'white', padding: '2px 8px', borderRadius: 4 }}>{q.year}</span>
                                  <span>{q.topic}</span>
                              </div>
                              <div className="math-content" style={{ color: '#f8fafc', fontSize: 14 }} dangerouslySetInnerHTML={{ __html: q.question }} />
                              
                              {q.options && q.options.length > 0 && (
                                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                      {q.options.map((opt, oIdx) => (
                                          <div key={oIdx} style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: 8, fontSize: 13, border: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1' }} dangerouslySetInnerHTML={{ __html: opt }} />
                                      ))}
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
              )}

              {m.customData && m.id === messages[messages.length-1].id && (
                <div style={{ marginTop: 8 }}>
                  
                  {/* Chapter List */}
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

                  {/* Launch External Link / Test */}
                  {(m.customData.type === 'launch_test' || m.customData.type === 'launch_url') && (
                    <button
                      onClick={() => window.location.href = m.customData.url}
                      style={{
                        background: "linear-gradient(135deg, #38bdf8, #3b82f6)", border: "none", color: "#fff",
                        padding: "12px 20px", borderRadius: 12, fontSize: 15, fontWeight: "bold",
                        cursor: "pointer", display: "flex", alignItems: "center", gap: 8, width: "100%", justifyContent: "center",
                        boxShadow: "0 4px 15px rgba(56,189,248,0.4)"
                      }}
                    >
                      <ExternalLink size={18} /> {m.customData.label || "Open Interface"}
                    </button>
                  )}

                  {/* Inline Custom Test Editor */}
                  {m.customData.type === 'custom_test_ui' && renderCustomTestUI(m)}

                  {/* Search Results Display */}
                  {m.customData.type === 'search_results' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: "#0f172a", padding: 12, borderRadius: 12, border: "1px solid #334155" }}>
                      {m.customData.results.map((q, idx) => (
                        <div key={idx} style={{ background: "#1e293b", padding: 10, borderRadius: 8, fontSize: 12, color: "#e2e8f0", borderLeft: "3px solid #38bdf8" }}>
                          {/* We try to render a snippet of the question text */}
                          <MessageContent text={(q.questionText || q.question || q.text || JSON.stringify(q)).substring(0, 150) + "..."} />
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const params = { exam: chatContext.examKey, chapters: [chatContext.chapterSlug], count: 10, duration: 30, types: { MCQ: 10 }, seed: Math.random() };
                          window.location.href = `/?custom_test=${encodeURIComponent(JSON.stringify(params))}`;
                        }}
                        style={{
                           background: "transparent", border: "1px solid #38bdf8", color: "#38bdf8",
                           padding: "8px", borderRadius: 6, fontSize: 13, cursor: "pointer", textAlign: "center"
                        }}
                      >
                        Create Test with these Topics
                      </button>
                    </div>
                  )}
                  
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
             <div style={{ flexShrink: 0 }}>
                <RobotAvatar isSpeaking={true} className="w-8 h-8" />
              </div>
            <div style={{ background: "#1e293b", borderRadius: 16, padding: "12px 16px", color: "#94a3b8", display: "flex", alignItems: "center", gap: 8 }}>
              <Loader2 size={16} className="animate-spin" /> Processing...
            </div>
          </div>
        )}
      </div>

      {/* input */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.1)", background: "#0f172a" }}>
        <div style={{ display: "flex", gap: 10, background: "#1e293b", borderRadius: 24, padding: "6px 6px 6px 16px", border: "1px solid #334155" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your response..."
            style={{
              flex: 1, background: "transparent", border: "none",
              color: "#fff", fontSize: 14, outline: "none", width: "100%"
            }}
          />
          <button 
            type="submit"
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
          <Database size={10} /> Local Semantic Search Engine Active
        </div>
      </form>
    </div>
    </>
  );
}
