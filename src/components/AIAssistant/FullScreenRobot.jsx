import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Sparkles } from 'lucide-react';

export default function FullScreenRobot({ onClose, onCommand, isSpeakingAI, aiResponseText }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN'; // Works great for Hinglish too

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        
        if (event.results[0].isFinal) {
          setIsListening(false);
          // Pass the final command up
          if (currentTranscript.trim().length > 0) {
             onCommand(currentTranscript);
          }
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      console.warn("Speech recognition not supported in this browser.");
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onCommand]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Your browser does not support Voice Recognition. Please use Chrome.");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };
  
  const isSpeaking = isSpeakingAI;

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center font-sans overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse"></div>
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Header controls */}
      <div className="absolute top-6 right-6 z-50 flex gap-4">
        <button 
          onClick={onClose}
          className="w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center text-white transition-all hover:rotate-90 hover:scale-110 shadow-lg"
        >
          <X size={24} />
        </button>
      </div>

      {/* Title */}
      <div className="absolute top-8 left-8 z-50 flex items-center gap-3">
         <Sparkles className="text-amber-400 animate-pulse" size={24} />
         <h2 className="text-white text-2xl font-bold tracking-wider">Quantrex <span className="text-blue-400">AI</span></h2>
      </div>

      {/* Main Avatar Area */}
      <div className="relative w-full max-w-lg aspect-square flex items-center justify-center z-10">
        
        {/* Glow behind robot */}
        <div className={`absolute inset-0 rounded-full blur-[80px] transition-all duration-700 ${isListening ? 'bg-amber-500/30 scale-110' : isSpeaking ? 'bg-blue-500/40 scale-125' : 'bg-emerald-500/20 scale-100'}`}></div>

        {/* The Boy Robot SVG */}
        <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
            <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            
            {/* CSS Animations */}
            <style>
              {`
                @keyframes float {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-15px); }
                }
                @keyframes leftArmMove {
                  0%, 100% { transform: rotate(0deg); }
                  50% { transform: rotate(25deg); }
                }
                @keyframes rightArmMove {
                  0%, 100% { transform: rotate(0deg); }
                  50% { transform: rotate(-25deg); }
                }
                @keyframes mouthTalk {
                  0%, 100% { transform: scaleY(0.2); }
                  50% { transform: scaleY(1.2); }
                }
                @keyframes eyeBlink {
                  0%, 96%, 100% { transform: scaleY(1); }
                  98% { transform: scaleY(0.1); }
                }
                
                .robot-container { animation: float 6s ease-in-out infinite; transform-origin: center; }
                .left-arm { transform-origin: 130px 180px; animation: leftArmMove ${isSpeaking ? '0.8s' : '4s'} ease-in-out infinite; }
                .right-arm { transform-origin: 270px 180px; animation: rightArmMove ${isSpeaking ? '0.8s' : '4s'} ease-in-out infinite; animation-delay: 0.2s; }
                .eyes { transform-origin: center; animation: eyeBlink 4s infinite; }
                .mouth { transform-origin: center; animation: mouthTalk ${isSpeaking ? '0.2s' : '0s'} infinite; }
              `}
            </style>
          </defs>

          <g className="robot-container">
            {/* Head Antenna */}
            <line x1="200" y1="90" x2="200" y2="40" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
            <circle cx="200" cy="40" r="10" fill={isListening ? "#f59e0b" : isSpeaking ? "#3b82f6" : "#10b981"} className="transition-colors duration-300" />
            <circle cx="200" cy="40" r="15" fill={isListening ? "#f59e0b" : isSpeaking ? "#3b82f6" : "#10b981"} opacity="0.4" className="animate-ping" />
            
            {/* Left Arm */}
            <g className="left-arm">
              <rect x="90" y="170" width="40" height="100" rx="20" fill="url(#bodyGrad)" />
              <circle cx="110" cy="270" r="25" fill="url(#accentGrad)" />
            </g>

            {/* Right Arm */}
            <g className="right-arm">
              <rect x="270" y="170" width="40" height="100" rx="20" fill="url(#bodyGrad)" />
              <circle cx="290" cy="270" r="25" fill="url(#accentGrad)" />
            </g>

            {/* Body */}
            <rect x="140" y="170" width="120" height="130" rx="25" fill="url(#bodyGrad)" />
            <path d="M 140 220 Q 200 240 260 220 L 260 275 Q 200 300 140 275 Z" fill="#e2e8f0" opacity="0.5" />
            
            {/* Screen on Body */}
            <rect x="160" y="195" width="80" height="50" rx="10" fill="#0f172a" />
            
            {/* Animated Wave on Screen */}
            {isSpeaking && (
               <g stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" className="animate-pulse">
                  <line x1="175" y1="220" x2="175" y2="220"><animate attributeName="y1" values="220;210;220" dur="0.5s" repeatCount="indefinite" /><animate attributeName="y2" values="220;230;220" dur="0.5s" repeatCount="indefinite" /></line>
                  <line x1="185" y1="220" x2="185" y2="220"><animate attributeName="y1" values="220;200;220" dur="0.4s" repeatCount="indefinite" /><animate attributeName="y2" values="220;240;220" dur="0.4s" repeatCount="indefinite" /></line>
                  <line x1="195" y1="220" x2="195" y2="220"><animate attributeName="y1" values="220;205;220" dur="0.6s" repeatCount="indefinite" /><animate attributeName="y2" values="220;235;220" dur="0.6s" repeatCount="indefinite" /></line>
                  <line x1="205" y1="220" x2="205" y2="220"><animate attributeName="y1" values="220;195;220" dur="0.3s" repeatCount="indefinite" /><animate attributeName="y2" values="220;245;220" dur="0.3s" repeatCount="indefinite" /></line>
                  <line x1="215" y1="220" x2="215" y2="220"><animate attributeName="y1" values="220;200;220" dur="0.5s" repeatCount="indefinite" /><animate attributeName="y2" values="220;240;220" dur="0.5s" repeatCount="indefinite" /></line>
                  <line x1="225" y1="220" x2="225" y2="220"><animate attributeName="y1" values="220;210;220" dur="0.4s" repeatCount="indefinite" /><animate attributeName="y2" values="220;230;220" dur="0.4s" repeatCount="indefinite" /></line>
               </g>
            )}

            {/* Head */}
            <rect x="120" y="80" width="160" height="110" rx="40" fill="#f8fafc" />
            <path d="M 120 135 Q 200 160 280 135 L 280 150 Q 200 190 120 150 Z" fill="#cbd5e1" opacity="0.6" />
            
            {/* Eyes */}
            <g className="eyes">
              {/* Left Eye */}
              <circle cx="165" cy="130" r="16" fill="#0f172a" />
              <circle cx="170" cy="125" r="5" fill="#fff" />
              
              {/* Right Eye */}
              <circle cx="235" cy="130" r="16" fill="#0f172a" />
              <circle cx="240" cy="125" r="5" fill="#fff" />
            </g>

            {/* Mouth */}
            {isSpeaking ? (
              <rect x="180" y="160" width="40" height="15" rx="7.5" fill="#0f172a" className="mouth" />
            ) : isListening ? (
               <path d="M 170 165 Q 200 180 230 165" fill="transparent" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
            ) : (
               <path d="M 180 165 Q 200 175 220 165" fill="transparent" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
            )}
            
            {/* Blush */}
            <circle cx="145" cy="150" r="10" fill="#f43f5e" opacity="0.3" />
            <circle cx="255" cy="150" r="10" fill="#f43f5e" opacity="0.3" />
            
          </g>
        </svg>
      </div>

      {/* Transcript & Subtitle Area */}
      <div className="z-20 flex flex-col items-center max-w-2xl px-6 w-full mb-12 min-h-[120px]">
        {aiResponseText && !isListening ? (
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-white text-xl font-medium text-center shadow-xl w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {aiResponseText}
          </div>
        ) : (
          <div className="text-white/70 text-2xl font-light text-center w-full min-h-[80px]">
             {transcript ? (
               <span className="text-white font-medium text-3xl">"{transcript}"</span>
             ) : isListening ? (
               <span className="animate-pulse">Listening... (Speak now)</span>
             ) : (
               <span>Tap the microphone and say something like:<br/> <strong className="text-white">"Matrix ka test banao"</strong></span>
             )}
          </div>
        )}
      </div>

      {/* Microphone Button */}
      <button 
        onClick={toggleListening}
        className={`z-20 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl relative
          ${isListening 
            ? 'bg-red-500 hover:bg-red-600 scale-110 shadow-[0_0_40px_rgba(239,68,68,0.6)]' 
            : 'bg-blue-600 hover:bg-blue-500 hover:scale-105 shadow-[0_0_30px_rgba(37,99,235,0.4)]'
          }
        `}
      >
        {/* Ripple effect when listening */}
        {isListening && (
           <>
              <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-75"></div>
              <div className="absolute inset-0 rounded-full border-2 border-red-300 animate-ping opacity-50" style={{ animationDelay: '0.3s' }}></div>
           </>
        )}
        
        {isListening ? (
          <MicOff size={40} className="text-white" />
        ) : (
          <Mic size={40} className="text-white" />
        )}
      </button>

    </div>
  );
}
