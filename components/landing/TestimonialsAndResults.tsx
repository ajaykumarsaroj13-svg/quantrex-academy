"use client";

import { motion } from "framer-motion";
import { Star, Quote, Award } from "lucide-react";

const results = [
  { rank: "AIR 14", name: "Vikram S.", exam: "JEE Advanced 2023", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram" },
  { rank: "AIR 42", name: "Anjali M.", exam: "JEE Advanced 2023", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali" },
  { rank: "AIR 89", name: "Rohan D.", exam: "JEE Advanced 2023", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan" },
];

const testimonials = [
  {
    quote: "The way calculus was visualized completely changed my perspective. I went from struggling in math to scoring 114/120 in JEE Advanced.",
    name: "Vikram S.",
    detail: "IIT Bombay, CS",
  },
  {
    quote: "Quantrex's AI identified that I was losing marks in Coordinate Geometry calculations. The targeted practice sheets fixed it in 2 weeks.",
    name: "Anjali M.",
    detail: "IIT Delhi, EE",
  }
];

export const TestimonialsAndResults = () => {
  return (
    <section id="results" className="py-24 bg-[#0B1020] relative">
      <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay" />
      <div className="container mx-auto px-6 relative z-10">
        
        {/* Results Section */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-heading font-bold text-white mb-6"
            >
              Legacy of <span className="text-transparent bg-clip-text bg-gradient-to-r from-warning to-yellow-200">Champions</span>
            </motion.h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {results.map((result, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="relative p-[1px] rounded-3xl bg-gradient-to-b from-warning/50 to-warning/5 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-warning/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                <div className="relative h-full bg-[#050816] rounded-[23px] p-6 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center mb-4 border border-warning/30">
                    <Award className="w-8 h-8 text-warning" />
                  </div>
                  <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-warning to-yellow-600 mb-2">
                    {result.rank}
                  </h3>
                  <p className="text-lg font-bold text-white mb-1">{result.name}</p>
                  <p className="text-sm text-text-secondary">{result.exam}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((test, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="p-8 rounded-3xl bg-white/5 border border-white/10 relative"
              >
                <Quote className="w-12 h-12 text-white/10 absolute top-6 right-6" />
                <div className="flex gap-1 mb-6 text-warning">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-lg text-white/90 leading-relaxed mb-6 italic">"{test.quote}"</p>
                <div>
                  <p className="font-bold text-white">{test.name}</p>
                  <p className="text-sm text-primary font-medium">{test.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
      </div>
    </section>
  );
};
