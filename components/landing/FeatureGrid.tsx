"use client";

import { motion } from "framer-motion";
import { BookOpen, Video, FileText, BarChart3, Clock, Zap } from "lucide-react";

const features = [
  {
    icon: <Video className="w-8 h-8 text-primary" />,
    title: "Cinematic 4K Lectures",
    desc: "Experience high-definition video lectures with 3D animations that make complex calculus and algebra concepts visual and intuitive."
  },
  {
    icon: <BarChart3 className="w-8 h-8 text-secondary" />,
    title: "Advanced Analytics",
    desc: "Track your progress with precision. Understand your speed, accuracy, and topic-wise strengths with our deep-learning algorithms."
  },
  {
    icon: <FileText className="w-8 h-8 text-accent" />,
    title: "12,500+ Question Bank",
    desc: "Practice with India's most comprehensive repository of JEE Main and Advanced questions, fully solved with alternative methods."
  },
  {
    icon: <BookOpen className="w-8 h-8 text-success" />,
    title: "Smart PYQ Library",
    desc: "Chapter-wise and year-wise previous year questions integrated seamlessly into your daily practice routine."
  },
  {
    icon: <Clock className="w-8 h-8 text-warning" />,
    title: "Real Exam Simulation",
    desc: "Take mock tests in an interface that exactly mirrors the NTA testing environment to eliminate exam-day anxiety."
  },
  {
    icon: <Zap className="w-8 h-8 text-danger" />,
    title: "Lightning Fast Doubts",
    desc: "Get your doubts resolved within minutes by expert faculty and our 24/7 AI teaching assistant."
  }
];

export const FeatureGrid = () => {
  return (
    <section id="features" className="py-24 bg-[#0B1020] relative">
      <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-heading font-bold text-white mb-6"
          >
            Engineered for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Excellence</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-text-secondary"
          >
            Every feature of Quantrex Academy is meticulously designed to maximize your retention, boost your problem-solving speed, and guarantee a top rank.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="group relative p-8 glass-card bg-gradient-to-b from-white/5 to-transparent overflow-hidden"
            >
              {/* Animated Glow on Hover */}
              <div className="absolute -inset-px bg-gradient-to-r from-primary/50 to-accent/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-sm" />
              <div className="absolute inset-0 bg-[#0B1020] m-[1px] rounded-2xl z-0" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-text-secondary leading-relaxed group-hover:text-white/80 transition-colors">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
