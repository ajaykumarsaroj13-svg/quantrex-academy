import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Mail, Phone, X, HelpCircle } from 'lucide-react';

export default function FloatingContact({ isLight }) {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToContact = () => {
    const section = document.getElementById('contact-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If not on a page with contact section, maybe redirect?
      // Since it's in App.jsx, the best we can do is just link it if it exists.
      window.location.hash = '#contact-section';
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`p-4 rounded-2xl border shadow-2xl flex flex-col gap-3 mb-2 w-64 ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#121A2F] border-white/10'
            }`}
          >
            <h4 className={`text-sm font-bold pb-2 border-b ${isLight ? 'border-slate-100 text-slate-800' : 'border-white/5 text-white'}`}>
              Connect with us
            </h4>
            
            <a 
              href="https://wa.me/918700508344" 
              target="_blank" 
              rel="noreferrer"
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                isLight ? 'hover:bg-green-50 text-slate-700' : 'hover:bg-green-500/10 text-gray-300 hover:text-white'
              }`}
            >
              <div className="bg-green-500/20 text-green-500 p-2 rounded-full">
                <MessageCircle className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">WhatsApp Chat</span>
            </a>

            <a 
              href="tel:+918700508344" 
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                isLight ? 'hover:bg-blue-50 text-slate-700' : 'hover:bg-blue-500/10 text-gray-300 hover:text-white'
              }`}
            >
              <div className="bg-blue-500/20 text-blue-500 p-2 rounded-full">
                <Phone className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">Call Us Now</span>
            </a>

            <button 
              onClick={scrollToContact}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors w-full text-left ${
                isLight ? 'hover:bg-amber-50 text-slate-700' : 'hover:bg-amber-500/10 text-gray-300 hover:text-white'
              }`}
            >
              <div className="bg-amber-500/20 text-amber-500 p-2 rounded-full">
                <HelpCircle className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">Send a Query</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] flex items-center justify-center transition-all duration-300 hover:scale-110 relative"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 border-2 border-white dark:border-[#0B101E] rounded-full animate-pulse"></span>
        )}
      </button>
    </div>
  );
}
