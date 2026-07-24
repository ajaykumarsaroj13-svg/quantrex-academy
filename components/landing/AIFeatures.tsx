"use client";

import { motion } from "framer-motion";
import { Brain, Sparkles, TrendingUp, Target, Mic, FileWarning } from "lucide-react";
import { cn } from "@/lib/utils";

const aiFeatures = [
  {
    icon: <Brain className="w-6 h-6 text-accent" />,
    title: "AI Doubt Solver",
    desc: "Instant step-by-step solutions with reasoning for any complex JEE problem.",
    glow: "bg-accent/20"
  },
  {
    icon: <Target className="w-6 h-6 text-primary" />,
    title: "AI Weakness Analysis",
    desc: "Identifies precise sub-topics where you lose marks and generates targeted practice.",
    glow: "bg-primary/20"
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-success" />,
    title: "AI Rank Predictor",
    desc: "Real-time AIR prediction based on mock test performance and historical data.",
    glow: "bg-success/20"
  },
  {
    icon: <Mic className="w-6 h-6 text-secondary" />,
    title: "AI Voice Tutor",
    desc: "Interactive voice-guided hints when you're stuck on a problem.",
    glow: "bg-secondary/20"
  }
];

export const AIFeatures = () => {
  return (
    <section id="ai-features" className="py-24 relative overflow-hidden bg-[#050816]">
      {/* Decorative Glows */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 mb-6 text-accent"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold uppercase tracking-wider">Quantrex AI Engine</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-heading font-bold text-white mb-6"
          >
            Your Personal <span className="gradient-text">Superintelligence</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-text-secondary"
          >
            Experience the future of learning. Our AI analyzes millions of data points to optimize your study path, predict your rank, and eliminate weaknesses.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Features List */}
          <div className="grid sm:grid-cols-2 gap-6">
            {aiFeatures.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 + 0.3 }}
                className="group relative p-6 glass-card hover:-translate-y-1"
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors", feature.glow)}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{feature.desc}</p>
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 rounded-2xl transition-colors" />
              </motion.div>
            ))}
          </div>

          {/* Futuristic Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:h-[500px] w-full rounded-3xl border border-white/10 bg-[#0B1020]/80 backdrop-blur-xl p-6 shadow-[0_0_50px_rgba(37,99,235,0.15)] overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            
            {/* Dashboard Header */}
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-white font-bold">AI Diagnostics</h4>
                  <p className="text-xs text-success flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Live Analysis Active
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-secondary uppercase">Predicted AIR</p>
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-warning to-danger">
                  1,204 <span className="text-sm">↗</span>
                </p>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 flex gap-4">
                <FileWarning className="w-6 h-6 text-danger shrink-0" />
                <div>
                  <h5 className="text-sm font-bold text-white mb-1">Critical Weakness Detected</h5>
                  <p className="text-xs text-text-secondary">You lost 12 marks in Complex Numbers due to algebraic calculation errors. Generating 5 custom practice questions...</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h5 className="text-sm font-bold text-white mb-3">Topic Mastery</h5>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-secondary">Calculus</span>
                      <span className="text-success">85%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-success w-[85%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-secondary">Algebra</span>
                      <span className="text-warning">62%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-warning w-[62%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scanning Line Animation */}
            <motion.div 
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
