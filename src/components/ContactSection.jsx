import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PhoneCall, Mail, MessageCircle, Send, CheckCircle, Shield } from 'lucide-react';

export default function ContactSection({ theme = 'dark' }) {
  const isLight = theme === 'light';
  const [formData, setFormData] = useState({ name: '', mobile: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', mobile: '', message: '' });
    }, 3000);
  };

  const contactMethods = [
    {
      id: 'whatsapp',
      title: 'WhatsApp Chat',
      desc: 'Instant replies for quick queries.',
      value: '8700508344',
      icon: MessageCircle,
      action: 'https://wa.me/918700508344',
      color: 'text-green-500',
      bg: isLight ? 'bg-green-100' : 'bg-green-500/10',
      border: isLight ? 'border-green-200 hover:border-green-400' : 'border-green-500/20 hover:border-green-500/50',
    },
    {
      id: 'call',
      title: 'Call Us directly',
      desc: 'Speak to our academic counselors.',
      value: '+91 87005 08344',
      icon: PhoneCall,
      action: 'tel:+918700508344',
      color: 'text-blue-500',
      bg: isLight ? 'bg-blue-100' : 'bg-blue-500/10',
      border: isLight ? 'border-blue-200 hover:border-blue-400' : 'border-blue-500/20 hover:border-blue-500/50',
    },
    {
      id: 'email',
      title: 'Send an Email',
      desc: 'For detailed queries and admissions.',
      value: 'quantrexacademy@gmail.com',
      icon: Mail,
      action: 'mailto:quantrexacademy@gmail.com',
      color: 'text-amber-500',
      bg: isLight ? 'bg-amber-100' : 'bg-amber-500/10',
      border: isLight ? 'border-amber-200 hover:border-amber-400' : 'border-amber-500/20 hover:border-amber-500/50',
    }
  ];

  return (
    <div id="contact-section" className={`w-full py-16 px-6 md:px-12 transition-colors duration-300 relative overflow-hidden ${
      isLight ? 'bg-white text-slate-900 border-t border-slate-200' : 'bg-[#0B101E] text-white border-t border-white/5'
    }`}>
      {/* Background Decor */}
      {!isLight && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-600/10 rounded-full mix-blend-screen filter blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-amber-500/5 rounded-full mix-blend-screen filter blur-[120px]"></div>
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <span className={`text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 mb-4 ${
            isLight ? 'text-blue-600' : 'text-amber-500'
          }`}>
            <Shield className="h-4 w-4" /> WE ARE HERE TO HELP
          </span>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight font-display mb-4">
            Contact <span className={isLight ? 'text-blue-600' : 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-amber-400'}>Quantrex Academy</span>
          </h2>
          <p className={`max-w-2xl mx-auto text-sm md:text-base font-mono ${
            isLight ? 'text-slate-600' : 'text-gray-400'
          }`}>
            Have questions about JEE, Boards, Test Series, or Admissions? Connect with us directly. 
            <span className="block mt-2 font-semibold">Response within 24 hours.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          
          {/* Left Side: Contact Cards */}
          <div className="space-y-4">
            {contactMethods.map((method, idx) => (
              <motion.a
                href={method.action}
                target={method.id === 'whatsapp' ? '_blank' : '_self'}
                rel="noreferrer"
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`block p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
                  isLight 
                    ? `bg-slate-50 shadow-sm hover:shadow-md ${method.border}` 
                    : `bg-[#121A2F] shadow-lg ${method.border}`
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className={`h-14 w-14 rounded-full flex items-center justify-center shrink-0 ${method.bg} ${method.color}`}>
                    <method.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{method.title}</h3>
                    <p className={`text-xs mb-2 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{method.desc}</p>
                    <p className={`font-mono text-sm font-semibold tracking-wide ${isLight ? 'text-slate-800' : 'text-white'}`}>
                      {method.value}
                    </p>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>

          {/* Right Side: Query Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`p-8 md:p-10 rounded-3xl border relative overflow-hidden ${
              isLight 
                ? 'bg-slate-50 border-slate-200 shadow-md' 
                : 'bg-[#121A2F] border-white/10 shadow-2xl'
            }`}
          >
            {/* Form decorative background */}
            {!isLight && <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>}

            <h3 className="text-2xl font-black mb-2 tracking-tight">Drop a Query</h3>
            <p className={`text-sm mb-8 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
              Fill out the form below and our team will get back to you shortly.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ml-1 uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-colors ${
                    isLight 
                      ? 'bg-white border-slate-200 focus:border-blue-500 text-slate-800' 
                      : 'bg-black/20 border-white/10 focus:border-cyan-500 text-white placeholder-gray-600'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ml-1 uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>Mobile Number</label>
                <input 
                  type="tel" 
                  required
                  placeholder="Enter 10-digit number"
                  value={formData.mobile}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-colors ${
                    isLight 
                      ? 'bg-white border-slate-200 focus:border-blue-500 text-slate-800' 
                      : 'bg-black/20 border-white/10 focus:border-cyan-500 text-white placeholder-gray-600'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ml-1 uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>Message / Query</label>
                <textarea 
                  required
                  rows="3"
                  placeholder="How can we help you?"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-colors resize-none ${
                    isLight 
                      ? 'bg-white border-slate-200 focus:border-blue-500 text-slate-800' 
                      : 'bg-black/20 border-white/10 focus:border-cyan-500 text-white placeholder-gray-600'
                  }`}
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={submitted}
                className={`w-full py-4 rounded-xl font-bold tracking-wide flex items-center justify-center gap-2 transition-all ${
                  submitted 
                    ? 'bg-green-500 text-white cursor-not-allowed'
                    : isLight
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:shadow-[0_0_30px_rgba(8,145,178,0.5)]'
                }`}
              >
                {submitted ? (
                  <>
                    <CheckCircle className="h-5 w-5" /> Message Sent Successfully!
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Submit Query
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
