'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ReadyToPlay() {
  return (
    <section className="py-24 relative overflow-hidden bg-ink">
      {}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold/5 rounded-[100%] blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-7xl font-syne font-black text-white leading-tight mb-6"
        >
          Ready to play with <br />
          <span className="text-gold">purpose?</span>
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-gray-400 text-lg md:text-xl mb-12 text-balance leading-relaxed"
        >
          Join 3,840 golfers already competing, winning, and giving back every month.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col items-center gap-4"
        >
          <Link 
            href="/auth/signup"
            className="px-8 py-4 rounded-xl bg-[#001f19]/30 border border-white/10 hover:border-white/20 hover:bg-[#001f19]/50 transition-all font-bold text-white text-lg shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
            Subscribe & Enter Draw <span className="ml-2 opacity-70">→</span>
          </Link>
          
          <p className="text-xs text-gray-500 font-medium">
            Cancel any time • Monthly & yearly plans • Secure via Stripe
          </p>
        </motion.div>
        
        <div className="flex justify-center mt-12 bg-ink pb-8">
           <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center text-gray-400">
             ↓
           </div>
        </div>
      </div>
    </section>
  );
}
