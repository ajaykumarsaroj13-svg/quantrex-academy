"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Star, Award, Shield, Users } from "lucide-react";
import Link from "next/link";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[100vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] md:w-[600px] md:h-[600px] bg-hero-glow rounded-full blur-[120px] opacity-20 animate-pulse-glow" />
        <div className="absolute inset-0 bg-noise mix-blend-overlay opacity-30" />
      </div>

      <div className="container relative z-10 mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-white/90">India's Most Premium IIT JEE Platform</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-heading font-extrabold text-white leading-tight mb-6"
          >
            Concept Creates <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">
              Destiny
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-text-secondary mb-10 max-w-xl leading-relaxed"
          >
            Master Mathematics for IIT JEE with cutting-edge AI, premium video lectures, and a personalized study environment designed for top rankers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link
              href="/register"
              className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-primary text-white font-semibold rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] transition-all hover:-translate-y-1"
            >
              Start Learning
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#demo"
              className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-full backdrop-blur-md transition-all hover:-translate-y-1"
            >
              <Play className="w-5 h-5 fill-white" />
              Watch Demo
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex items-center gap-6 mt-12 pt-8 border-t border-white/10 w-full justify-center lg:justify-start"
          >
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0B1020] bg-gradient-to-br from-primary to-accent" />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 text-warning mb-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-text-secondary">Trusted by 10,000+ JEE Aspirants</p>
            </div>
          </motion.div>
        </div>

        {/* Right Content - Abstract Geometry / UI Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative hidden lg:block"
        >
          {/* Floating UI Elements */}
          <div className="relative w-full aspect-square max-w-lg mx-auto">
            {/* Main Glass Card */}
            <motion.div 
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-[#0B1020]/40 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl p-8 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-primary p-4 shadow-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">∫</span>
                </div>
                <div className="px-3 py-1 bg-success/20 text-success rounded-full text-xs font-semibold">
                  +99.9% Accuracy
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Definite Integration</h3>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-accent w-[75%]" />
                </div>
              </div>
            </motion.div>

            {/* Small Floating Card 1 */}
            <motion.div
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -right-12 top-20 bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-xl flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">AIR Rank</p>
                <p className="text-lg font-bold text-white">Top 100</p>
              </div>
            </motion.div>

            {/* Small Floating Card 2 */}
            <motion.div
              animate={{ x: [-10, 10, -10] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute -left-8 bottom-32 bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-xl flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">AI Analysis</p>
                <p className="text-lg font-bold text-white">Perfect</p>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};
