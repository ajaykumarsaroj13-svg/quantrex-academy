"use client";

import { motion } from "framer-motion";
import { CheckCircle2, PlayCircle, BarChart, LayoutList } from "lucide-react";

export const TestSeriesPreview = () => {
  return (
    <section id="test-series" className="py-24 bg-[#0B1020] relative overflow-hidden">
      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-secondary/20 bg-secondary/5 mb-6 text-secondary"
            >
              <LayoutList className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">Ultimate Test Series</span>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-heading font-bold text-white mb-6"
            >
              Simulate the <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">Real Exam</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-text-secondary mb-8"
            >
              Practice in an environment identical to the NTA CBT interface. Our adaptive testing engine calibrates the difficulty based on your performance to maximize your growth.
            </motion.p>

            <div className="grid grid-cols-2 gap-6 mb-10">
              {[
                { label: "Total Tests", value: "530+", color: "text-primary" },
                { label: "Questions", value: "12,500+", color: "text-accent" },
                { label: "Chapter Tests", value: "100+", color: "text-secondary" },
                { label: "Full Mocks", value: "40+", color: "text-success" },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="border-l-2 border-white/10 pl-4"
                >
                  <p className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
                  <p className="text-sm text-text-secondary font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: UI Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 blur-[100px] rounded-full" />
            
            <div className="relative bg-[#050816]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]">
              {/* Fake Window Header */}
              <div className="h-10 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-danger/80" />
                  <div className="w-3 h-3 rounded-full bg-warning/80" />
                  <div className="w-3 h-3 rounded-full bg-success/80" />
                </div>
                <div className="mx-auto px-4 py-1 rounded bg-white/5 text-xs text-text-secondary font-mono">
                  quantrex.academy/test/jee-main-full-1
                </div>
              </div>

              {/* Fake Testing Interface */}
              <div className="flex flex-1 overflow-hidden">
                {/* Main Area */}
                <div className="flex-1 p-6 flex flex-col">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                    <h3 className="text-white font-bold text-lg">Mathematics</h3>
                    <div className="px-3 py-1 rounded bg-danger/20 text-danger font-mono font-bold text-sm">
                      02:45:12
                    </div>
                  </div>
                  
                  <div className="mb-6 flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">14</span>
                      <div className="text-white/90 text-sm leading-relaxed space-y-3">
                        <p>Let $f(x)$ be a differentiable function such that $f'(x) = f(x)$ and $f(0) = 1$.</p>
                        <p>Evaluate the definite integral $\int_{0}^{1} f(x) dx$.</p>
                      </div>
                    </div>

                    <div className="space-y-3 pl-12">
                      {["e - 1", "e + 1", "1", "0"].map((opt, i) => (
                        <div key={i} className={`p-3 rounded-lg border ${i === 0 ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5'} flex items-center gap-3 cursor-pointer`}>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${i === 0 ? 'border-primary' : 'border-white/30'}`}>
                            {i === 0 && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                          </div>
                          <span className="text-sm text-white">{opt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-auto">
                    <button className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors">Mark for Review</button>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 rounded bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors">Previous</button>
                      <button className="px-4 py-2 rounded bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)]">Save & Next</button>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="w-64 bg-white/5 border-l border-white/10 p-4 flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent p-0.5">
                      <div className="w-full h-full bg-[#050816] rounded-full overflow-hidden">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Rahul K.</p>
                      <p className="text-xs text-text-secondary">JEE Main Full Test 1</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2 mb-6">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`aspect-square rounded flex items-center justify-center text-xs font-bold text-white
                          ${i === 13 ? 'bg-primary' : i < 8 ? 'bg-success/80' : i === 9 || i === 11 ? 'bg-danger/80' : i === 10 ? 'bg-warning/80' : 'bg-white/10'}`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>

                  <button className="mt-auto w-full py-3 rounded-lg bg-success text-white font-bold hover:bg-success/90 transition-colors shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                    Submit Test
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
