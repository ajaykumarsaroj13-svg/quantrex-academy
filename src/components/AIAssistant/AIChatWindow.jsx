import React, { useState, useRef, useEffect } from 'react';
import { useAIAssistant } from '../../contexts/AIAssistantContext';
import X from 'lucide-react/dist/esm/icons/x';
import Send from 'lucide-react/dist/esm/icons/send';
import Mic from 'lucide-react/dist/esm/icons/mic';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Maximize2 from 'lucide-react/dist/esm/icons/maximize-2';
import Minimize2 from 'lucide-react/dist/esm/icons/minimize-2';

const SMART_COMMANDS = [
  "Create Mock Test",
  "Show Formula",
  "Open PYQ",
  "Predict Rank",
  "Explain Question"
];

export default function AIChatWindow({ isLight }) {
  const { isOpen, closeAssistant, messages, sendMessage, isTyping } = useAIAssistant();
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Theme variables based on glassmorphism and the dark/blue/gold theme
  const bgClass = isLight 
    ? 'bg-white/90 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(37,99,235,0.15)]' 
    : 'bg-[#0a0f1d]/90 backdrop-blur-xl border border-[#2563eb]/20 shadow-[0_8px_32px_rgba(37,99,235,0.2)]';
    
  const headerClass = isLight 
    ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white' 
    : 'bg-gradient-to-r from-[#0f172a] via-[#1e3a8a] to-[#0f172a] border-b border-[#2563eb]/30 text-white';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleCommandClick = (cmd) => {
    sendMessage(cmd);
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed ${isExpanded ? 'inset-4 md:inset-10 z-[100]' : 'bottom-20 right-4 md:right-8 w-[350px] md:w-[400px] h-[550px] max-h-[calc(100vh-120px)] z-50'} 
      flex flex-col rounded-2xl overflow-hidden transition-all duration-300 ease-out origin-bottom-right
      ${bgClass} animate-chat-popup`}
    >
      {/* Header */}
      <div className={`p-4 flex items-center justify-between ${headerClass}`}>
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#0f172a] border-2 border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.3)] flex-shrink-0">
            <img src="/images/ai-mascot.jpg" alt="Quantrex AI" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay"></div>
          </div>
          <div>
            <h3 className="font-bold text-sm md:text-base flex items-center gap-1.5 drop-shadow-md">
              Quantrex AI <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h3>
            <p className="text-[10px] md:text-xs text-blue-100/80 font-medium">24×7 IIT-JEE Expert</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white hidden md:block"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={closeAssistant}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isLight ? 'bg-slate-50/50' : 'bg-transparent'}`}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full overflow-hidden mr-2 mt-1 flex-shrink-0 border border-blue-500/30">
                <img src="/images/ai-mascot.jpg" alt="AI" className="w-full h-full object-cover" />
              </div>
            )}
            
            <div 
              className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-sm' 
                  : isLight 
                    ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm' 
                    : 'bg-[#1e293b]/80 border border-blue-500/20 text-gray-200 rounded-tl-sm backdrop-blur-md'
                }`}
            >
              {/* Parse bold text simply for now */}
              {msg.content.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className={msg.role === 'user' ? 'text-white' : (isLight ? 'text-blue-900' : 'text-blue-300')}>{part}</strong> : part)}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start animate-fade-in">
             <div className="w-6 h-6 rounded-full overflow-hidden mr-2 mt-1 flex-shrink-0 border border-blue-500/30">
                <img src="/images/ai-mascot.jpg" alt="AI" className="w-full h-full object-cover" />
              </div>
            <div className={`rounded-2xl p-3 rounded-tl-sm flex gap-1 items-center
              ${isLight ? 'bg-white border border-gray-100' : 'bg-[#1e293b]/80 border border-blue-500/20 backdrop-blur-md'}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Smart Commands (only show if not typing and at bottom of chat) */}
      {!isTyping && (
        <div className={`px-3 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t ${isLight ? 'border-gray-100 bg-white' : 'border-blue-900/30 bg-[#0a0f1d]/50'}`}>
          {SMART_COMMANDS.map(cmd => (
            <button
              key={cmd}
              onClick={() => handleCommandClick(cmd)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all
                ${isLight 
                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200' 
                  : 'bg-blue-900/30 text-blue-300 hover:bg-blue-800/50 border border-blue-500/30'}`}
            >
              {cmd}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className={`p-3 border-t ${isLight ? 'border-gray-200 bg-white' : 'border-blue-900/50 bg-[#0f172a]/80'}`}>
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <button 
            type="button"
            className={`absolute left-2 p-2 rounded-full transition-colors ${isLight ? 'text-gray-400 hover:text-blue-600 hover:bg-blue-50' : 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/30'}`}
          >
            <Mic className="w-4 h-4" />
          </button>
          
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask AI Expert..."
            className={`w-full pl-10 pr-12 py-3 rounded-xl text-sm transition-all outline-none focus:ring-2 
              ${isLight 
                ? 'bg-gray-100 text-gray-800 placeholder-gray-400 focus:ring-blue-200' 
                : 'bg-[#1e293b]/60 text-white placeholder-gray-500 border border-blue-500/20 focus:ring-blue-500/40 focus:border-blue-500/50'}`}
          />
          
          <button 
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className={`absolute right-1.5 p-2 rounded-lg transition-all ${
              inputValue.trim() 
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md scale-100' 
                : 'bg-transparent text-gray-400 scale-90'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
