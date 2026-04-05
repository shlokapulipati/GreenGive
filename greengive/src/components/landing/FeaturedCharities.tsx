'use client';

import { motion } from 'framer-motion';

const charities = [
  {
    icon: '🏥',
    name: "Children's Hospital Fund",
    raised: '£12,400',
    percent: 78,
  },
  {
    icon: '🌲',
    name: 'Reforestation UK',
    raised: '£8,200',
    percent: 55,
  },
  {
    icon: '⚽',
    name: 'Youth Sports Access',
    raised: '£6,900',
    percent: 43,
  },
];

export default function FeaturedCharities() {
  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-ink to-[#001f19]">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="mb-16">
          <h2 className="text-xs font-bold tracking-[0.2em] text-gray-500 uppercase mb-4">
            Featured Charities
          </h2>
          <h3 className="text-4xl md:text-6xl font-syne font-black text-white leading-tight">
            Your subscription, <br />
            <span className="text-white/30">their lifeline</span>
          </h3>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {charities.map((charity, i) => (
            <motion.div
              key={charity.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-ink-2 border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-colors shadow-2xl"
            >
              <div className="w-12 h-12 rounded-xl bg-ink-3 border border-white/5 flex items-center justify-center text-2xl mb-6">
                {charity.icon}
              </div>
              
              <h4 className="font-syne text-xl font-bold text-white mb-2">{charity.name}</h4>
              <p className="text-gray-400 text-sm mb-8">{charity.raised} raised this year</p>
              
              <div className="space-y-2">
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${charity.percent}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: i * 0.1 + 0.3 }}
                    className="h-full bg-gold rounded-full"
                  />
                </div>
                <div className="text-xs font-bold text-gold">
                  {charity.percent}% of goal
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="flex justify-center mt-12">
          <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer">
            ↓
          </div>
        </div>
      </div>
    </section>
  );
}
