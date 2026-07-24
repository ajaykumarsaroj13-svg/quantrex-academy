import React from 'react';
import { motion } from 'framer-motion';

export default function RobotAvatar({ isSpeaking, className = "" }) {
  return (
    <div className={`relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 overflow-hidden border-2 border-white/20 shadow-[0_0_15px_rgba(6,182,212,0.5)] ${className}`}>
      
      {/* Speaking Glow Effect */}
      {isSpeaking && (
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}

      {/* SVG Robot Face */}
      <svg viewBox="0 0 100 100" className="w-10 h-10 drop-shadow-md z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
        
        {/* Antenna */}
        <line x1="50" y1="20" x2="50" y2="8" stroke="white" strokeWidth="4" strokeLinecap="round" />
        <motion.circle 
          cx="50" cy="8" r="4" fill="#fbbf24"
          animate={isSpeaking ? { fill: ["#fbbf24", "#fef3c7", "#fbbf24"] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        />

        {/* Head Base */}
        <rect x="20" y="25" width="60" height="55" rx="12" fill="#1e293b" />
        <rect x="25" y="30" width="50" height="45" rx="8" fill="#0f172a" />

        {/* Eyes (Blinking Animation) */}
        <motion.g
          animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 1, 1] }}
          style={{ transformOrigin: "50% 42px" }}
        >
          <circle cx="35" cy="42" r="6" fill="#38bdf8" />
          <circle cx="65" cy="42" r="6" fill="#38bdf8" />
          
          {/* Eye Highlights */}
          <circle cx="33" cy="40" r="2" fill="white" />
          <circle cx="63" cy="40" r="2" fill="white" />
        </motion.g>

        {/* Mouth (Talking Animation) */}
        <motion.rect 
          x="40" y="58" width="20" rx="3" fill="#38bdf8"
          initial={{ height: 4 }}
          animate={isSpeaking ? { height: [4, 12, 4, 8, 4], y: [58, 54, 58, 56, 58] } : { height: 4, y: 58 }}
          transition={isSpeaking ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
        />

        {/* Cheeks */}
        <circle cx="28" cy="55" r="4" fill="#ef4444" opacity="0.6" />
        <circle cx="72" cy="55" r="4" fill="#ef4444" opacity="0.6" />
      </svg>
    </div>
  );
}
