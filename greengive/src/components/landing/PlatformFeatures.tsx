'use client';

import { motion } from 'framer-motion';

const features = [
  {
    icon: '🏌️',
    title: 'Score Tracking',
    description: 'Enter your last 5 Stableford scores. The newest in, oldest out.',
    badge: 'Stableford 1-45',
  },
  {
    icon: '🎯',
    title: 'Monthly Draws',
    description: 'Every subscriber enters automatically. Match your numbers to win prizes. Jackpot rolls over.',
    badge: 'Draw every 1st',
    badgeColor: 'text-teal-brand border-teal-brand/30 bg-teal-brand/10',
  },
  {
    icon: '💚',
    title: 'Charity Impact',
    description: '10%+ of every subscription goes directly to your chosen charity. See your impact in real time.',
    badge: '47 charities',
    badgeColor: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
  },
];

export default function PlatformFeatures() {
  return (
    <section className="py-24 max-w-6xl mx-auto px-6 relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="text-center mb-16">
        <h2 className="text-xs font-bold tracking-[0.2em] text-gray-500 uppercase">
          Platform Features
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="rounded-2xl bg-ink-2 border border-white/5 p-8 flex flex-col items-start hover:border-white/10 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-ink-3 border border-white/5 flex items-center justify-center text-2xl mb-6 shadow-xl">
              {feature.icon}
            </div>
            
            <h3 className="font-syne text-xl font-bold text-white mb-3">{feature.title}</h3>
            
            <p className="text-gray-400 text-sm leading-relaxed mb-8 flex-1">
              {feature.description}
            </p>
            
            <div className={`mt-auto text-xs font-medium px-3 py-1 rounded-full border ${feature.badgeColor || 'text-gold border-gold/30 bg-gold/5'}`}>
              {feature.badge}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
