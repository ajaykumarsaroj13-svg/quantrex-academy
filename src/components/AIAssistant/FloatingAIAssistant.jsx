import React from 'react';
import { useAIAssistant } from '../../contexts/AIAssistantContext';
import AIChatWindow from './AIChatWindow';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';

export default function FloatingAIAssistant({ theme }) {
  const { isOpen, toggleAssistant } = useAIAssistant();
  const isLight = theme === 'light';

  return (
    <>
      <AIChatWindow isLight={isLight} />
      
      {/* Floating Button */}
      <button 
        onClick={toggleAssistant}
        className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 
        w-16 h-16 md:w-20 md:h-20 rounded-full shadow-[0_10px_40px_rgba(37,99,235,0.4)]
        transition-all duration-300 hover:scale-110 flex items-center justify-center
        overflow-hidden border-2 group
        ${isOpen ? 'scale-90 opacity-0 pointer-events-none' : 'scale-100 opacity-100 animate-float'}
        ${isLight ? 'border-white bg-blue-600' : 'border-amber-400/50 bg-[#0f172a]'}`}
        aria-label="Toggle AI Assistant"
      >
        <div className="absolute inset-0 bg-blue-500/20 mix-blend-overlay group-hover:bg-blue-400/30 transition-colors"></div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full animate-pulse-slow shadow-[inset_0_0_20px_rgba(251,191,36,0.3)]"></div>
        
        <img 
          src="/images/ai-mascot.jpg" 
          alt="Quantrex AI" 
          className="w-full h-full object-cover relative z-10"
        />

        {/* Small sparkle icon that floats near the mascot */}
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-lg border-2 border-[#0f172a] z-20 animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      </button>
    </>
  );
}
