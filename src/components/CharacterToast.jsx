import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CharacterToast = ({ feedback, onClose }) => {
  const [isSpeaking, setIsSpeaking] = useState(true);

  useEffect(() => {
    if (feedback) {
      setIsSpeaking(true);
      
      // Stop the mouth/pulse animation roughly when the audio finishes (approx 3-5 seconds depending on text)
      // Since we don't have the exact audio duration here easily, we'll estimate 3.5s for speaking, and 5s to close
      const speakTimer = setTimeout(() => setIsSpeaking(false), 3500);
      const closeTimer = setTimeout(() => onClose(), 6000);
      
      return () => {
        clearTimeout(speakTimer);
        clearTimeout(closeTimer);
      };
    }
  }, [feedback, onClose]);

  return (
    <AnimatePresence>
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[9999] w-[95%] max-w-lg"
        >
          <div className={`p-4 rounded-3xl shadow-2xl border-2 flex flex-row items-center text-left backdrop-blur-md overflow-hidden relative ${
            feedback.isCorrect 
              ? 'bg-gradient-to-r from-orange-900/95 to-yellow-900/90 border-yellow-500 shadow-yellow-500/40' 
              : 'bg-gradient-to-r from-red-950/95 to-gray-900/95 border-red-600 shadow-red-600/40'
          }`}>
            
            {/* Character Image with Speaking Animation */}
            <div className="relative shrink-0 mr-4">
              <motion.div 
                animate={isSpeaking ? { 
                  scale: [1, 1.05, 1],
                  y: [0, -3, 0]
                } : {}}
                transition={{ 
                  repeat: isSpeaking ? Infinity : 0, 
                  duration: 0.4 
                }}
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 overflow-hidden shadow-xl ${
                  feedback.isCorrect ? 'border-yellow-400 shadow-yellow-400/50' : 'border-red-500 shadow-red-500/50'
                }`}
              >
                <img 
                  src={feedback.imgPath} 
                  alt={feedback.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150?text=' + feedback.name;
                  }}
                />
              </motion.div>
              
              {/* Glowing aura effect behind character */}
              <div className={`absolute inset-0 -z-10 rounded-full blur-md ${
                feedback.isCorrect ? 'bg-yellow-400/30' : 'bg-red-600/30'
              }`}></div>
            </div>
            
            {/* Dialogue Content */}
            <div className="flex-1 min-w-0 py-2">
              <h3 className={`font-bold text-xl sm:text-2xl mb-1 flex items-center gap-2 ${
                feedback.isCorrect ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {feedback.name}
                {feedback.isCorrect && <span className="text-sm">🙏</span>}
                {!feedback.isCorrect && <span className="text-sm">🗡️</span>}
              </h3>
              
              <p className="text-white font-medium text-base sm:text-lg italic font-serif leading-snug drop-shadow-md">
                "{feedback.text}"
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CharacterToast;
