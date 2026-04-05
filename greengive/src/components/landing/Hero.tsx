'use client';

import { motion } from 'framer-motion';

import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-16 flex flex-col items-center justify-center text-center px-4 overflow-hidden min-h-[70vh]">
      {}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 inline-flex items-center gap-2 border border-gold/30 bg-gold/5 px-4 py-2 rounded-full"
      >
        <span className="w-2 h-2 rounded-full bg-gold animate-pulse-dot" />
        <span className="text-gold text-xs font-dm font-bold tracking-widest uppercase">Monthly Draw — April 2026 Open</span>
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="font-syne text-6xl md:text-8xl font-black leading-[1.1] tracking-tight mb-6"
      >
        <span className="block text-white">Play golf.</span>
        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-light to-teal-brand">Win big.</span>
        <span className="block text-white">Give back.</span>
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-gray-400 font-dm text-lg md:text-xl max-w-2xl mx-auto mb-10 text-balance leading-relaxed"
      >
        Enter your Stableford scores, compete in monthly prize draws, and give a portion of your subscription to a cause you care about.
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center gap-4 relative z-10"
      >
        <Link href="/auth/signup" className="px-8 py-3 rounded-full bg-white text-ink font-semibold hover:bg-gray-100 transition-colors border border-white">
          Join the Draw <span className="ml-1 opacity-70">→</span>
        </Link>
        <Link href="#how-it-works" className="px-8 py-3 rounded-full bg-transparent text-white border border-white/20 hover:bg-white/5 transition-colors">
          Watch how it works
        </Link>
      </motion.div>
    </section>
  );
}
