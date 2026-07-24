"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b",
        isScrolled
          ? "bg-[#050816]/80 backdrop-blur-xl border-white/10 py-3 shadow-lg"
          : "bg-transparent border-transparent py-5"
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl group-hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all">
            Q
          </div>
          <span className="text-xl font-heading font-bold text-white tracking-wide">
            Quantrex<span className="text-primary">.</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="#courses">Courses</NavLink>
          <NavLink href="#ai-features">AI Learning</NavLink>
          <NavLink href="#test-series">Test Series</NavLink>
          <NavLink href="#results">Results</NavLink>
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button className="text-text-secondary hover:text-white transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <Link href="/login" className="text-sm font-semibold text-white hover:text-primary transition-colors px-4 py-2">
            Login
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold text-white bg-primary hover:bg-primary/90 px-5 py-2.5 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] transition-all"
          >
            Start Learning
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 w-full bg-[#0B1020]/95 backdrop-blur-xl border-b border-white/10 p-6 flex flex-col gap-4 md:hidden shadow-2xl"
        >
          <Link href="#courses" className="text-lg font-medium text-white">Courses</Link>
          <Link href="#ai-features" className="text-lg font-medium text-white">AI Learning</Link>
          <Link href="#test-series" className="text-lg font-medium text-white">Test Series</Link>
          <Link href="#results" className="text-lg font-medium text-white">Results</Link>
          <hr className="border-white/10 my-2" />
          <Link href="/login" className="text-lg font-medium text-white">Login</Link>
          <Link href="/register" className="text-lg font-medium text-primary">Start Learning</Link>
        </motion.div>
      )}
    </motion.nav>
  );
};

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  return (
    <Link href={href} className="group relative text-sm font-medium text-text-secondary hover:text-white transition-colors py-2">
      {children}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full rounded-full" />
    </Link>
  );
};
