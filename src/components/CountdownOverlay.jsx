import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CountdownOverlay({ onComplete, examTitle = 'Exam Starting' }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else if (count === 0) {
      const timer = setTimeout(() => {
        onComplete();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [count, onComplete]);

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md text-white select-none">
      <div className="text-sm font-extrabold uppercase tracking-widest text-blue-400 mb-8 bg-blue-500/10 px-6 py-2 rounded-full border border-blue-500/30">
        {examTitle}
      </div>

      <div className="relative flex items-center justify-center w-64 h-64">
        <AnimatePresence mode="wait">
          {count > 0 ? (
            <motion.div
              key={count}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-9xl font-black font-display text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-400 drop-shadow-[0_0_35px_rgba(59,130,246,0.8)]"
            >
              {count}
            </motion.div>
          ) : (
            <motion.div
              key="go"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.4, ease: "backOut" }}
              className="text-8xl font-black tracking-widest text-emerald-400 drop-shadow-[0_0_50px_rgba(52,211,153,0.9)]"
            >
              GO!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="mt-8 text-xs font-semibold text-gray-400 tracking-wider">
        Get ready! Your exam timer will start immediately after countdown.
      </p>
    </div>
  );
}
