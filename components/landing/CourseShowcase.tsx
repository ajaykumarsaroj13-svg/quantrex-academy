"use client";

import { motion } from "framer-motion";
import { Users, Star, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

const courses = [
  {
    title: "JEE Advanced 2027",
    badge: "Foundation",
    desc: "Comprehensive 2-year program for Class 11 students targeting top 100 AIR.",
    duration: "24 Months",
    students: "5.2k",
    rating: "4.9",
    price: "₹12,999",
    color: "from-primary to-accent"
  },
  {
    title: "JEE Main 2026",
    badge: "Target",
    desc: "Intensive 1-year batch for Class 12 students focusing on speed and accuracy.",
    duration: "12 Months",
    students: "8.4k",
    rating: "4.8",
    price: "₹8,999",
    color: "from-secondary to-primary"
  },
  {
    title: "Maths Olympiad",
    badge: "Advanced",
    desc: "Specialized batch for INMO & RMO aspirants. Learn pure mathematics.",
    duration: "6 Months",
    students: "1.1k",
    rating: "5.0",
    price: "₹5,999",
    color: "from-accent to-success"
  }
];

export const CourseShowcase = () => {
  return (
    <section id="courses" className="py-24 bg-[#050816] relative">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-heading font-bold text-white mb-6"
            >
              Premium <span className="gradient-text-alt">Batches</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-text-secondary"
            >
              Enroll in our highly curated batches designed for serious aspirants. Limited seats to ensure personalized mentorship.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/courses" className="text-primary hover:text-white flex items-center gap-2 font-semibold transition-colors group">
              View All Courses <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {courses.map((course, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="group relative bg-[#0B1020]/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-300"
            >
              {/* Card Header / Thumbnail */}
              <div className={`h-40 bg-gradient-to-br ${course.color} relative p-6 flex flex-col justify-between overflow-hidden`}>
                <div className="absolute inset-0 bg-noise mix-blend-overlay opacity-30" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-[50px] rounded-full" />
                
                <div className="relative z-10 flex justify-between items-start">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white uppercase tracking-wider">
                    {course.badge}
                  </span>
                </div>
                <h3 className="relative z-10 text-2xl font-bold text-white">{course.title}</h3>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <p className="text-text-secondary mb-6 h-12">{course.desc}</p>
                
                <div className="grid grid-cols-3 gap-4 border-y border-white/10 py-4 mb-6">
                  <div className="text-center">
                    <Clock className="w-5 h-5 text-white/50 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-white">{course.duration}</p>
                  </div>
                  <div className="text-center border-x border-white/10">
                    <Users className="w-5 h-5 text-white/50 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-white">{course.students}+</p>
                  </div>
                  <div className="text-center">
                    <Star className="w-5 h-5 text-warning mx-auto mb-1" />
                    <p className="text-xs font-semibold text-white">{course.rating}/5</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-white">{course.price}</div>
                  <button className="px-6 py-2.5 bg-white text-[#050816] font-semibold rounded-full hover:bg-primary hover:text-white transition-colors shadow-lg hover:shadow-primary/50">
                    Explore
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
