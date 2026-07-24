"use client";

import { motion } from "framer-motion";
import { Trophy, Flame, Target, BookOpen, Clock, Activity } from "lucide-react";

export const StudentDashboardMockup = () => {
  return (
    <section className="py-24 bg-[#050816] relative">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-heading font-bold text-white mb-6"
          >
            Insights that Drive <span className="gradient-text">Results</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-text-secondary"
          >
            Your entire preparation journey tracked, analyzed, and visualized. Know exactly where you stand and what to study next.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-5xl mx-auto rounded-3xl bg-[#0B1020]/80 backdrop-blur-2xl border border-white/10 p-6 md:p-8 shadow-2xl"
        >
          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Stats */}
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Welcome back, Rahul</h3>
                  <p className="text-sm text-text-secondary">Your JEE Main target is 45 days away.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500">
                  <Flame className="w-4 h-4 fill-current" />
                  <span className="font-bold text-sm">12 Day Streak</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Questions Solved", value: "3,402", trend: "+124 this week", icon: <Target className="w-5 h-5 text-primary" /> },
                  { label: "Study Hours", value: "142h", trend: "Top 5% in batch", icon: <Clock className="w-5 h-5 text-secondary" /> },
                  { label: "Overall Accuracy", value: "78%", trend: "+3.2% vs last test", icon: <Activity className="w-5 h-5 text-success" /> },
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      {stat.icon}
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                    <p className="text-xs text-text-secondary font-medium">{stat.label}</p>
                    <p className="text-[10px] text-white/40 mt-2">{stat.trend}</p>
                  </div>
                ))}
              </div>

              {/* Progress Chart Mockup */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-white text-sm">Mock Test Performance</h4>
                  <div className="flex gap-2 text-xs">
                    <span className="flex items-center gap-1 text-primary"><span className="w-2 h-2 rounded-full bg-primary" /> Score</span>
                    <span className="flex items-center gap-1 text-accent"><span className="w-2 h-2 rounded-full bg-accent" /> Percentile</span>
                  </div>
                </div>
                <div className="h-40 w-full flex items-end gap-2 px-2 pb-2 border-b border-l border-white/10">
                  {[45, 52, 48, 60, 65, 72, 68, 80, 85].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end items-center gap-1 group">
                      <div className="w-full bg-accent/30 rounded-t-sm" style={{ height: `${val + 10}%` }} />
                      <div className="w-full bg-primary rounded-t-sm group-hover:bg-primary/80 transition-colors" style={{ height: `${val}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Leaderboard Snippet */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-secondary/10 to-transparent border border-secondary/20">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-warning" /> Live Leaderboard
                  </h4>
                </div>
                <div className="space-y-3">
                  {[
                    { rank: 1, name: "Aryan S.", score: "284" },
                    { rank: 2, name: "Rahul K.", score: "276", isMe: true },
                    { rank: 3, name: "Priya M.", score: "271" },
                  ].map((user, i) => (
                    <div key={i} className={`flex items-center justify-between p-2 rounded-lg ${user.isMe ? 'bg-secondary/20 border border-secondary/30' : ''}`}>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold ${i === 0 ? 'text-warning' : i === 1 ? 'text-gray-300' : 'text-orange-400'}`}>#{user.rank}</span>
                        <span className="text-sm text-white/90 font-medium">{user.name}</span>
                      </div>
                      <span className="text-sm font-bold text-white">{user.score}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Up */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="font-bold text-white text-sm mb-4">Up Next</h4>
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 mb-3">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-primary font-bold mb-1">LIVE LECTURE</p>
                      <p className="text-sm font-bold text-white leading-tight">Vectors & 3D Geometry</p>
                      <p className="text-xs text-text-secondary mt-1">Today, 6:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
